package cm.tonkine.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TonKiné au Travail — Backend Spring Boot
 * Kinésithérapie d'entreprise · Prévention TMS
 *
 * Démarrage : mvn spring-boot:run -Dspring-boot.run.profiles=postgres
 * Tests     : mvn test -Dspring.profiles.active=h2
 */
@SpringBootApplication
public class TonkineApplication {
    public static void main(String[] args) {
        SpringApplication.run(TonkineApplication.class, args);
    }
}
