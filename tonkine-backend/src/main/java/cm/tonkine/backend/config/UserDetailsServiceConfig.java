package cm.tonkine.backend.config;

import cm.tonkine.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Bean UserDetailsService isolé dans sa propre configuration.
 * Nécessaire pour éviter une dépendance circulaire : JwtAuthFilter a besoin
 * de UserDetailsService, et SecurityConfig a besoin de JwtAuthFilter — si
 * UserDetailsService était défini dans SecurityConfig, Spring ne pourrait
 * jamais terminer d'instancier ni l'un ni l'autre.
 */
@Configuration
@RequiredArgsConstructor
public class UserDetailsServiceConfig {

    private final UtilisateurRepository utilisateurRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Utilisateur non trouvé : " + email
            ));
    }
}
