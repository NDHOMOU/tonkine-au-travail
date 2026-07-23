package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.CreerCompteAdminRequest;
import cm.tonkine.backend.dto.request.MettreAJourEntrepriseRequest;
import cm.tonkine.backend.dto.response.*;
import cm.tonkine.backend.entity.Entreprise;
import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import cm.tonkine.backend.repository.AlerteRepository;
import cm.tonkine.backend.repository.EntrepriseRepository;
import cm.tonkine.backend.repository.JournalAuditRepository;
import cm.tonkine.backend.repository.JournalConnexionRepository;
import cm.tonkine.backend.repository.SessionTravailRepository;
import cm.tonkine.backend.repository.UtilisateurRepository;
import cm.tonkine.backend.service.AnalyseDecisionService;
import cm.tonkine.backend.service.AuditService;
import cm.tonkine.backend.service.RapportService;
import cm.tonkine.backend.util.MotDePasseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
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
    private final EntrepriseRepository       entrepriseRepository;
    private final JournalConnexionRepository journalConnexionRepository;
    private final JournalAuditRepository     journalAuditRepository;
    private final RapportService             rapportService;
    private final AnalyseDecisionService      analyseDecisionService;
    private final AuditService               auditService;
    private final PasswordEncoder            passwordEncoder;

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

        auditService.enregistrer(adminRh, "ALERTE_COLLECTIVE",
            "Message envoyé à " + sessionsActives.size() + " employé(s) actifs : " + message);

        return ResponseEntity.ok(Map.of(
            "envoyees", sessionsActives.size(),
            "message",  message
        ));
    }

    /**
     * GET /api/admin/comptes-admin
     * Liste les comptes Admin RH de l'entreprise de l'appelant.
     */
    @GetMapping("/comptes-admin")
    public ResponseEntity<List<CompteAdminResponse>> listerComptesAdmin(
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        List<CompteAdminResponse> comptes = utilisateurRepository.findAll().stream()
            .filter(u -> u.getRole() == Role.ADMIN_RH)
            .filter(u -> u.getEntreprise() != null && entrepriseId.equals(u.getEntreprise().getId()))
            .map(u -> CompteAdminResponse.builder()
                .id(u.getId())
                .prenom(u.getPrenom())
                .nom(u.getNom())
                .email(u.getEmail())
                .actif(u.isActif())
                .motDePasseTemporaire(u.isMotDePasseTemporaire())
                .dateCreation(u.getDateCreation())
                .build())
            .collect(Collectors.toList());

        return ResponseEntity.ok(comptes);
    }

    /**
     * POST /api/admin/comptes-admin
     * Crée un nouveau compte Admin RH pour la même entreprise, avec un mot
     * de passe temporaire à usage unique — l'admin appelant doit le
     * communiquer lui-même au nouvel utilisateur, il n'est jamais reconsultable.
     */
    @PostMapping("/comptes-admin")
    @Transactional
    public ResponseEntity<MotDePasseTemporaireResponse> creerCompteAdmin(
            @Valid @RequestBody CreerCompteAdminRequest request,
            @AuthenticationPrincipal Utilisateur adminRh) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                "Un compte existe déjà avec cet email : " + request.getEmail());
        }

        Entreprise entreprise = adminRh.getEntreprise();
        if (entreprise == null) return ResponseEntity.status(403).build();

        String motDePasseTemporaire = MotDePasseUtil.genererMotDePasseTemporaire();

        Utilisateur nouvelAdmin = Utilisateur.builder()
            .prenom(request.getPrenom())
            .nom(request.getNom())
            .email(request.getEmail())
            .motDePasse(passwordEncoder.encode(motDePasseTemporaire))
            .role(Role.ADMIN_RH)
            .langue("fr")
            .entreprise(entreprise)
            .motDePasseTemporaire(true)
            .doitConfigurer2FA(true)
            .build();

        nouvelAdmin = utilisateurRepository.save(nouvelAdmin);

        auditService.enregistrer(adminRh, "CREATION_COMPTE_ADMIN",
            "Compte admin créé pour " + nouvelAdmin.getEmail());

        return ResponseEntity.ok(MotDePasseTemporaireResponse.builder()
            .userId(nouvelAdmin.getId())
            .email(nouvelAdmin.getEmail())
            .motDePasseTemporaire(motDePasseTemporaire)
            .build());
    }

    /**
     * POST /api/admin/utilisateurs/{id}/reset-password
     * Réinitialise le mot de passe d'un utilisateur de la même entreprise
     * (dépannage : compte bloqué, mot de passe oublié). Nouveau mot de passe
     * temporaire à usage unique, à communiquer manuellement.
     */
    @PostMapping("/utilisateurs/{id}/reset-password")
    @Transactional
    public ResponseEntity<MotDePasseTemporaireResponse> reinitialiserMotDePasse(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur adminRh) {

        Utilisateur cible = utilisateurRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        // SÉCURITÉ (IDOR) : un admin ne peut réinitialiser que les comptes de sa propre entreprise
        Long entrepriseAdmin  = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        Long entrepriseCible  = cible.getEntreprise()   != null ? cible.getEntreprise().getId()   : null;
        if (entrepriseAdmin == null || !entrepriseAdmin.equals(entrepriseCible)) {
            throw new AccessDeniedException("Cet utilisateur n'appartient pas à votre entreprise");
        }

        String motDePasseTemporaire = MotDePasseUtil.genererMotDePasseTemporaire();
        cible.setMotDePasse(passwordEncoder.encode(motDePasseTemporaire));
        cible.setMotDePasseTemporaire(true);
        utilisateurRepository.save(cible);

        auditService.enregistrer(adminRh, "RESET_MOT_DE_PASSE",
            "Mot de passe réinitialisé pour " + cible.getEmail());

        return ResponseEntity.ok(MotDePasseTemporaireResponse.builder()
            .userId(cible.getId())
            .email(cible.getEmail())
            .motDePasseTemporaire(motDePasseTemporaire)
            .build());
    }

    /**
     * DELETE /api/admin/comptes-admin/{id}
     * Supprime un compte Admin RH de la même entreprise (ex. compte de test,
     * doublon). Un admin ne peut pas se supprimer lui-même.
     */
    @DeleteMapping("/comptes-admin/{id}")
    @Transactional
    public ResponseEntity<Void> supprimerCompteAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur adminRh) {

        Utilisateur cible = utilisateurRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        // SÉCURITÉ (IDOR) : un admin ne peut supprimer que les comptes de sa propre entreprise
        Long entrepriseAdmin  = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        Long entrepriseCible  = cible.getEntreprise()   != null ? cible.getEntreprise().getId()   : null;
        if (entrepriseAdmin == null || !entrepriseAdmin.equals(entrepriseCible)) {
            throw new AccessDeniedException("Cet utilisateur n'appartient pas à votre entreprise");
        }

        if (cible.getRole() != Role.ADMIN_RH) {
            throw new IllegalArgumentException("Seuls les comptes Admin RH peuvent être supprimés ici");
        }

        if (cible.getId().equals(adminRh.getId())) {
            throw new IllegalArgumentException("Vous ne pouvez pas supprimer votre propre compte");
        }

        String emailSupprime = cible.getEmail();
        utilisateurRepository.delete(cible);

        auditService.enregistrer(adminRh, "SUPPRESSION_COMPTE_ADMIN",
            "Compte admin supprimé : " + emailSupprime);

        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/admin/entreprise
     * Personnalisation de l'entreprise de l'admin (nom, logo, couleurs, coordonnées).
     */
    @GetMapping("/entreprise")
    public ResponseEntity<EntrepriseResponse> getEntreprise(
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        // Recharge l'entreprise fraîchement par son ID plutôt que de déréférencer
        // adminRh.getEntreprise() : ce proxy vient de la session du filtre JWT,
        // déjà fermée — le même piège que le LazyInitializationException déjà corrigé.
        Entreprise e = entrepriseRepository.findById(entrepriseId)
            .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable"));

        return ResponseEntity.ok(toEntrepriseResponse(e));
    }

    /**
     * PUT /api/admin/entreprise
     * Met à jour la personnalisation de l'entreprise — pas les champs de licence
     * (nombre d'employés max, expiration), gérés côté plateforme.
     */
    @PutMapping("/entreprise")
    @Transactional
    public ResponseEntity<EntrepriseResponse> mettreAJourEntreprise(
            @Valid @RequestBody MettreAJourEntrepriseRequest request,
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        Entreprise e = entrepriseRepository.findById(entrepriseId)
            .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable"));

        e.setNom(request.getNom());
        e.setNomApp(request.getNomApp());
        e.setSlogan(request.getSlogan());
        e.setLogoUrl(request.getLogoUrl());
        e.setCouleurPrimaire(request.getCouleurPrimaire());
        e.setCouleurSecondaire(request.getCouleurSecondaire());
        e.setAdresse(request.getAdresse());
        e.setVille(request.getVille());
        e.setPays(request.getPays());
        e.setTelephone(request.getTelephone());
        e.setEmailContact(request.getEmailContact());
        e.setSiteWeb(request.getSiteWeb());
        e.setSecteurActivite(request.getSecteurActivite());

        entrepriseRepository.save(e);

        auditService.enregistrer(adminRh, "MODIFICATION_ENTREPRISE",
            "Paramètres de l'entreprise mis à jour");

        return ResponseEntity.ok(toEntrepriseResponse(e));
    }

    /**
     * GET /api/admin/journal-connexions
     * Historique des connexions des utilisateurs de l'entreprise (sécurité).
     */
    @GetMapping("/journal-connexions")
    public ResponseEntity<List<ConnexionJournalResponse>> getJournalConnexions(
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        List<ConnexionJournalResponse> journal = journalConnexionRepository
            .findRecentesParEntreprise(entrepriseId, PageRequest.of(0, 50)).stream()
            .map(j -> ConnexionJournalResponse.builder()
                .nomComplet(j.getUtilisateur().getNomComplet())
                .email(j.getUtilisateur().getEmail())
                .role(j.getUtilisateur().getRole().name())
                .adresseIp(j.getAdresseIp())
                .dateConnexion(j.getDateConnexion())
                .build())
            .collect(Collectors.toList());

        return ResponseEntity.ok(journal);
    }

    /**
     * GET /api/admin/journal-audit
     * Historique des actions administratives sensibles (créations de compte,
     * réinitialisations, modifications entreprise, alertes collectives).
     */
    @GetMapping("/journal-audit")
    public ResponseEntity<List<JournalAuditResponse>> getJournalAudit(
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        List<JournalAuditResponse> journal = journalAuditRepository
            .findRecentParEntreprise(entrepriseId, PageRequest.of(0, 50)).stream()
            .map(j -> JournalAuditResponse.builder()
                .acteur(j.getActeur().getNomComplet())
                .action(j.getAction())
                .details(j.getDetails())
                .dateAction(j.getDateAction())
                .build())
            .collect(Collectors.toList());

        return ResponseEntity.ok(journal);
    }

    /**
     * GET /api/admin/analyse-decision
     * Aide à la décision : tendances de posture par département, employés en
     * dégradation dans le temps, taux de suivi des alertes — à partir des
     * sessions déjà collectées, sans donnée sensible (pas d'âge).
     */
    @GetMapping("/analyse-decision")
    public ResponseEntity<AnalyseDecisionResponse> getAnalyseDecision(
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(analyseDecisionService.genererAnalyse(entrepriseId));
    }

    /**
     * GET /api/admin/rapports/hebdomadaire
     * Rapport CSV téléchargeable des 7 derniers jours (postures, alertes) —
     * l'admin l'achemine lui-même (email, Slack, impression…) à qui de droit.
     */
    @GetMapping("/rapports/hebdomadaire")
    public ResponseEntity<String> telechargerRapportHebdomadaire(
            @AuthenticationPrincipal Utilisateur adminRh) {

        Long entrepriseId = adminRh.getEntreprise() != null ? adminRh.getEntreprise().getId() : null;
        if (entrepriseId == null) return ResponseEntity.status(403).build();

        String csv = rapportService.genererRapportHebdomadaireCsv(entrepriseId);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(rapportService.nomFichierRapport()).build().toString())
            .body(csv);
    }

    // ── Helpers privés ──

    private EntrepriseResponse toEntrepriseResponse(Entreprise e) {
        return EntrepriseResponse.builder()
            .id(e.getId())
            .nom(e.getNom())
            .nomApp(e.getNomApp())
            .slogan(e.getSlogan())
            .logoUrl(e.getLogoUrl())
            .couleurPrimaire(e.getCouleurPrimaire())
            .couleurSecondaire(e.getCouleurSecondaire())
            .adresse(e.getAdresse())
            .ville(e.getVille())
            .pays(e.getPays())
            .telephone(e.getTelephone())
            .emailContact(e.getEmailContact())
            .siteWeb(e.getSiteWeb())
            .secteurActivite(e.getSecteurActivite())
            .build();
    }

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
