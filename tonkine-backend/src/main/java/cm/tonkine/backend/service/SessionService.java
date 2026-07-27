package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.request.MesurePostureRequest;
import cm.tonkine.backend.dto.request.SignalerIndisponibiliteRequest;
import cm.tonkine.backend.dto.response.AlerteResponse;
import cm.tonkine.backend.dto.response.DashboardEmployeResponse;
import cm.tonkine.backend.dto.response.ExerciceResponse;
import cm.tonkine.backend.entity.*;
import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import cm.tonkine.backend.enums.ZoneCorps;
import cm.tonkine.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionTravailRepository sessionRepository;
    private final AlerteRepository         alerteRepository;
    private final ExerciceRepository       exerciceRepository;
    private final ProfilErgonomiqueRepository profilRepository;
    private final UtilisateurRepository    utilisateurRepository;

    /** Durée seuil avant alerte pause : 2 heures en secondes */
    private static final long SEUIL_PAUSE_SECONDES = 7200L;
    /** Score posture critique (déclenche alerte) */
    private static final double SEUIL_SCORE_CRITIQUE = 60.0;
    /** Intervalle entre deux envois de mesure côté navigateur (usePostureDetection.js) */
    private static final long INTERVALLE_MESURE_SECONDES = 5L;

    /**
     * Ouvre ou récupère la session de travail du jour.
     * Personne n'appelle jamais /posture/session/fermer en pratique (pas de
     * hook à la déconnexion, pas de tâche planifiée) — sans ce garde-fou, une
     * session ouverte un jour resterait "ouverte" indéfiniment et serait
     * réutilisée les jours suivants : son dateDebut resterait bloqué dans le
     * passé, et l'employé deviendrait invisible dans les vues "actif
     * aujourd'hui" du kiné/admin alors qu'il utilise l'appli à l'instant même.
     * On détecte donc ici une session laissée ouverte d'un jour précédent et
     * on la referme proprement avant d'en ouvrir une nouvelle pour aujourd'hui.
     */
    @Transactional
    public SessionTravail ouvrirSession(Utilisateur utilisateur) {
        var sessionExistante = sessionRepository.findByUtilisateurAndDateFinIsNull(utilisateur);

        if (sessionExistante.isPresent()) {
            SessionTravail session = sessionExistante.get();
            if (session.getDateDebut().toLocalDate().isEqual(LocalDateTime.now().toLocalDate())) {
                return session;
            }
            // Session d'un jour précédent jamais fermée — on la clôture à la
            // fin de sa propre journée (on ne connaît pas l'heure réelle de départ).
            session.setDateFin(session.getDateDebut().toLocalDate().atTime(23, 59, 59));
            session.calculerScoreGlobal();
            sessionRepository.save(session);
        }

        SessionTravail nouvelle = SessionTravail.builder()
            .utilisateur(utilisateur)
            .dateDebut(LocalDateTime.now())
            .build();
        return sessionRepository.save(nouvelle);
    }

    /**
     * Ferme la session en cours — vérifie que la session appartient à l'utilisateur.
     */
    @Transactional
    public void fermerSession(Long sessionId, Utilisateur utilisateur) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            // SÉCURITÉ : on ne ferme que sa propre session
            if (!session.getUtilisateur().getId().equals(utilisateur.getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé : cette session ne vous appartient pas");
            }
            session.setDateFin(LocalDateTime.now());
            session.calculerScoreGlobal();
            sessionRepository.save(session);
        });
    }

    /**
     * Enregistre une mesure posture (envoyée par TensorFlow.js React) toutes
     * les ~5 secondes pendant la surveillance webcam. Déclenche une alerte si
     * score critique ou seuil 2h de position assise atteint — et retourne
     * cette alerte pour que le frontend l'utilise comme véritable identifiant
     * (au lieu du minuteur purement local d'avant, jamais relié au serveur).
     */
    @Transactional
    public AlerteResponse enregistrerMesure(MesurePostureRequest req, Utilisateur utilisateur) {
        SessionTravail session = sessionRepository.findById(req.getSessionId())
            .orElseThrow(() -> new IllegalArgumentException("Session introuvable"));

        // SÉCURITÉ : on n'accepte que des mesures pour sa propre session
        if (!session.getUtilisateur().getId().equals(utilisateur.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                "Accès refusé : cette session ne vous appartient pas");
        }

        MesurePosture mesure = MesurePosture.builder()
            .session(session)
            .zone(req.getZone())
            .score(req.getScore())
            .angleDegres(req.getAngleDegres())
            .angleReferenceNorme(req.getAngleReferenceNorme())
            .conforme(req.getScore() >= SEUIL_SCORE_CRITIQUE)
            .build();

        session.getMesures().add(mesure);

        // Mise à jour du score de la zone dans la session
        mettreAJourScoreZone(session, req.getZone(), req.getScore());
        session.calculerScoreGlobal();

        // Temps assis suivi côté serveur (source de vérité, pas un minuteur
        // navigateur qui se remet à zéro à chaque rechargement de page).
        // Une seule des zones envoyées à chaque cycle sert de "tic" pour ne
        // pas compter plusieurs fois le même intervalle de 5s.
        AlerteResponse alertePause = null;
        if (req.getZone() == ZoneCorps.DOS_LOMBAIRES) {
            if (Boolean.TRUE.equals(req.getEstDebout())) {
                session.setDureeAssisTotalSecondes(0L);
            } else {
                session.setDureeAssisTotalSecondes(session.getDureeAssisTotalSecondes() + INTERVALLE_MESURE_SECONDES);
                if (session.getDureeAssisTotalSecondes() >= SEUIL_PAUSE_SECONDES) {
                    alertePause = creerAlertePauseSiAbsente(utilisateur, session);
                }
            }
        }

        sessionRepository.save(session);

        // Alerte si score critique sur une zone prioritaire
        if (req.getScore() < SEUIL_SCORE_CRITIQUE &&
            (req.getZone() == ZoneCorps.NUQUE_CERVICALES ||
             req.getZone() == ZoneCorps.DOS_LOMBAIRES)) {
            creerAlertePosture(utilisateur, session, req.getScore());
        }

        return alertePause;
    }

    /**
     * L'employé confirme sa pause — remet le minuteur à zéro.
     * SÉCURITÉ : vérifie que l'alerte appartient à l'utilisateur connecté.
     */
    @Transactional
    public void confirmerPause(Long alerteId, Utilisateur utilisateur) {
        alerteRepository.findById(alerteId).ifPresent(alerte -> {
            if (!alerte.getUtilisateur().getId().equals(utilisateur.getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé : cette alerte ne vous appartient pas");
            }
            alerte.setStatut(StatutAlerte.PAUSE_EFFECTUEE);
            alerte.setDateReponse(LocalDateTime.now());
            alerteRepository.save(alerte);

            // Incrémenter le compteur de pauses et remettre le temps assis à
            // zéro côté serveur (certaines alertes, ex. surveillance
            // indisponible, n'ont pas de session associée)
            if (alerte.getSession() != null) {
                alerte.getSession().setNombrePausesEffectuees(
                    alerte.getSession().getNombrePausesEffectuees() + 1
                );
                alerte.getSession().setDureeAssisTotalSecondes(0L);
                sessionRepository.save(alerte.getSession());
            }
        });
    }

    /**
     * Snooze une alerte (délai en secondes, ex: 600 = 10 min).
     * SÉCURITÉ : vérifie que l'alerte appartient à l'utilisateur connecté.
     */
    @Transactional
    public void snoozerAlerte(Long alerteId, int delaiSecondes, Utilisateur utilisateur) {
        alerteRepository.findById(alerteId).ifPresent(alerte -> {
            if (!alerte.getUtilisateur().getId().equals(utilisateur.getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé : cette alerte ne vous appartient pas");
            }
            alerte.setStatut(StatutAlerte.SNOOZEE);
            alerte.setDelaiSnoozeSecondes(delaiSecondes);
            alerte.setDateReponse(LocalDateTime.now());
            alerteRepository.save(alerte);
        });
    }

    /**
     * Signale que la surveillance posturale n'a pas pu démarrer sur le poste
     * de l'employé (webcam refusée/absente, modèle de détection non chargé...).
     * Remonte une alerte visible par l'admin/kiné — empêche qu'un employé
     * échappe silencieusement à l'évaluation (ex. webcam débranchée, réseau
     * coupé au premier chargement).
     * SÉCURITÉ : si un sessionId est fourni, vérifie qu'il appartient à l'utilisateur.
     */
    @Transactional
    public void signalerSurveillanceIndisponible(SignalerIndisponibiliteRequest req, Utilisateur utilisateur) {
        SessionTravail session = null;
        if (req.getSessionId() != null) {
            session = sessionRepository.findById(req.getSessionId()).orElse(null);
            if (session != null && !session.getUtilisateur().getId().equals(utilisateur.getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé : cette session ne vous appartient pas");
            }
        }

        Alerte alerte = Alerte.builder()
            .utilisateur(utilisateur)
            .session(session)
            .type(TypeAlerte.SURVEILLANCE_INDISPONIBLE)
            .statut(StatutAlerte.ENVOYEE)
            .message(req.getMotif())
            .dureeAssiAvantAlerteSecondes(session != null ? session.getDureeAssisTotalSecondes() : null)
            .build();
        alerteRepository.save(alerte);

        if (session != null) {
            session.setNombreAlertesEnvoyees(session.getNombreAlertesEnvoyees() + 1);
            sessionRepository.save(session);
        }
    }

    /**
     * Construit le DTO du tableau de bord employé.
     */
    @Transactional(readOnly = true)
    public DashboardEmployeResponse getDashboard(Utilisateur utilisateur) {
        SessionTravail session = sessionRepository
            .findByUtilisateurAndDateFinIsNull(utilisateur)
            .orElse(null);

        ProfilErgonomique profil = profilRepository
            .findByUtilisateurId(utilisateur.getId())
            .orElse(null);

        // Exercices personnalisés selon hobbies et zones prioritaires
        List<ExerciceResponse> exercicesDuJour = selectionnerExercicesDuJour(
            profil, session, utilisateur
        );

        // Alertes de la session courante
        List<AlerteResponse> alertesSession = new ArrayList<>();
        if (session != null) {
            alertesSession = session.getAlertes().stream()
                .map(this::toAlerteResponse)
                .collect(Collectors.toList());
        }

        return DashboardEmployeResponse.builder()
            .userId(utilisateur.getId())
            .nomComplet(utilisateur.getNomComplet())
            .departement(utilisateur.getDepartement())
            .douleursDeclarees(profil != null ? profil.getDouleursDeclarees() : null)
            .scoreDosColonne(session != null ? session.getScoreDosColonne() : null)
            .scoreNuque(session != null ? session.getScoreNuque() : null)
            .scoreEpaules(session != null ? session.getScoreEpaules() : null)
            .scorePoignets(session != null ? session.getScorePoignets() : null)
            .scoreHanches(session != null ? session.getScoreHanches() : null)
            .scoreYeux(session != null ? session.getScoreYeux() : null)
            .scoreGlobal(session != null ? session.getScoreGlobal() : null)
            .sessionId(session != null ? session.getId() : null)
            .dureeAssisCourantSecondes(session != null ? session.getDureeAssisTotalSecondes() : 0L)
            .nombrePausesEffectuees(session != null ? session.getNombrePausesEffectuees() : 0)
            .nombrePausesObjectif(4)
            .nombreAlertesIgnorees(session != null ? session.getNombreAlertesIgnorees() : 0)
            .exercicesDuJour(exercicesDuJour)
            .alertesSession(alertesSession)
            .hauteurSiegeRecommandeCm(profil != null ? profil.getHauteurSiegeRecommandeCm() : null)
            .hauteurBureauRecommandeCm(profil != null ? profil.getHauteurBureauRecommandeCm() : null)
            .hauteurEcranRecommandeCm(profil != null ? profil.getHauteurEcranRecommandeCm() : null)
            .build();
    }

    // ── Méthodes privées ──

    /**
     * Crée l'alerte "2h de position assise" si aucune n'est déjà en attente
     * pour cette session — évite d'en recréer une à chaque mesure de 5s tant
     * que l'employé n'a pas confirmé sa pause.
     */
    private AlerteResponse creerAlertePauseSiAbsente(Utilisateur u, SessionTravail s) {
        boolean dejaActive = alerteRepository.existsBySessionIdAndTypeAndStatutIn(
            s.getId(), TypeAlerte.PAUSE_DEUX_HEURES,
            List.of(StatutAlerte.ENVOYEE, StatutAlerte.VUE, StatutAlerte.SNOOZEE));
        if (dejaActive) return null;

        Exercice exercice = choisirExercicePourAlerte(u, s);
        Alerte alerte = Alerte.builder()
            .utilisateur(u)
            .session(s)
            .type(TypeAlerte.PAUSE_DEUX_HEURES)
            .statut(StatutAlerte.ENVOYEE)
            .exerciceSuggere(exercice)
            .dureeAssiAvantAlerteSecondes(s.getDureeAssisTotalSecondes())
            .build();
        alerteRepository.save(alerte);
        s.setNombreAlertesEnvoyees(s.getNombreAlertesEnvoyees() + 1);

        return AlerteResponse.builder()
            .id(alerte.getId())
            .type(alerte.getType())
            .statut(alerte.getStatut())
            .message(alerte.getMessage())
            .dateEnvoi(alerte.getDateEnvoi())
            .exerciceSuggere(exercice != null ? toExerciceResponse(exercice) : null)
            .dureeAssiAvantAlerteSecondes(alerte.getDureeAssiAvantAlerteSecondes())
            .build();
    }

    private void creerAlertePosture(Utilisateur u, SessionTravail s, double score) {
        Exercice exercice = choisirExercicePourAlerte(u, s);
        Alerte alerte = Alerte.builder()
            .utilisateur(u)
            .session(s)
            .type(TypeAlerte.MAUVAISE_POSTURE)
            .statut(StatutAlerte.ENVOYEE)
            .exerciceSuggere(exercice)
            .dureeAssiAvantAlerteSecondes(s.getDureeAssisTotalSecondes())
            .build();
        alerteRepository.save(alerte);
        s.setNombreAlertesEnvoyees(s.getNombreAlertesEnvoyees() + 1);
    }

    private Exercice choisirExercicePourAlerte(Utilisateur u, SessionTravail s) {
        Long entrepriseId = u.getEntreprise() != null ? u.getEntreprise().getId() : null;
        ProfilErgonomique profil = profilRepository
            .findByUtilisateurId(u.getId()).orElse(null);

        if (profil != null && profil.getHobbies() != null) {
            String premierHobbie = profil.getHobbies().split(",")[0].trim();
            List<Exercice> exercices = exerciceRepository.findByHobbieContaining(entrepriseId, premierHobbie);
            if (!exercices.isEmpty()) return exercices.get(0);
        }

        List<Exercice> tous = exerciceRepository.findVisiblesParEntreprise(entrepriseId);
        return tous.isEmpty() ? null : tous.get(0);
    }

    private List<ExerciceResponse> selectionnerExercicesDuJour(
            ProfilErgonomique profil, SessionTravail session, Utilisateur utilisateur) {

        List<ZoneCorps> zonesPrioritaires = List.of(
            ZoneCorps.NUQUE_CERVICALES,
            ZoneCorps.DOS_LOMBAIRES,
            ZoneCorps.POIGNETS_AVANT_BRAS,
            ZoneCorps.YEUX_VISION
        );

        Long entrepriseId = utilisateur.getEntreprise() != null ? utilisateur.getEntreprise().getId() : null;
        return exerciceRepository.findVisiblesParEntreprise(entrepriseId).stream()
            .filter(e -> zonesPrioritaires.contains(e.getZone()))
            .limit(4)
            .map(this::toExerciceResponse)
            .collect(Collectors.toList());
    }

    private void mettreAJourScoreZone(SessionTravail s, ZoneCorps zone, double score) {
        switch (zone) {
            case DOS_LOMBAIRES       -> s.setScoreDosColonne(score);
            case NUQUE_CERVICALES    -> s.setScoreNuque(score);
            case EPAULES             -> s.setScoreEpaules(score);
            case POIGNETS_AVANT_BRAS -> s.setScorePoignets(score);
            case HANCHES_BASSIN      -> s.setScoreHanches(score);
            case YEUX_VISION         -> s.setScoreYeux(score);
        }
    }

    private ExerciceResponse toExerciceResponse(Exercice e) {
        return ExerciceResponse.builder()
            .id(e.getId())
            .titre(e.getTitre())
            .description(e.getDescription())
            .zone(e.getZone())
            .dureeMinutes(e.getDureMinutes())
            .frequenceRecommandee(e.getFrequenceRecommandee())
            .niveauDifficulte(e.getNiveauDifficulte())
            .hobbiesAssocies(e.getHobbiesAssocies())
            .etapesJson(e.getEtapesJson())
            .urlVideo(e.getUrlVideo())
            .urlImage(e.getUrlImage())
            .build();
    }

    private AlerteResponse toAlerteResponse(Alerte a) {
        return AlerteResponse.builder()
            .id(a.getId())
            .type(a.getType())
            .statut(a.getStatut())
            .message(a.getMessage())
            .dateEnvoi(a.getDateEnvoi())
            .dureeAssiAvantAlerteSecondes(a.getDureeAssiAvantAlerteSecondes())
            .exerciceSuggere(a.getExerciceSuggere() != null
                ? toExerciceResponse(a.getExerciceSuggere()) : null)
            .build();
    }
}
