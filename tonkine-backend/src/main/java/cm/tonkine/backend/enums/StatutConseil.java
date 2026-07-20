package cm.tonkine.backend.enums;

/**
 * Cycle de vie d'une demande de conseil santé.
 * EN_ATTENTE → VU → REPONDU
 */
public enum StatutConseil {
    /** Question envoyée par l'employé, le kiné ne l'a pas encore lue */
    EN_ATTENTE,
    /** Le kiné a ouvert la demande mais n'a pas encore répondu */
    VU,
    /** Le kiné a fourni une réponse */
    REPONDU
}
