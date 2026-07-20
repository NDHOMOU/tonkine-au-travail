package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Exercice;
import cm.tonkine.backend.enums.ZoneCorps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciceRepository extends JpaRepository<Exercice, Long> {

    List<Exercice> findByActifTrue();

    List<Exercice> findByZoneAndActifTrue(ZoneCorps zone);

    /** Exercices correspondant à au moins un des hobbies de l'employé */
    @Query("SELECT e FROM Exercice e WHERE e.actif = true " +
           "AND (e.hobbiesAssocies IS NULL OR e.hobbiesAssocies LIKE %:hobbie%)")
    List<Exercice> findByHobbieContaining(@Param("hobbie") String hobbie);

    /** Exercices adaptés à un profil : zone prioritaire + hobbies */
    @Query("SELECT e FROM Exercice e WHERE e.actif = true AND e.zone = :zone " +
           "ORDER BY e.niveauDifficulte ASC")
    List<Exercice> findByZoneOrderByDifficulte(@Param("zone") ZoneCorps zone);
}
