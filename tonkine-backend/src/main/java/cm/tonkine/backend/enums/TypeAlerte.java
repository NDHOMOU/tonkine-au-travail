package cm.tonkine.backend.enums;

public enum TypeAlerte {
    PAUSE_DEUX_HEURES,          // minuteur 2h déclenché
    MAUVAISE_POSTURE,           // webcam détecte posture incorrecte
    SCORE_CRITIQUE,             // score posture sous le seuil
    RAPPEL_EXERCICE,            // rappel exercice planifié
    MESSAGE_ADMIN,              // alerte envoyée manuellement par RH
    SURVEILLANCE_INDISPONIBLE   // webcam refusée/absente ou modèle de détection non chargé
}
