package cm.tonkine.backend.service;

import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.SessionTravailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Génère le rapport postural hebdomadaire au format CSV (téléchargeable),
 * pour l'Admin RH et le Kinésithérapeute — l'acheminement (email, Slack…)
 * reste manuel, à la charge de la personne qui le télécharge.
 */
@Service
@RequiredArgsConstructor
public class RapportService {

    private final SessionTravailRepository sessionRepository;

    public String genererRapportHebdomadaireCsv(Long entrepriseId) {
        LocalDateTime depuis = LocalDateTime.now().minusDays(7);
        List<SessionTravail> sessions = sessionRepository.findDepuisParEntreprise(entrepriseId, depuis);

        Map<Utilisateur, List<SessionTravail>> parEmploye = sessions.stream()
            .collect(Collectors.groupingBy(SessionTravail::getUtilisateur, LinkedHashMap::new, Collectors.toList()));

        StringBuilder csv = new StringBuilder();
        csv.append("Employe;Departement;Nombre de sessions;Score moyen posture (%);Temps assis total (h);Alertes recues;Alertes ignorees\n");

        for (Map.Entry<Utilisateur, List<SessionTravail>> entry : parEmploye.entrySet()) {
            Utilisateur u = entry.getKey();
            List<SessionTravail> ses = entry.getValue();

            double scoreMoyen = ses.stream()
                .filter(s -> s.getScoreGlobal() != null)
                .mapToDouble(SessionTravail::getScoreGlobal)
                .average().orElse(0.0);

            long secondesAssis = ses.stream()
                .mapToLong(SessionTravail::getDureeAssisTotalSecondes)
                .sum();

            int alertesEnvoyees = ses.stream().mapToInt(SessionTravail::getNombreAlertesEnvoyees).sum();
            int alertesIgnorees = ses.stream().mapToInt(SessionTravail::getNombreAlertesIgnorees).sum();

            csv.append(csvSafe(u.getNomComplet())).append(';')
               .append(csvSafe(u.getDepartement())).append(';')
               .append(ses.size()).append(';')
               .append(String.format(Locale.FRANCE, "%.1f", scoreMoyen)).append(';')
               .append(String.format(Locale.FRANCE, "%.1f", secondesAssis / 3600.0)).append(';')
               .append(alertesEnvoyees).append(';')
               .append(alertesIgnorees).append('\n');
        }

        if (parEmploye.isEmpty()) {
            csv.append("Aucune session enregistree sur les 7 derniers jours\n");
        }

        return csv.toString();
    }

    public String nomFichierRapport() {
        return "rapport-hebdomadaire-" + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + ".csv";
    }

    private String csvSafe(String valeur) {
        if (valeur == null) return "";
        return valeur.replace(';', ',').replace('\n', ' ');
    }
}
