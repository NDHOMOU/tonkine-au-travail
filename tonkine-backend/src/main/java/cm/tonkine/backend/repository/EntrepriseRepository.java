package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {

    Optional<Entreprise> findByNomIgnoreCase(String nom);

    boolean existsByEmailContact(String emailContact);
}
