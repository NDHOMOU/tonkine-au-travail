package cm.tonkine.backend.enums;

/**
 * Rôles utilisateur dans TonKiné au Travail.
 * EMPLOYE           : accès à son espace personnel (posture, exercices, RDV, conseils)
 * ADMIN_RH          : tableau de bord entreprise (suivi équipe, rapports, alertes)
 * KINESITHERAPEUTE  : outil clinique (suivi patients, conseils santé, RDV)
 */
public enum Role {
    EMPLOYE,
    ADMIN_RH,
    KINESITHERAPEUTE
}
