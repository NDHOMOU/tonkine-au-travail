package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.RendezVous;
import cm.tonkine.backend.enums.StatutRdv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    /** Historique RDV d'un employé (du plus récent au plus ancien) */
    List<RendezVous> findByEmployeIdOrderByDateRdvDesc(Long employeId);

    /** Agenda du kiné pour une date donnée */
    List<RendezVous> findByKineIdAndDateRdvOrderByHeureDebutAsc(Long kineId, LocalDate date);

    /** Agenda du kiné sur une semaine (pour la vue planning) */
    List<RendezVous> findByKineIdAndDateRdvBetweenOrderByDateRdvAscHeureDebutAsc(
        Long kineId, LocalDate debut, LocalDate fin);

    /** Vérifie si un créneau est déjà pris pour le kiné */
    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM RendezVous r
        WHERE r.kine.id = :kineId
          AND r.dateRdv = :date
          AND r.heureDebut = :heure
          AND r.statut != 'ANNULE'
        """)
    boolean isCreneauPris(
        @Param("kineId") Long kineId,
        @Param("date")   LocalDate date,
        @Param("heure")  LocalTime heure
    );

    long countByEmployeIdAndStatut(Long employeId, StatutRdv statut);

    /** Prochains RDV confirmés pour un employé */
    List<RendezVous> findByEmployeIdAndDateRdvGreaterThanEqualAndStatutOrderByDateRdvAsc(
        Long employeId, LocalDate date, StatutRdv statut);
}
