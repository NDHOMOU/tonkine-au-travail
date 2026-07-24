package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.RecommandationProduit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommandationProduitRepository extends JpaRepository<RecommandationProduit, Long> {

    List<RecommandationProduit> findByEntrepriseIdAndActifTrueOrderByTitreAsc(Long entrepriseId);

    List<RecommandationProduit> findByEntrepriseIdOrderByTitreAsc(Long entrepriseId);
}
