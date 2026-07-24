package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Exercice;
import cm.tonkine.backend.enums.ZoneCorps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciceRepository extends JpaRepository<Exercice, Long> {

    /** Bibliothèque visible par un employé : contenu global + celui de sa propre entreprise */
    @Query("SELECT e FROM Exercice e WHERE e.actif = true " +
           "AND (e.entreprise IS NULL OR e.entreprise.id = :entrepriseId)")
    List<Exercice> findVisiblesParEntreprise(@Param("entrepriseId") Long entrepriseId);

    @Query("SELECT e FROM Exercice e WHERE e.actif = true AND e.zone = :zone " +
           "AND (e.entreprise IS NULL OR e.entreprise.id = :entrepriseId)")
    List<Exercice> findVisiblesParEntrepriseEtZone(@Param("entrepriseId") Long entrepriseId, @Param("zone") ZoneCorps zone);

    /** Exercices correspondant à au moins un des hobbies de l'employé */
    @Query("SELECT e FROM Exercice e WHERE e.actif = true " +
           "AND (e.entreprise IS NULL OR e.entreprise.id = :entrepriseId) " +
           "AND (e.hobbiesAssocies IS NULL OR e.hobbiesAssocies LIKE %:hobbie%)")
    List<Exercice> findByHobbieContaining(@Param("entrepriseId") Long entrepriseId, @Param("hobbie") String hobbie);

    /** Bibliothèque gérée par le kiné : uniquement le contenu propre à son entreprise (pas le global) */
    List<Exercice> findByEntrepriseIdOrderByTitreAsc(Long entrepriseId);
}
