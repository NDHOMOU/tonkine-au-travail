package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.ProfilErgonomique;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfilErgonomiqueRepository extends JpaRepository<ProfilErgonomique, Long> {
    Optional<ProfilErgonomique> findByUtilisateurId(Long utilisateurId);
}
