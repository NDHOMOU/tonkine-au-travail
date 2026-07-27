package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.response.MesProgresResponse;
import cm.tonkine.backend.dto.response.PointHebdoResponse;
import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.SessionTravailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Évolution personnelle de l'employé dans le temps (son propre score de
 * posture, ses propres pauses) — l'équivalent individuel de l'aide à la
 * décision de l'admin, mais pour que l'employé voie ses propres progrès.
 */
@Service
@RequiredArgsConstructor
public class MesProgresService {

    private static final int NB_SEMAINES = 6;

    private final SessionTravailRepository sessionRepository;

    @Transactional(readOnly = true)
    public MesProgresResponse genererProgres(Utilisateur utilisateur) {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime depuis = maintenant.minusWeeks(NB_SEMAINES);

        List<SessionTravail> sessions = sessionRepository
            .findByUtilisateurAndPeriode(utilisateur.getId(), depuis);

        Set<Integer> semainesAvecDonnees = sessions.stream()
            .map(s -> semaineIndex(s.getDateDebut(), maintenant))
            .collect(Collectors.toSet());

        return MesProgresResponse.builder()
            .tendanceScore(tendanceScore(sessions, maintenant))
            .tendancePauses(tendancePauses(sessions, maintenant))
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

    private List<PointHebdoResponse> tendanceScore(List<SessionTravail> sessions, LocalDateTime maintenant) {
        Map<Integer, List<Double>> parSemaine = new TreeMap<>();
        for (SessionTravail s : sessions) {
            if (s.getScoreGlobal() == null) continue;
            int semaine = semaineIndex(s.getDateDebut(), maintenant);
            parSemaine.computeIfAbsent(semaine, k -> new ArrayList<>()).add(s.getScoreGlobal());
        }

        List<PointHebdoResponse> resultat = new ArrayList<>();
        for (int semaine = NB_SEMAINES - 1; semaine >= 0; semaine--) {
            List<Double> scores = parSemaine.get(semaine);
            Double moyenne = (scores == null || scores.isEmpty()) ? null
                : Math.round(scores.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10.0) / 10.0;
            resultat.add(PointHebdoResponse.builder().semaine(etiquetteSemaine(semaine)).valeur(moyenne).build());
        }
        return resultat;
    }

    private List<PointHebdoResponse> tendancePauses(List<SessionTravail> sessions, LocalDateTime maintenant) {
        Map<Integer, Integer> parSemaine = new TreeMap<>();
        for (SessionTravail s : sessions) {
            int semaine = semaineIndex(s.getDateDebut(), maintenant);
            parSemaine.merge(semaine, s.getNombrePausesEffectuees() == null ? 0 : s.getNombrePausesEffectuees(), Integer::sum);
        }

        List<PointHebdoResponse> resultat = new ArrayList<>();
        for (int semaine = NB_SEMAINES - 1; semaine >= 0; semaine--) {
            Integer total = parSemaine.get(semaine);
            resultat.add(PointHebdoResponse.builder()
                .semaine(etiquetteSemaine(semaine))
                .valeur(total != null ? total.doubleValue() : null)
                .build());
        }
        return resultat;
    }
}
