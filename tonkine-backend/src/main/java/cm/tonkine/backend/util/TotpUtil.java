package cm.tonkine.backend.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;

/**
 * TOTP (RFC 6238 / HOTP RFC 4226) — compatible Google Authenticator, Authy,
 * et toute appli d'authentification standard. Implémenté directement (pas
 * de dépendance Maven externe) : l'algorithme est court et bien spécifié,
 * et on a déjà eu des soucis de dépendances mal résolues sur ce projet.
 */
public final class TotpUtil {

    private static final int STEP_SECONDES = 30;
    private static final int DIGITS = 6;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final String ISSUER = "TonKineAuTravail";

    private TotpUtil() {}

    /** Génère un secret aléatoire de 20 octets, encodé en Base32 (format standard TOTP). */
    public static String genererSecret() {
        byte[] bytes = new byte[20];
        RANDOM.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /** URI otpauth:// — la plupart des applis peuvent aussi saisir le secret à la main. */
    public static String genererUriOtpAuth(String secretBase32, String email) {
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
            ISSUER, email, secretBase32, ISSUER, DIGITS, STEP_SECONDES
        );
    }

    /** Vérifie un code à 6 chiffres, avec une tolérance de ±1 pas (30s) pour la dérive d'horloge. */
    public static boolean verifierCode(String secretBase32, String code) {
        if (secretBase32 == null || code == null || !code.matches("\\d{6}")) return false;
        long compteurActuel = System.currentTimeMillis() / 1000 / STEP_SECONDES;
        for (long delta = -1; delta <= 1; delta++) {
            if (genererCode(secretBase32, compteurActuel + delta).equals(code)) {
                return true;
            }
        }
        return false;
    }

    private static String genererCode(String secretBase32, long compteur) {
        byte[] key  = base32Decode(secretBase32);
        byte[] data = ByteBuffer.allocate(8).putLong(compteur).array();

        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0F;
            int binaire =
                ((hash[offset]     & 0x7f) << 24) |
                ((hash[offset + 1] & 0xff) << 16) |
                ((hash[offset + 2] & 0xff) << 8)  |
                 (hash[offset + 3] & 0xff);

            int otp = binaire % (int) Math.pow(10, DIGITS);
            return String.format("%0" + DIGITS + "d", otp);
        } catch (Exception e) {
            throw new IllegalStateException("Erreur de génération TOTP", e);
        }
    }

    // ── Base32 (RFC 4648) — pas de support natif en Java ──

    private static String base32Encode(byte[] data) {
        StringBuilder sb = new StringBuilder();
        int buffer = 0, bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1F;
                sb.append(BASE32_ALPHABET.charAt(index));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            sb.append(BASE32_ALPHABET.charAt(index));
        }
        return sb.toString();
    }

    private static byte[] base32Decode(String base32) {
        String nettoye = base32.trim().toUpperCase().replace("=", "");
        int buffer = 0, bitsLeft = 0;
        byte[] result = new byte[nettoye.length() * 5 / 8];
        int index = 0;
        for (char c : nettoye.toCharArray()) {
            int val = BASE32_ALPHABET.indexOf(c);
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                result[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return result;
    }
}
