package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.JournalConnexion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalConnexionRepository extends JpaRepository<JournalConnexion, Long> {

    @Query("SELECT j FROM JournalConnexion j JOIN FETCH j.utilisateur u " +
           "WHERE u.entreprise.id = :entrepriseId " +
           "ORDER BY j.dateConnexion DESC")
    List<JournalConnexion> findRecentesParEntreprise(@Param("entrepriseId") Long entrepriseId, Pageable pageable);
}
