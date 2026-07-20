package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.ReservationRdvRequest;
import cm.tonkine.backend.dto.response.RdvKineResponse;
import cm.tonkine.backend.entity.Entreprise;
import cm.tonkine.backend.entity.RendezVous;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import cm.tonkine.backend.enums.StatutRdv;
import cm.tonkine.backend.repository.RendezVousRepository;
import cm.tonkine.backend.repository.UtilisateurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestion des rendez-vous avec le kinésithérapeute de l'entreprise.
 * Base URL : /api/rdv
 *
 * Pas d'annuaire kiné — le kiné est unique par entreprise.
 * Il est automatiquement déterminé depuis l'entreprise de l'employé.
 */
@RestController
@RequestMapping("/rdv")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousRepository   rdvRepository;
    private final UtilisateurRepository  utilisateurRepository;

    /**
     * GET /api/rdv/creneaux-disponibles?date=2026-06-15
     * Créneaux libres du kinésithérapeute de l'entreprise pour une date donnée.
     * Le kiné est automatiquement déterminé depuis l'entreprise de l'employé.
     */
    @GetMapping("/creneaux-disponibles")
    public ResponseEntity<List<String>> getCreneauxDisponibles(
            @RequestParam String date,
            @AuthenticationPrincipal Utilisateur employe) {

        Utilisateur kine = getKineEntreprise(employe);
        LocalDate localDate = LocalDate.parse(date);

        List<RendezVous> rdvPris = rdvRepository
            .findByKineIdAndDateRdvOrderByHeureDebutAsc(kine.getId(), localDate);

        // Créneaux standard : 08:30 → 12:00 et 14:00 → 17:30 (toutes les 45 min)
        List<String> tousCreneaux = List.of(
            "08:30", "09:15", "10:00", "10:45", "11:30",
            "14:00", "14:45", "15:30", "16:15", "17:00"
        );

        List<String> pris = rdvPris.stream()
            .filter(r -> r.getStatut() != StatutRdv.ANNULE)
            .map(r -> r.getHeureDebut().toString().substring(0, 5))
            .toList();

        List<String> disponibles = tousCreneaux.stream()
            .filter(c -> !pris.contains(c))
            .collect(Collectors.toList());

        return ResponseEntity.ok(disponibles);
    }

    /**
     * GET /api/rdv/kine-info
     * Informations sur le kinésithérapeute de l'entreprise
     * (pour afficher sa fiche dans la page RDV).
     */
    @GetMapping("/kine-info")
    public ResponseEntity<Map<String, Object>> getKineInfo(
            @AuthenticationPrincipal Utilisateur employe) {

        Utilisateur kine = getKineEntreprise(employe);
        return ResponseEntity.ok(Map.of(
            "id",         kine.getId(),
            "nomComplet", kine.getNomComplet(),
            "prenom",     kine.getPrenom(),
            "nom",        kine.getNom(),
            "email",      kine.getEmail()
        ));
    }

    /**
     * POST /api/rdv/reserver
     * Réserve un créneau avec le kiné de l'entreprise.
     */
    @PostMapping("/reserver")
    public ResponseEntity<?> reserver(
            @Valid @RequestBody ReservationRdvRequest req,
            @AuthenticationPrincipal Utilisateur employe) {

        Utilisateur kine = getKineEntreprise(employe);
        Entreprise entreprise = employe.getEntreprise();

        // Vérifie que le créneau est encore libre
        boolean crenauPris = rdvRepository.isCreneauPris(
            kine.getId(), req.getDateRdv(), req.getHeureDebut()
        );
        if (crenauPris) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("erreur", "Ce créneau vient d'être pris. Choisissez un autre."));
        }

        RendezVous rdv = RendezVous.builder()
            .employe(employe)
            .kine(kine)
            .entreprise(entreprise)
            .dateRdv(req.getDateRdv())
            .heureDebut(req.getHeureDebut())
            .motif(req.getMotif())
            .statut(StatutRdv.CONFIRME)
            .build();

        RendezVous saved = rdvRepository.save(rdv);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id",         saved.getId(),
            "dateRdv",    saved.getDateRdv().toString(),
            "heureDebut", saved.getHeureDebut().toString(),
            "statut",     saved.getStatut().name(),
            "kineNom",    kine.getNomComplet()
        ));
    }

    /**
     * GET /api/rdv/mes-rdv
     * Historique et prochains RDV de l'employé connecté.
     */
    @GetMapping("/mes-rdv")
    public ResponseEntity<List<Map<String, Object>>> getMesRdv(
            @AuthenticationPrincipal Utilisateur employe) {

        List<RendezVous> rdvs = rdvRepository
            .findByEmployeIdOrderByDateRdvDesc(employe.getId());

        List<Map<String, Object>> result = rdvs.stream().map(rdv -> Map.<String, Object>of(
            "id",           rdv.getId(),
            "dateRdv",      rdv.getDateRdv().toString(),
            "heureDebut",   rdv.getHeureDebut().toString(),
            "dureeMinutes", rdv.getDureeMinutes(),
            "statut",       rdv.getStatut().name(),
            "motif",        rdv.getMotif() != null ? rdv.getMotif() : "",
            "kineNom",      rdv.getKine().getNomComplet()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/rdv/{rdvId}
     * Annulation d'un RDV par l'employé.
     */
    @DeleteMapping("/{rdvId}")
    public ResponseEntity<Void> annulerRdv(
            @PathVariable Long rdvId,
            @AuthenticationPrincipal Utilisateur employe) {

        rdvRepository.findById(rdvId).ifPresent(rdv -> {
            if (rdv.getEmploye().getId().equals(employe.getId())) {
                rdv.setStatut(StatutRdv.ANNULE);
                rdvRepository.save(rdv);
            }
        });
        return ResponseEntity.noContent().build();
    }

    // ── Helper : trouve le kiné de l'entreprise de l'employé ──
    private Utilisateur getKineEntreprise(Utilisateur employe) {
        if (employe.getEntreprise() == null) {
            throw new IllegalStateException(
                "Votre compte n'est pas rattaché à une entreprise. Contactez votre administrateur."
            );
        }
        return utilisateurRepository
            .findByEntrepriseIdAndRole(employe.getEntreprise().getId(), Role.KINESITHERAPEUTE)
            .orElseThrow(() -> new IllegalStateException(
                "Aucun kinésithérapeute n'est encore enregistré dans votre entreprise. " +
                "Demandez à votre administrateur RH d'ajouter le compte kiné."
            ));
    }
}
