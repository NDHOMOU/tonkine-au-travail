package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.request.ConnexionRequest;
import cm.tonkine.backend.dto.request.InscriptionRequest;
import cm.tonkine.backend.dto.response.Activer2FAResponse;
import cm.tonkine.backend.dto.response.AuthResponse;
import cm.tonkine.backend.entity.Entreprise;
import cm.tonkine.backend.entity.JournalConnexion;
import cm.tonkine.backend.entity.ProfilErgonomique;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import cm.tonkine.backend.repository.EntrepriseRepository;
import cm.tonkine.backend.repository.JournalConnexionRepository;
import cm.tonkine.backend.repository.ProfilErgonomiqueRepository;
import cm.tonkine.backend.repository.UtilisateurRepository;
import cm.tonkine.backend.security.JwtService;
import cm.tonkine.backend.util.TotpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository       utilisateurRepository;
    private final ProfilErgonomiqueRepository profilRepository;
    private final EntrepriseRepository        entrepriseRepository;
    private final JournalConnexionRepository  journalConnexionRepository;
    private final PasswordEncoder             passwordEncoder;
    private final JwtService                  jwtService;
    private final AuthenticationManager       authenticationManager;

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
            .entrepriseId(ent != null ? ent.getId() : null)
            .nomEntreprise(ent != null ? ent.getNom() : null)
            .nomApp(ent != null ? ent.getNomApp() : "TonKiné au Travail")
            .couleurPrimaire(ent != null ? ent.getCouleurPrimaire() : "#1353A4")
            .couleurSecondaire(ent != null ? ent.getCouleurSecondaire() : "#0B9B8A")
            .logoUrl(ent != null ? ent.getLogoUrl() : null)
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
     */
    @Transactional
    public void changerMotDePasse(Utilisateur utilisateur, String nouveauMotDePasse) {
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
        utilisateurRepository.save(utilisateur);
    }

    /** Désactive la 2FA (l'utilisateur doit déjà être authentifié). */
    @Transactional
    public void desactiverDeuxFA(Utilisateur utilisateur) {
        utilisateur.setDeuxFAActif(false);
        utilisateur.setSecret2FA(null);
        utilisateurRepository.save(utilisateur);
    }
}
