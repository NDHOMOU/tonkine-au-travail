package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.request.ConnexionRequest;
import cm.tonkine.backend.dto.request.InscrireEntrepriseRequest;
import cm.tonkine.backend.dto.request.InscriptionRequest;
import cm.tonkine.backend.dto.response.Activer2FAResponse;
import cm.tonkine.backend.dto.response.AuthResponse;
import cm.tonkine.backend.entity.Entreprise;
import cm.tonkine.backend.entity.JetonReinitialisationMotDePasse;
import cm.tonkine.backend.entity.JournalConnexion;
import cm.tonkine.backend.entity.ProfilErgonomique;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import cm.tonkine.backend.repository.EntrepriseRepository;
import cm.tonkine.backend.repository.JetonReinitialisationMotDePasseRepository;
import cm.tonkine.backend.repository.JournalConnexionRepository;
import cm.tonkine.backend.repository.ProfilErgonomiqueRepository;
import cm.tonkine.backend.repository.UtilisateurRepository;
import cm.tonkine.backend.security.JwtService;
import cm.tonkine.backend.util.TotpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository       utilisateurRepository;
    private final ProfilErgonomiqueRepository profilRepository;
    private final EntrepriseRepository        entrepriseRepository;
    private final JournalConnexionRepository  journalConnexionRepository;
    private final JetonReinitialisationMotDePasseRepository jetonReinitialisationRepository;
    private final PasswordEncoder             passwordEncoder;
    private final JwtService                  jwtService;
    private final AuthenticationManager       authenticationManager;
    private final EmailService                emailService;

    @Value("${tonkine.frontend.url}")
    private String frontendUrl;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long JETON_VALIDITE_MINUTES = 60;

    /**
     * Inscription d'un nouvel employé (étapes 1+3+4 du wizard).
     * Les photos (étape 2) sont uploadées séparément via /profil/photos.
     */
    @Transactional
    public AuthResponse inscrire(InscriptionRequest req) {
        if (utilisateurRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException(
                "Un compte existe déjà avec cet email : " + req.getEmail()
            );
        }

        // Vérifie et charge l'entreprise
        Entreprise entreprise = null;
        if (req.getEntrepriseId() != null) {
            entreprise = entrepriseRepository.findById(req.getEntrepriseId())
                .orElseThrow(() -> new IllegalArgumentException(
                    "Entreprise introuvable : " + req.getEntrepriseId()
                ));
        }

        Utilisateur utilisateur = Utilisateur.builder()
            .prenom(req.getPrenom())
            .nom(req.getNom())
            .email(req.getEmail())
            .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
            .role(Role.EMPLOYE)
            .departement(req.getDepartement())
            .poste(req.getPoste())
            .langue(req.getLangue() != null ? req.getLangue() : "fr")
            .entreprise(entreprise)
            .doitConfigurer2FA(true)
            .build();

        utilisateur = utilisateurRepository.save(utilisateur);

        // Création du profil ergonomique
        ProfilErgonomique profil = ProfilErgonomique.builder()
            .utilisateur(utilisateur)
            .tailleCm(req.getTailleCm())
            .longueurJambeCm(req.getLongueurJambeCm())
            .longueurAvantBrasCm(req.getLongueurAvantBrasCm())
            .poidsKg(null)
            .typeSiege(req.getTypeSiege())
            .typeEcran(req.getTypeEcran())
            .bureauReglable(req.getBureauReglable())
            .reposePieds(req.getReposePieds())
            .heuresAssiParJour(req.getHeuresAssiParJour())
            .douleursDeclarees(req.getDouleursDeclarees())
            .hobbies(req.getHobbies())
            .joursTravailes(req.getJoursTravailes())
            .heureArrivee(req.getHeureArrivee())
            .heureDepart(req.getHeureDepart())
            .build();

        profil.calculerConfigurationOptimale();
        profilRepository.save(profil);

        String token = jwtService.generateToken(utilisateur,
            Map.of("role", utilisateur.getRole().name(),
                   "userId", utilisateur.getId()));

        Entreprise ent = utilisateur.getEntreprise();
        return AuthResponse.builder()
            .token(token)
            .userId(utilisateur.getId())
            .prenom(utilisateur.getPrenom())
            .nom(utilisateur.getNom())
            .email(utilisateur.getEmail())
            .role(utilisateur.getRole())
            .langue(utilisateur.getLangue())
            .profilComplet(false) // photos pas encore uploadées
            .doitConfigurer2FA(true)
            .entrepriseId(ent != null ? ent.getId() : null)
            .nomEntreprise(ent != null ? ent.getNom() : null)
            .nomApp(ent != null ? ent.getNomApp() : "TonKiné au Travail")
            .couleurPrimaire(ent != null ? ent.getCouleurPrimaire() : "#1353A4")
            .couleurSecondaire(ent != null ? ent.getCouleurSecondaire() : "#0B9B8A")
            .logoUrl(ent != null ? ent.getLogoUrl() : null)
            .build();
    }

    /**
     * Inscrit une toute nouvelle entreprise cliente et crée son premier
     * compte Admin RH dans la foulée — jusqu'ici, aucune entreprise ne
     * pouvait être créée autrement qu'à la main en base de données, ce qui
     * bloquait l'arrivée de toute nouvelle entreprise cliente.
     */
    @Transactional
    public AuthResponse inscrireEntreprise(InscrireEntrepriseRequest req) {
        if (utilisateurRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException(
                "Un compte existe déjà avec cet email : " + req.getEmail()
            );
        }

        Entreprise entreprise = Entreprise.builder()
            .nom(req.getNomEntreprise())
            .ville(req.getVille())
            .secteurActivite(req.getSecteurActivite())
            .build();
        entreprise = entrepriseRepository.save(entreprise);

        Utilisateur admin = Utilisateur.builder()
            .prenom(req.getPrenom())
            .nom(req.getNom())
            .email(req.getEmail())
            .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
            .role(Role.ADMIN_RH)
            .langue("fr")
            .entreprise(entreprise)
            .doitConfigurer2FA(true)
            .build();
        admin = utilisateurRepository.save(admin);

        String token = jwtService.generateToken(admin,
            Map.of("role", admin.getRole().name(), "userId", admin.getId()));

        return AuthResponse.builder()
            .token(token)
            .userId(admin.getId())
            .prenom(admin.getPrenom())
            .nom(admin.getNom())
            .email(admin.getEmail())
            .role(admin.getRole())
            .langue(admin.getLangue())
            .profilComplet(true)
            .doitConfigurer2FA(true)
            .entrepriseId(entreprise.getId())
            .nomEntreprise(entreprise.getNom())
            .nomApp(entreprise.getNomApp())
            .couleurPrimaire(entreprise.getCouleurPrimaire())
            .couleurSecondaire(entreprise.getCouleurSecondaire())
            .logoUrl(entreprise.getLogoUrl())
            .build();
    }

    /**
     * Connexion d'un utilisateur existant.
     */
    @Transactional
    public AuthResponse connecter(ConnexionRequest req, String adresseIp) {
        // Délègue la vérification à Spring Security (BCrypt)
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getMotDePasse())
        );

        Utilisateur utilisateur = utilisateurRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        // ── 2FA (TOTP), si activée sur ce compte ──
        if (utilisateur.isDeuxFAActif()) {
            if (req.getCode2FA() == null || req.getCode2FA().isBlank()) {
                // Mot de passe correct, mais code d'authentification requis pour finaliser.
                // Pas de token émis, pas encore consigné dans le journal des connexions.
                return AuthResponse.builder()
                    .requiert2FA(true)
                    .email(utilisateur.getEmail())
                    .build();
            }
            if (!TotpUtil.verifierCode(utilisateur.getSecret2FA(), req.getCode2FA())) {
                throw new IllegalArgumentException("Code de vérification incorrect.");
            }
        }

        journalConnexionRepository.save(JournalConnexion.builder()
            .utilisateur(utilisateur)
            .adresseIp(adresseIp)
            .build());

        // Vérifier si le profil est complet (4 photos uploadées)
        boolean profilComplet = profilRepository.findByUtilisateurId(utilisateur.getId())
            .map(p -> p.getPhotos().size() == 4)
            .orElse(false);

        String token = jwtService.generateToken(utilisateur,
            Map.of("role", utilisateur.getRole().name(),
                   "userId", utilisateur.getId()));

        Entreprise ent = utilisateur.getEntreprise();
        return AuthResponse.builder()
            .token(token)
            .userId(utilisateur.getId())
            .prenom(utilisateur.getPrenom())
            .nom(utilisateur.getNom())
            .email(utilisateur.getEmail())
            .role(utilisateur.getRole())
            .langue(utilisateur.getLangue())
            .profilComplet(profilComplet)
            .motDePasseTemporaire(utilisateur.isMotDePasseTemporaire())
            .photoProfilBase64(utilisateur.getPhotoProfilBase64())
            .deuxFAActif(utilisateur.isDeuxFAActif())
            .doitConfigurer2FA(utilisateur.isDoitConfigurer2FA())
            .entrepriseId(ent != null ? ent.getId() : null)
            .nomEntreprise(ent != null ? ent.getNom() : null)
            .nomApp(ent != null ? ent.getNomApp() : "TonKiné au Travail")
            .couleurPrimaire(ent != null ? ent.getCouleurPrimaire() : "#1353A4")
            .couleurSecondaire(ent != null ? ent.getCouleurSecondaire() : "#0B9B8A")
            .logoUrl(ent != null ? ent.getLogoUrl() : null)
            .build();
    }

    /**
     * Change le mot de passe de l'utilisateur connecté et lève le drapeau
     * "mot de passe temporaire" (première connexion après création/reset par un admin).
     * SÉCURITÉ : exige l'ancien mot de passe — un jeton JWT volé ne doit pas
     * suffire à lui seul pour prendre le contrôle définitif d'un compte.
     */
    @Transactional
    public void changerMotDePasse(Utilisateur utilisateur, String ancienMotDePasse, String nouveauMotDePasse) {
        if (!passwordEncoder.matches(ancienMotDePasse, utilisateur.getMotDePasse())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        utilisateur.setMotDePasseTemporaire(false);
        utilisateurRepository.save(utilisateur);
    }

    /** Met à jour la photo de profil (identification professionnelle) de l'utilisateur connecté. */
    @Transactional
    public void mettreAJourPhotoProfil(Utilisateur utilisateur, String photoBase64) {
        utilisateur.setPhotoProfilBase64(photoBase64);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Démarre l'activation de la 2FA : génère un nouveau secret TOTP, pas encore
     * actif tant que confirmerDeuxFA() n'a pas vérifié un code valide.
     */
    @Transactional
    public Activer2FAResponse demarrerActivationDeuxFA(Utilisateur utilisateur) {
        String secret = TotpUtil.genererSecret();
        utilisateur.setSecret2FA(secret);
        utilisateur.setDeuxFAActif(false);
        utilisateurRepository.save(utilisateur);

        return Activer2FAResponse.builder()
            .secret(secret)
            .otpauthUri(TotpUtil.genererUriOtpAuth(secret, utilisateur.getEmail()))
            .build();
    }

    /** Confirme l'activation de la 2FA avec un code généré par l'appli d'authentification. */
    @Transactional
    public void confirmerDeuxFA(Utilisateur utilisateur, String code) {
        if (utilisateur.getSecret2FA() == null) {
            throw new IllegalArgumentException("Aucune activation de 2FA en cours.");
        }
        if (!TotpUtil.verifierCode(utilisateur.getSecret2FA(), code)) {
            throw new IllegalArgumentException("Code de vérification incorrect.");
        }
        utilisateur.setDeuxFAActif(true);
        utilisateur.setDoitConfigurer2FA(false);
        utilisateurRepository.save(utilisateur);
    }

    /** Désactive la 2FA (l'utilisateur doit déjà être authentifié). */
    @Transactional
    public void desactiverDeuxFA(Utilisateur utilisateur) {
        utilisateur.setDeuxFAActif(false);
        utilisateur.setSecret2FA(null);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Demande de réinitialisation de mot de passe ("mot de passe oublié").
     * Ne révèle jamais si l'e-mail correspond à un compte existant — l'appelant
     * doit toujours afficher le même message générique, que l'e-mail soit
     * parti ou non.
     */
    @Transactional
    public void demanderReinitialisationMotDePasse(String email) {
        utilisateurRepository.findByEmail(email).ifPresent(utilisateur -> {
            byte[] octets = new byte[32];
            RANDOM.nextBytes(octets);
            String jeton = Base64.getUrlEncoder().withoutPadding().encodeToString(octets);

            JetonReinitialisationMotDePasse entite = JetonReinitialisationMotDePasse.builder()
                .utilisateur(utilisateur)
                .jeton(jeton)
                .dateExpiration(LocalDateTime.now().plusMinutes(JETON_VALIDITE_MINUTES))
                .build();
            jetonReinitialisationRepository.save(entite);

            String lien = frontendUrl + "/reinitialiser-mot-de-passe?jeton=" + jeton;
            emailService.envoyer(
                utilisateur.getEmail(),
                "Réinitialisation de votre mot de passe — TonKiné au Travail",
                "Bonjour " + utilisateur.getPrenom() + ",\n\n"
                    + "Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.\n"
                    + "Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable "
                    + JETON_VALIDITE_MINUTES + " minutes) :\n\n"
                    + lien + "\n\n"
                    + "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail — "
                    + "votre mot de passe actuel reste inchangé.\n\n"
                    + "— TonKiné au Travail"
            );
        });
    }

    /** Réinitialise le mot de passe à partir d'un jeton reçu par e-mail. */
    @Transactional
    public void reinitialiserMotDePasseAvecJeton(String jeton, String nouveauMotDePasse) {
        JetonReinitialisationMotDePasse entite = jetonReinitialisationRepository.findByJeton(jeton)
            .orElseThrow(() -> new IllegalArgumentException("Lien de réinitialisation invalide."));

        if (entite.isUtilise()) {
            throw new IllegalArgumentException("Ce lien de réinitialisation a déjà été utilisé.");
        }
        if (entite.getDateExpiration().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Ce lien de réinitialisation a expiré. Faites une nouvelle demande.");
        }

        Utilisateur utilisateur = entite.getUtilisateur();
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        utilisateur.setMotDePasseTemporaire(false);
        utilisateurRepository.save(utilisateur);

        entite.setUtilise(true);
        jetonReinitialisationRepository.save(entite);
    }
}
