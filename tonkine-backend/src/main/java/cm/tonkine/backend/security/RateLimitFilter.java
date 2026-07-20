package cm.tonkine.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Protection brute-force sur les endpoints d'authentification.
 *
 * Stratégie : fenêtre glissante par adresse IP.
 * - Max {@value #MAX_TENTATIVES} tentatives en {@value #FENETRE_SECONDES} secondes
 * - Dépasser ce seuil retourne HTTP 429 pendant {@value #BLOCAGE_SECONDES} secondes
 *
 * Routes protégées : POST /auth/connexion, POST /auth/inscription
 *
 * En production, préférer un rate-limiter distribué (Redis + Bucket4j)
 * si vous avez plusieurs instances backend.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    /** Nombre maximal de tentatives dans la fenêtre */
    private static final int MAX_TENTATIVES = 10;
    /** Fenêtre d'observation en secondes */
    private static final long FENETRE_SECONDES = 300; // 5 minutes
    /** Durée de blocage après dépassement (secondes) */
    private static final long BLOCAGE_SECONDES = 900; // 15 minutes

    /** Stockage en mémoire : IP → compteur + timestamp début fenêtre */
    private final Map<String, BucketInfo> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        // Appliquer uniquement sur les endpoints d'authentification en POST
        return !("POST".equals(method) &&
                 (path.contains("/auth/connexion") || path.contains("/auth/inscription")));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String ip = getClientIp(request);
        long maintenant = Instant.now().getEpochSecond();

        BucketInfo bucket = buckets.computeIfAbsent(ip, k -> new BucketInfo(maintenant));

        synchronized (bucket) {
            // Réinitialiser la fenêtre si expirée
            if (maintenant - bucket.debutFenetre > FENETRE_SECONDES) {
                bucket.debutFenetre = maintenant;
                bucket.compteur.set(0);
                bucket.bloquéJusquA = 0;
            }

            // IP bloquée ?
            if (bucket.bloquéJusquA > 0 && maintenant < bucket.bloquéJusquA) {
                long resteSecondes = bucket.bloquéJusquA - maintenant;
                log.warn("🔒 Tentative bloquée (rate limit) depuis IP={} — encore {}s", ip, resteSecondes);
                envoyerErreur429(response, resteSecondes);
                return;
            }

            // Incrémenter et vérifier
            int tentatives = bucket.compteur.incrementAndGet();
            if (tentatives > MAX_TENTATIVES) {
                bucket.bloquéJusquA = maintenant + BLOCAGE_SECONDES;
                log.warn("🚨 IP={} bloquée pour {}s après {} tentatives", ip, BLOCAGE_SECONDES, tentatives);
                envoyerErreur429(response, BLOCAGE_SECONDES);
                return;
            }
        }

        chain.doFilter(request, response);

        // Nettoyage périodique des entrées expirées (toutes les 1000 requêtes env.)
        if (buckets.size() > 1000) {
            purgerAnciensEnregistrements(maintenant);
        }
    }

    private void envoyerErreur429(HttpServletResponse response, long resteSecondes)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", String.valueOf(resteSecondes));
        response.getWriter().write(
            "{\"erreur\":\"Trop de tentatives. Réessayez dans " + resteSecondes + " secondes.\"}"
        );
    }

    private String getClientIp(HttpServletRequest request) {
        // Respecter les en-têtes proxy (Nginx, Cloudflare)
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void purgerAnciensEnregistrements(long maintenant) {
        buckets.entrySet().removeIf(e ->
            maintenant - e.getValue().debutFenetre > FENETRE_SECONDES * 2
            && e.getValue().bloquéJusquA < maintenant
        );
    }

    /** Stocke l'état du rate-limit pour une IP donnée. */
    private static class BucketInfo {
        volatile long debutFenetre;
        final AtomicInteger compteur = new AtomicInteger(0);
        volatile long bloquéJusquA = 0;

        BucketInfo(long debutFenetre) {
            this.debutFenetre = debutFenetre;
        }
    }
}
