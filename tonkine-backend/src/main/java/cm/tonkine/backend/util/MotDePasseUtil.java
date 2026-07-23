package cm.tonkine.backend.util;

import java.security.SecureRandom;

/**
 * Génère des mots de passe temporaires (comptes créés par un admin,
 * réinitialisations) — l'utilisateur doit le changer à sa prochaine connexion.
 */
public final class MotDePasseUtil {

    private static final String CARACTERES =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private static final SecureRandom RANDOM = new SecureRandom();

    private MotDePasseUtil() {}

    public static String genererMotDePasseTemporaire() {
        StringBuilder sb = new StringBuilder(14);
        for (int i = 0; i < 14; i++) {
            sb.append(CARACTERES.charAt(RANDOM.nextInt(CARACTERES.length())));
        }
        return sb.toString();
    }
}
