package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.response.AnalyseDecisionResponse;
import cm.tonkine.backend.dto.response.EmployeADegradationResponse;
import cm.tonkine.backend.dto.response.PointHebdoResponse;
import cm.tonkine.backend.dto.response.TendanceDepartementResponse;
import cm.tonkine.backend.entity.Alerte;
import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.repository.AlerteRepository;
import cm.tonkine.backend.repository.SessionTravailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Aide à la décision RH : dégage des tendances dans le temps à partir des
 * sessions de travail et des alertes déjà collectées — sans utiliser de
 * donnée sensible comme l'âge (délibérément écarté).
 *
 * Découpe la fenêtre d'analyse en semaines glissantes : index 0 = semaine en
 * cours, index NB_SEMAINES-1 = la plus ancienne.
 */
@Service
@RequiredArgsConstructor
public class AnalyseDecisionService {

    private static final int NB_SEMAINES = 6;
    /** Dégradation minimale (en points) pour signaler un employé. */
    private static final double SEUIL_DEGRADATION = 5.0;

    private final SessionTravailRepository sessionRepository;
    private final AlerteRepository         alerteRepository;

    public AnalyseDecisionResponse genererAnalyse(Long entrepriseId) {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime depuis = maintenant.minusWeeks(NB_SEMAINES);

        List<SessionTravail> sessions = sessionRepository.findDepuisParEntreprise(entrepriseId, depuis);
        List<Alerte> alertes = alerteRepository.findDepuisParEntreprise(entrepriseId, depuis);

        Set<Integer> semainesAvecDonnees = sessions.stream()
            .map(s -> semaineIndex(s.getDateDebut(), maintenant))
            .collect(Collectors.toSet());

        return AnalyseDecisionResponse.builder()
            .tendanceParDepartement(tendanceParDepartement(sessions, maintenant))
            .employesADegradation(employesADegradation(sessions, maintenant))
            .tauxSuiviAlertes(tauxSuiviAlertes(alertes, maintenant))
            .donneesInsuffisantes(semainesAvecDonnees.size() < 2)
            .build();
    }

    private int semaineIndex(LocalDateTime date, LocalDateTime maintenant) {
        long jours = ChronoUnit.DAYS.between(date.toLocalDate(), maintenant.toLocalDate());
        int index = (int) (jours / 7);
        return Math.min(Math.max(index, 0), NB_SEMAINES - 1);
    }

    private String etiquetteSemaine(int index) {
        return index == 0 ? "Cette semaine" : "Il y a " + index + " semaine" + (index > 1 ? "s" : "");
    }

    private List<TendanceDepartementResponse> tendanceParDepartement(
            List<SessionTravail> sessions, LocalDateTime maintenant) {

        Map<String, Map<Integer, List<Double>>> parDeptEtSemaine = new TreeMap<>();

        for (SessionTravail s : sessions) {
            Utilisateur u = s.getUtilisateur();
            if (u.getDepartement() == null || s.getScoreGlobal() == null) continue;
            int semaine = semaineIndex(s.getDateDebut(), maintenant);
            parDeptEtSemaine
                .computeIfAbsent(u.getDepartement(), d -> new TreeMap<>())
                .computeIfAbsent(semaine, w -> new ArrayList<>())
                .add(s.getScoreGlobal());
        }

        List<TendanceDepartementResponse> resultat = new ArrayList<>();
        for (Map.Entry<String, Map<Integer, List<Double>>> deptEntry : parDeptEtSemaine.entrySet()) {
            List<PointHebdoResponse> points = new ArrayList<>();
            for (int semaine = NB_SEMAINES - 1; semaine >= 0; semaine--) {
                List<Double> scores = deptEntry.getValue().get(semaine);
                Double moyenne = (scores == null || scores.isEmpty()) ? null
                    : Math.round(scores.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10.0) / 10.0;
                points.add(PointHebdoResponse.builder()
                    .semaine(etiquetteSemaine(semaine))
                    .valeur(moyenne)
                    .build());
            }
            resultat.add(TendanceDepartementResponse.builder()
                .departement(deptEntry.getKey())
                .points(points)
                .build());
        }
        return resultat;
    }

    private List<EmployeADegradationResponse> employesADegradation(
            List<SessionTravail> sessions, LocalDateTime maintenant) {

        Map<Utilisateur, List<SessionTravail>> parEmploye = sessions.stream()
            .filter(s -> s.getScoreGlobal() != null)
            .collect(Collectors.groupingBy(SessionTravail::getUtilisateur));

        List<EmployeADegradationResponse> resultat = new ArrayList<>();

        for (Map.Entry<Utilisateur, List<SessionTravail>> entry : parEmploye.entrySet()) {
            Utilisateur u = entry.getKey();
            double recent = moyenneSurSemaines(entry.getValue(), maintenant, 0, 1);
            double precedent = moyenneSurSemaines(entry.getValue(), maintenant, 2, 3);

            if (Double.isNaN(recent) || Double.isNaN(precedent)) continue;

            double variation = Math.round((recent - precedent) * 10.0) / 10.0;
            if (variation <= -SEUIL_DEGRADATION) {
                resultat.add(EmployeADegradationResponse.builder()
                    .nomComplet(u.getNomComplet())
                    .departement(u.getDepartement())
                    .scoreRecent(Math.round(recent * 10.0) / 10.0)
                    .scorePrecedent(Math.round(precedent * 10.0) / 10.0)
                    .variation(variation)
                    .build());
            }
        }

        resultat.sort(Comparator.comparingDouble(EmployeADegradationResponse::getVariation));
        return resultat.size() > 10 ? resultat.subList(0, 10) : resultat;
    }

    private double moyenneSurSemaines(List<SessionTravail> sessions, LocalDateTime maintenant, int semaineMin, int semaineMax) {
        List<Double> scores = sessions.stream()
            .filter(s -> {
                int idx = semaineIndex(s.getDateDebut(), maintenant);
                return idx >= semaineMin && idx <= semaineMax;
            })
            .map(SessionTravail::getScoreGlobal)
            .collect(Collectors.toList());
        return scores.isEmpty() ? Double.NaN : scores.stream().mapToDouble(Double::doubleValue).average().orElse(Double.NaN);
    }

    private List<PointHebdoResponse> tauxSuiviAlertes(List<Alerte> alertes, LocalDateTime maintenant) {
        Map<Integer, List<Alerte>> parSemaine = alertes.stream()
            .collect(Collectors.groupingBy(a -> semaineIndex(a.getDateEnvoi(), maintenant)));

        List<PointHebdoResponse> resultat = new ArrayList<>();
        for (int semaine = NB_SEMAINES - 1; semaine >= 0; semaine--) {
            List<Alerte> du = parSemaine.get(semaine);
            Double taux = null;
            if (du != null && !du.isEmpty()) {
                long traitees = du.stream().filter(a -> a.getStatut() == StatutAlerte.PAUSE_EFFECTUEE).count();
                taux = Math.round((traitees * 100.0 / du.size()) * 10.0) / 10.0;
            }
            resultat.add(PointHebdoResponse.builder()
                .semaine(etiquetteSemaine(semaine))
                .valeur(taux)
                .build());
        }
        return resultat;
    }
}
