package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.JournalAudit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalAuditRepository extends JpaRepository<JournalAudit, Long> {

    /** JOIN FETCH acteur : évite un LazyInitializationException hors transaction. */
    @Query("SELECT j FROM JournalAudit j JOIN FETCH j.acteur a " +
           "WHERE a.entreprise.id = :entrepriseId " +
           "ORDER BY j.dateAction DESC")
    List<JournalAudit> findRecentParEntreprise(@Param("entrepriseId") Long entrepriseId, Pageable pageable);
}
