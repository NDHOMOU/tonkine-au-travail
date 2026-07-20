package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.response.*;
import cm.tonkine.backend.entity.RendezVous;
import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import cm.tonkine.backend.enums.StatutConseil;
import cm.tonkine.backend.enums.StatutRdv;
import cm.tonkine.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service du tableau de bord clinique du kinésithérapeute.
 * Agrège toutes les données nécessaires à la prise de décision :
 *  - Posture des employés en temps réel
 *  - Inactifs (app non lancée)
 *  - File de conseils en attente
 *  - Planning RDV
 */
@Service
@RequiredArgsConstructor
public class KineService {

    private final UtilisateurRepository    utilisateurRepository;
    private final SessionTravailRepository sessionRepository;
    private final ConseilSanteRepository   conseilRepository;
    private final RendezVousRepository     rdvRepository;
    private final ConseilService           conseilService;
    private final ProfilErgonomiqueRepository profilRepository;

    /**
     * Construit le tableau de bord complet du kiné.
     */
    @Transactional(readOnly = true)
    public DashboardKineResponse getDashboard(Utilisateur kine) {
        Long entrepriseId = kine.getEntreprise().getId();
        LocalDateTime debutJournee = LocalDate.now().atStartOfDay();

        // 1. Sessions actives en cours
        List<SessionTravail> sessionsActives =
            sessionRepository.findSessionsActivesAujourdhui(debutJournee);

        // 2. Tous les employés de l'entreprise
        long totalEmployes = utilisateurRepository
            .countByEntrepriseIdAndRoleAndActifTrue(entrepriseId, Role.EMPLOYE);

        // 3. Employés sans app active
        List<Utilisateur> inactifs =
            utilisateurRepository.findEmployesSansSessionActive(entrepriseId);

        // 4. Score moyen équipe
        double scoreMoyen = sessionsActives.stream()
            .filter(s -> s.getScoreGlobal() != null)
            .mapToDouble(SessionTravail::getScoreGlobal)
            .average().orElse(0.0);

        // 5. Patients à risque postural (score < 60)
        List<PatientSuiviKineResponse> patientsARisque = sessionsActives.stream()
            .filter(s -> s.getScoreGlobal() != null && s.getScoreGlobal() < 60.0)
            .map(s -> toPatientResponse(s, entrepriseId))
            .collect(Collectors.toList());

        // 6. Patients inactifs
        List<PatientSuiviKineResponse> patientsInactifs = inactifs.stream()
            .map(u -> PatientSuiviKineResponse.builder()
                .userId(u.getId())
                .nomComplet(u.getNomComplet())
                .departement(u.getDepartement())
                .poste(u.getPoste())
                .appActive(false)
                .douleursDeclarees(
                    u.getProfil() != null ? u.getProfil().getDouleursDeclarees() : null
                )
                .aConseilEnAttente(false)
                .build())
            .collect(Collectors.toList());

        // 7. File de conseils
        List<ConseilSanteResponse> conseils =
            conseilService.getFileKine(kine);

        long conseilsEnAttente = conseilRepository
            .countByKineIdAndStatutNot(kine.getId(), StatutConseil.REPONDU);
        long conseilsUrgents = conseilRepository
            .countByKineIdAndNiveauUrgenceAndStatutNot(kine.getId(), "URGENT", StatutConseil.REPONDU);

        // 8. Prochains RDV (aujourd'hui + 7 prochains jours)
        List<RendezVous> rdvs = rdvRepository
            .findByKineIdAndDateRdvBetweenOrderByDateRdvAscHeureDebutAsc(
                kine.getId(), LocalDate.now(), LocalDate.now().plusDays(7));

        List<RdvKineResponse> prochainRdv = rdvs.stream()
            .filter(r -> r.getStatut() != StatutRdv.ANNULE)
            .map(this::toRdvKineResponse)
            .collect(Collectors.toList());

        return DashboardKineResponse.builder()
            .totalEmployes(totalEmployes)
            .employesActifsAujourdhui(sessionsActives.size())
            .employesAppInactive(inactifs.size())
            .scoreMoyenEquipe(Math.round(scoreMoyen * 10.0) / 10.0)
            .conseilsEnAttente(conseilsEnAttente)
            .conseilsUrgents(conseilsUrgents)
            .employesARisquePostural(patientsARisque.size())
            .patientsARisque(patientsARisque)
            .patientsInactifs(patientsInactifs)
            .conseilsFile(conseils)
            .prochainRdv(prochainRdv)
            .build();
    }

