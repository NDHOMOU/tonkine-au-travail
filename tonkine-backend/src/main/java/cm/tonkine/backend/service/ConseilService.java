package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.request.ConseilSanteRequest;
import cm.tonkine.backend.dto.request.ReponseConseilRequest;
import cm.tonkine.backend.dto.response.ConseilSanteResponse;
import cm.tonkine.backend.entity.ConseilSante;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import cm.tonkine.backend.enums.StatutConseil;
import cm.tonkine.backend.enums.ZoneCorps;
import cm.tonkine.backend.repository.ConseilSanteRepository;
import cm.tonkine.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service gérant les consultations en ligne employé ↔ kinésithérapeute.
 * Le kiné de l'entreprise est automatiquement déterminé depuis l'entreprise de l'employé.
 */
@Service
@RequiredArgsConstructor
public class ConseilService {

    private final ConseilSanteRepository conseilRepository;
    private final UtilisateurRepository  utilisateurRepository;

    /**
     * Pose une question de conseil kinésithérapique.
     * Le kiné de l'entreprise est automatiquement assigné.
     */
    @Transactional
    public ConseilSanteResponse poserQuestion(Utilisateur employe, ConseilSanteRequest req) {
        // Trouve le kiné de l'entreprise de l'employé
        Utilisateur kine = utilisateurRepository
            .findByEntrepriseIdAndRole(employe.getEntreprise().getId(), Role.KINESITHERAPEUTE)
            .orElseThrow(() -> new IllegalStateException(
                "Aucun kinésithérapeute enregistré pour cette entreprise. " +
                "Contactez votre administrateur RH."
            ));

        ZoneCorps zone = null;
        if (req.getZoneConcernee() != null && !req.getZoneConcernee().isBlank()) {
            try { zone = ZoneCorps.valueOf(req.getZoneConcernee()); }
            catch (IllegalArgumentException ignored) { /* zone inconnue → null */ }
        }

        ConseilSante conseil = ConseilSante.builder()
            .employe(employe)
            .kine(kine)
            .entreprise(employe.getEntreprise())
            .question(req.getQuestion())
            .zoneConcernee(zone)
            .niveauUrgence(
                "URGENT".equals(req.getNiveauUrgence()) ? "URGENT" : "NORMAL"
            )
            .build();

        return toResponse(conseilRepository.save(conseil));
    }

    /**
     * Le kiné marque une demande comme "vue" (statut VU).
     * Appelé dès que le kiné ouvre la demande dans son dashboard.
     */
    @Transactional
    public ConseilSanteResponse marquerVu(Long conseilId, Utilisateur kine) {
        ConseilSante conseil = getConseilPourKine(conseilId, kine);

        if (conseil.getStatut() == StatutConseil.EN_ATTENTE) {
            conseil.setStatut(StatutConseil.VU);
            conseil.setDateVue(LocalDateTime.now());
            conseilRepository.save(conseil);
        }
        return toResponse(conseil);
    }

    /**
     * Le kiné envoie sa réponse kinésithérapique.
     */
    @Transactional
    public ConseilSanteResponse repondre(Long conseilId, Utilisateur kine, ReponseConseilRequest req) {
        ConseilSante conseil = getConseilPourKine(conseilId, kine);

        conseil.setReponse(req.getReponse());
        conseil.setStatut(StatutConseil.REPONDU);
        conseil.setDateReponse(LocalDateTime.now());
        if (conseil.getDateVue() == null) {
            conseil.setDateVue(LocalDateTime.now());
        }

        return toResponse(conseilRepository.save(conseil));
    }

    /** Historique des conseils d'un employé */
    @Transactional(readOnly = true)
    public List<ConseilSanteResponse> getMesConseils(Utilisateur employe) {
        return conseilRepository
            .findByEmployeIdOrderByDateQuestionDesc(employe.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** File d'attente du kiné (urgents d'abord) */
    @Transactional(readOnly = true)
    public List<ConseilSanteResponse> getFileKine(Utilisateur kine) {
        return conseilRepository
            .findByKineIdOrderByUrgenceEtDate(kine.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ──

    private ConseilSante getConseilPourKine(Long conseilId, Utilisateur kine) {
        ConseilSante conseil = conseilRepository.findById(conseilId)
            .orElseThrow(() -> new IllegalArgumentException("Demande introuvable : " + conseilId));

        if (!conseil.getKine().getId().equals(kine.getId())) {
            throw new SecurityException("Cette demande n'appartient pas à votre file");
        }
        return conseil;
    }

    public ConseilSanteResponse toResponse(ConseilSante c) {
        long minutes = ChronoUnit.MINUTES.between(c.getDateQuestion(), LocalDateTime.now());
        return ConseilSanteResponse.builder()
            .id(c.getId())
            .employeId(c.getEmploye().getId())
            .nomEmploye(c.getEmploye().getNomComplet())
            .departementEmploye(c.getEmploye().getDepartement())
            .posteEmploye(c.getEmploye().getPoste())
            .question(c.getQuestion())
            .zoneConcernee(c.getZoneConcernee() != null ? c.getZoneConcernee().name() : null)
            .niveauUrgence(c.getNiveauUrgence())
            .statut(c.getStatut())
            .reponse(c.getReponse())
            .dateQuestion(c.getDateQuestion())
            .dateVue(c.getDateVue())
            .dateReponse(c.getDateReponse())
            .minutesDepuisQuestion(minutes)
            .build();
    }
}
