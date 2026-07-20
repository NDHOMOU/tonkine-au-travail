package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.response.*;
import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import cm.tonkine.backend.repository.AlerteRepository;
import cm.tonkine.backend.repository.SessionTravailRepository;
import cm.tonkine.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Tableau de bord Admin RH.
 * Toutes les routes nécessitent le rôle ADMIN_RH.
 * Base URL : /api/admin
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN_RH')")
@RequiredArgsConstructor
public class AdminController {

    private final UtilisateurRepository    utilisateurRepository;
    private final SessionTravailRepository sessionRepository;
    private final AlerteRepository         alerteRepository;

    /**
     * GET /api/admin/dashboard
     * Vue d'ensemble complète pour le RH — isolée par entreprise (multi-tenant).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAdminResponse> getDashboard(
            @AuthenticationPrincipal Utilisateur adminRh) {

        // SÉCURITÉ : chaque admin ne voit que les données de son entreprise
        Long entrepriseId = adminRh.getEntreprise() != null
            ? adminRh.getEntreprise().getId() : null;

        if (entrepriseId == null) {
            return ResponseEntity.status(403).build();
        }

        LocalDateTime debutJournee = LocalDateTime.now().withHour(0).withMinute(0);

        // Sessions actives aujourd'hui — FILTRÉES par entreprise
        List<SessionTravail> sessionsActives =
            sessionRepository.findSessionsActivesAujourdhuiParEntreprise(debutJournee, entrepriseId);

        // Score moyen équipe
        double scoreMoyen = sessionsActives.stream()
            .filter(s -> s.getScoreGlobal() != null)
            .mapToDouble(SessionTravail::getScoreGlobal)
            .average().orElse(0.0);

        // Employés à risque élevé (score < 60)
        long nbARisque = sessionsActives.stream()
            .filter(s -> s.getScoreGlobal() != null && s.getScoreGlobal() < 60.0)
            .count();

        // Alertes non traitées — FILTRÉES par entreprise
        long alertesNonTraitees = alerteRepository
            .findAlertesNonTraiteesParEntreprise(entrepriseId).size();

        // Stats départements
        List<StatDepartementResponse> statsDepts = calculerStatsDepartements(sessionsActives);

        // Suivi des employés actifs
        List<SuiviEmployeResponse> suiviEmployes = sessionsActives.stream()
            .map(this::toSuiviResponse)
            .collect(Collectors.toList());

        // Alertes récentes — FILTRÉES par entreprise
        List<AlerteAdminResponse> alertesRecentes = alerteRepository
            .findAlertesNonTraiteesParEntreprise(entrepriseId).stream()
            .limit(10)
            .map(a -> AlerteAdminResponse.builder()
                .id(a.getId())
                .nomEmploye(a.getUtilisateur().getNomComplet())
                .departement(a.getUtilisateur().getDepartement())
                .type(a.getType())
                .statut(a.getStatut())
                .scorePosture(a.getSession() != null ? a.getSession().getScoreGlobal() : null)
                .dureeAssiSecondes(a.getDureeAssiAvantAlerteSecondes())
                .dateEnvoi(a.getDateEnvoi())
                .build())
            .collect(Collectors.toList());

        // Compte uniquement les employés de cette entreprise
        long totalInscrits = alerteRepository.countByEntreprise(entrepriseId);

        return ResponseEntity.ok(DashboardAdminResponse.builder()
            .totalEmployesInscrits(totalInscrits)
            .totalEmployesActifsAujourdhui(sessionsActives.size())
            .scoreMoyenEquipe(Math.round(scoreMoyen * 10.0) / 10.0)
            .alertesActivesNonTraitees(alertesNonTraitees)
            .employesARisqueEleve(nbARisque)
            .statsDepartements(statsDepts)
            .employes(suiviEmployes)
            .alertesRecentes(alertesRecentes)
            .build());
    }

    /**
     * POST /api/admin/alertes/collective
     * Envoie une alerte à tous les employés actifs de l'entreprise de l'admin.
     */
    @PostMapping("/alertes/collective")
    public ResponseEntity<Map<String, Object>> envoyerAlerteCollective(
            @RequestParam String message,
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null
            ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        LocalDateTime debutJournee = LocalDateTime.now().withHour(0).withMinute(0);
        // SÉCURITÉ : uniquement les sessions de son entreprise
        List<SessionTravail> sessionsActives =
            sessionRepository.findSessionsActivesAujourdhuiParEntreprise(debutJournee, entrepriseId);

        sessionsActives.forEach(session -> {
            var alerte = new cm.tonkine.backend.entity.Alerte();
            alerte.setUtilisateur(session.getUtilisateur());
            alerte.setSession(session);
            alerte.setType(TypeAlerte.MESSAGE_ADMIN);
            alerte.setStatut(StatutAlerte.ENVOYEE);
            alerte.setMessage(message);
            alerte.setDateEnvoi(LocalDateTime.now());
            alerteRepository.save(alerte);
        });

        return ResponseEntity.ok(Map.of(
            "envoyees", sessionsActives.size(),
            "message",  message
        ));
    }

    // ── Helpers privés ──

    private List<StatDepartementResponse> calculerStatsDepartements(
            List<SessionTravail> sessions) {

        Map<String, List<Double>> parDept = sessions.stream()
            .filter(s -> s.getUtilisateur().getDepartement() != null
                      && s.getScoreGlobal() != null)
            .collect(Collectors.groupingBy(
                s -> s.getUtilisateur().getDepartement(),
                Collectors.mapping(SessionTravail::getScoreGlobal, Collectors.toList())
            ));

        return parDept.entrySet().stream()
            .map(e -> StatDepartementResponse.builder()
                .departement(e.getKey())
                .nombreEmployes(e.getValue().size())
                .scoreMoyen(e.getValue().stream()
                    .mapToDouble(Double::doubleValue).average().orElse(0))
                .build())
            .sorted(Comparator.comparing(StatDepartementResponse::getDepartement))
            .collect(Collectors.toList());
    }

    private SuiviEmployeResponse toSuiviResponse(SessionTravail session) {
        Utilisateur u = session.getUtilisateur();
        return SuiviEmployeResponse.builder()
            .userId(u.getId())
            .nomComplet(u.getNomComplet())
            .departement(u.getDepartement())
            .poste(u.getPoste())
            .scorePostureGlobal(session.getScoreGlobal())
            .dureeAssisCourantSecondes(session.getDureeAssisTotalSecondes())
            .pausesEffectueesAujourdhui(session.getNombrePausesEffectuees())
            .pausesObjectifAujourdhui(4)
            .sessionActive(session.getDateFin() == null)
            .build();
    }
}