    /**
     * Vue détaillée d'un patient pour le kiné.
     */
    @Transactional(readOnly = true)
    public PatientSuiviKineResponse getDetailPatient(Long employeId, Utilisateur kine) {
        Utilisateur employe = utilisateurRepository.findById(employeId)
            .orElseThrow(() -> new IllegalArgumentException("Employé introuvable"));

        // Vérification même entreprise
        if (!employe.getEntreprise().getId().equals(kine.getEntreprise().getId())) {
            throw new SecurityException("Cet employé n'appartient pas à votre entreprise");
        }

        // Session active si elle existe
        LocalDateTime debutJournee = LocalDate.now().atStartOfDay();
        List<SessionTravail> sessions =
            sessionRepository.findSessionsActivesAujourdhui(debutJournee);

        SessionTravail sessionActive = sessions.stream()
            .filter(s -> s.getUtilisateur().getId().equals(employeId))
            .findFirst().orElse(null);

        return toPatientResponse(sessionActive, employe);
    }

    /**
     * Le kiné ajoute des notes cliniques après une séance.
     */
    @Transactional
    public void ajouterNotesSeance(Long rdvId, String notes, Utilisateur kine) {
        RendezVous rdv = rdvRepository.findById(rdvId)
            .orElseThrow(() -> new IllegalArgumentException("RDV introuvable : " + rdvId));

        if (!rdv.getKine().getId().equals(kine.getId())) {
            throw new SecurityException("Ce RDV n'est pas dans votre agenda");
        }

        rdv.setNotesSeance(notes);
        rdv.setStatut(cm.tonkine.backend.enums.StatutRdv.EFFECTUE);
        rdvRepository.save(rdv);
    }

    // ── Helpers ──

    private PatientSuiviKineResponse toPatientResponse(SessionTravail session, Long entrepriseId) {
        return toPatientResponse(session, session.getUtilisateur());
    }

    private PatientSuiviKineResponse toPatientResponse(SessionTravail session, Utilisateur employe) {
        boolean hasSession = session != null;

        boolean aConseil = conseilRepository
            .findByEmployeIdOrderByDateQuestionDesc(employe.getId())
            .stream().anyMatch(c -> c.getStatut() != StatutConseil.REPONDU);

        String urgenceConseil = conseilRepository
            .findByEmployeIdOrderByDateQuestionDesc(employe.getId())
            .stream()
            .filter(c -> c.getStatut() != StatutConseil.REPONDU)
            .map(c -> c.getNiveauUrgence())
            .findFirst().orElse(null);

        long dureeAssis = hasSession ? session.getDureeAssisTotalSecondes() : 0L;
        int pauses = hasSession ? session.getNombrePausesEffectuees() : 0;

        return PatientSuiviKineResponse.builder()
            .userId(employe.getId())
            .nomComplet(employe.getNomComplet())
            .departement(employe.getDepartement())
            .poste(employe.getPoste())
            .scorePostureGlobal(hasSession ? session.getScoreGlobal() : null)
            .scoreDos(hasSession ? session.getScoreDosColonne() : null)
            .scoreNuque(hasSession ? session.getScoreNuque() : null)
            .scoreEpaules(hasSession ? session.getScoreEpaules() : null)
            .scorePoignets(hasSession ? session.getScorePoignets() : null)
            .dureeAssisCourantSecondes(dureeAssis)
            .depassementTempsAssis(dureeAssis > 7200)
            .pausesEffectueesAujourdhui(pauses)
            .pausesObjectifAujourdhui(4)
            .respectePausesActives(pauses >= 4)
            .appActive(hasSession && session.getDateFin() == null)
            .douleursDeclarees(
                employe.getProfil() != null ? employe.getProfil().getDouleursDeclarees() : null
            )
            .aConseilEnAttente(aConseil)
            .niveauUrgenceConseil(urgenceConseil)
            .build();
    }

    private RdvKineResponse toRdvKineResponse(RendezVous rdv) {
        String douleurs = rdv.getEmploye().getProfil() != null
            ? rdv.getEmploye().getProfil().getDouleursDeclarees() : null;

        return RdvKineResponse.builder()
            .id(rdv.getId())
            .employeId(rdv.getEmploye().getId())
            .nomEmploye(rdv.getEmploye().getNomComplet())
            .departement(rdv.getEmploye().getDepartement())
            .douleursDeclarees(douleurs)
            .dateRdv(rdv.getDateRdv())
            .heureDebut(rdv.getHeureDebut())
            .dureeMinutes(rdv.getDureeMinutes())
            .statut(rdv.getStatut())
            .motif(rdv.getMotif())
            .notesSeance(rdv.getNotesSeance())
            .build();
    }
}
