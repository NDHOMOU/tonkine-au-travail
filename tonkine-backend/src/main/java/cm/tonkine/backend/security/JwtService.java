package cm.tonkine.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service JWT : génération, validation et extraction des tokens.
 * Algorithme : HS256 (HMAC-SHA256) avec clé secrète configurable.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String DEV_SECRET_PREFIX = "tonkine-dev-only-secret";

    @Value("${tonkine.jwt.secret}")
    private String secretKey;

    @Value("${tonkine.jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Avertissement critique si la clé de développement est utilisée en dehors du profil h2.
     * Un déploiement production avec la clé par défaut est une faille de sécurité majeure.
     */
    @PostConstruct
    public void verifierCleSecrete() {
        if (secretKey.startsWith(DEV_SECRET_PREFIX)) {
            log.warn("⚠️  ================================================================");
            log.warn("⚠️  CLÉ JWT PAR DÉFAUT DÉTECTÉE — NON SÉCURISÉE POUR LA PRODUCTION");
            log.warn("⚠️  Définissez la variable d'environnement TONKINE_JWT_SECRET");
            log.warn("⚠️  Générez une clé : openssl rand -hex 64");
            log.warn("⚠️  ================================================================");
        }
    }

    /** Extrait l'email (subject) du token. */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Vérifie que le token est valide pour cet utilisateur. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /** Génère un token JWT pour l'utilisateur avec claims additionnels. */
    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /** Génère un token JWT simple (sans claims additionnels). */
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, new HashMap<>());
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(secretKey.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
