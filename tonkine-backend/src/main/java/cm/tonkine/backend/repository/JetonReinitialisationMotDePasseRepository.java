package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.JetonReinitialisationMotDePasse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JetonReinitialisationMotDePasseRepository
        extends JpaRepository<JetonReinitialisationMotDePasse, Long> {

    Optional<JetonReinitialisationMotDePasse> findByJeton(String jeton);
}
