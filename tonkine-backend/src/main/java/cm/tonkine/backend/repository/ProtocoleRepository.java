package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Protocole;
import cm.tonkine.backend.enums.ZoneCorps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProtocoleRepository extends JpaRepository<Protocole, Long> {

    /** Protocoles visibles par un employé : contenu global + celui de sa propre entreprise */
    @Query("SELECT p FROM Protocole p WHERE p.actif = true " +
           "AND (p.entreprise IS NULL OR p.entreprise.id = :entrepriseId) " +
           "AND (:zone IS NULL OR p.zone = :zone)")
    List<Protocole> findVisiblesParEntreprise(@Param("entrepriseId") Long entrepriseId, @Param("zone") ZoneCorps zone);

    /** Protocoles gérés par le kiné : uniquement le contenu propre à son entreprise (pas le global) */
    List<Protocole> findByEntrepriseIdOrderByTitreAsc(Long entrepriseId);
}
