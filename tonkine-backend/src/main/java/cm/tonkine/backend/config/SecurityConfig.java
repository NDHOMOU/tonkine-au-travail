package cm.tonkine.backend.config;

import cm.tonkine.backend.repository.UtilisateurRepository;
import cm.tonkine.backend.security.JwtAuthFilter;
import cm.tonkine.backend.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration Spring Security.
 * - Authentification JWT stateless (pas de session serveur)
 * - CORS ouvert vers React (ports 3000 / 5173)
 * - Rôles EMPLOYE et ADMIN_RH
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter            jwtAuthFilter;
    private final RateLimitFilter          rateLimitFilter;
    private final UtilisateurRepository    utilisateurRepository;

    @Value("${tonkine.cors.allowed-origins}")
    private String allowedOriginsStr;

    /** Routes publiques — accessibles sans token */
    private static final String[] PUBLIC_ROUTES = {
        "/auth/connexion",
        "/auth/inscription",
        "/auth/entreprises",       // liste des entreprises pour le formulaire d'inscription
        "/h2-console/**",
        "/actuator/health"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers
                // Empêche les navigateurs d'interpréter le contenu différemment du Content-Type déclaré
                .contentTypeOptions(ct -> {})
                // Empêche l'intégration dans des iframes d'autres origines (sauf H2 console)
                .frameOptions(frame -> frame.sameOrigin())
                // Force HTTPS en production (ignoré si HTTP)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000) // 1 an
                )
                // Limite les informations envoyées dans le Referer
                .referrerPolicy(rp -> rp
                    .policy(org.springframework.security.web.header.writers
                        .ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                // Permissions API — webcam autorisée (nécessaire pour MoveNet posture)
                // microphone, géolocalisation et paiement désactivés
                .permissionsPolicy(pp -> pp.policy(
                    "camera=(self), microphone=(), geolocation=(), payment=()"
                ))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ROUTES).permitAll()
                // Tableau de bord Admin RH
                .requestMatchers("/admin/**").hasRole("ADMIN_RH")
                // Tableau de bord Kinésithérapeute
                .requestMatchers("/kine/**").hasRole("KINESITHERAPEUTE")
                // Notes de séance accessibles au kiné
                .requestMatchers("/rdv/*/notes").hasRole("KINESITHERAPEUTE")
                // File de conseils — kiné uniquement
                .requestMatchers("/conseils/file").hasRole("KINESITHERAPEUTE")
                // Tout le reste nécessite une authentification
                .anyRequest().authenticated()
            )
            // Pas de session HTTP — tout passe par JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            // Rate limiter passe en premier (avant JWT) pour bloquer au plus tôt
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Utilisateur non trouvé : " + email
            ));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt avec force 12 — bon équilibre sécurité / performance
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOriginsStr.split(","));
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
