package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.ProgressionProtocole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressionProtocoleRepository extends JpaRepository<ProgressionProtocole, Long> {

    /** Toutes les progressions d'un utilisateur */
    List<ProgressionProtocole> findByUtilisateurId(Long utilisateurId);

    /** Progression d'un utilisateur sur un protocole précis */
    Optional<ProgressionProtocole> findByUtilisateurIdAndProtocoleId(Long utilisateurId, Long protocoleId);
}
