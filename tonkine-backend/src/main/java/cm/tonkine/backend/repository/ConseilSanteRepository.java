package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.ConseilSante;
import cm.tonkine.backend.enums.StatutConseil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConseilSanteRepository extends JpaRepository<ConseilSante, Long> {

    /** Toutes les demandes d'un employé (les plus récentes en premier) */
    List<ConseilSante> findByEmployeIdOrderByDateQuestionDesc(Long employeId);

    /** File d'attente du kiné — triée urgence d'abord, puis date */
    @Query("""
        SELECT c FROM ConseilSante c
        WHERE c.kine.id = :kineId
        ORDER BY c.niveauUrgence DESC, c.dateQuestion ASC
        """)
    List<ConseilSante> findByKineIdOrderByUrgenceEtDate(@Param("kineId") Long kineId);

    /** Demandes en attente pour un kiné */
    List<ConseilSante> findByKineIdAndStatutOrderByDateQuestionAsc(
        Long kineId, StatutConseil statut);

    /** Nombre de demandes non traitées pour un kiné */
    long countByKineIdAndStatutNot(Long kineId, StatutConseil statut);

    /** Nombre de demandes urgentes en attente */
    long countByKineIdAndNiveauUrgenceAndStatutNot(
        Long kineId, String niveauUrgence, StatutConseil statut);

    /** Toutes les demandes d'une entreprise (pour l'admin) */
    List<ConseilSante> findByEntrepriseIdOrderByDateQuestionDesc(Long entrepriseId);
}
