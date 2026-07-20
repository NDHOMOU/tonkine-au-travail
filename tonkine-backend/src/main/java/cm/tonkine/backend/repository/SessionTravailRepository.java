package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.SessionTravail;
import cm.tonkine.backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SessionTravailRepository extends JpaRepository<SessionTravail, Long> {

    /** Session ouverte (dateFin = null) pour un utilisateur */
    Optional<SessionTravail> findByUtilisateurAndDateFinIsNull(Utilisateur utilisateur);

    List<SessionTravail> findByUtilisateurOrderByDateDebutDesc(Utilisateur utilisateur);

    @Query("SELECT s FROM SessionTravail s WHERE s.utilisateur.id = :uid " +
           "AND s.dateDebut >= :debut ORDER BY s.dateDebut DESC")
    List<SessionTravail> findByUtilisateurAndPeriode(
        @Param("uid")   Long uid,
        @Param("debut") LocalDateTime debut
    );

    /** Score moyen global pour un employé sur une période */
    @Query("SELECT AVG(s.scoreGlobal) FROM SessionTravail s " +
           "WHERE s.utilisateur.id = :uid AND s.scoreGlobal IS NOT NULL " +
           "AND s.dateDebut >= :debut")
    Double avgScoreGlobalSince(@Param("uid") Long uid, @Param("debut") LocalDateTime debut);

    /** Toutes les sessions actives aujourd'hui (SANS filtre entreprise — usage interne uniquement) */
    @Query("SELECT s FROM SessionTravail s WHERE s.dateFin IS NULL " +
           "AND s.dateDebut >= :debutJournee ORDER BY s.scoreGlobal ASC")
    List<SessionTravail> findSessionsActivesAujourdhui(@Param("debutJournee") LocalDateTime debut);

    /**
     * Sessions actives aujourd'hui filtrées par entreprise.
     * À utiliser dans AdminController pour l'isolation multi-tenant.
     */
    @Query("SELECT s FROM SessionTravail s WHERE s.dateFin IS NULL " +
           "AND s.dateDebut >= :debutJournee " +
           "AND s.utilisateur.entreprise.id = :entrepriseId " +
           "ORDER BY s.scoreGlobal ASC")
    List<SessionTravail> findSessionsActivesAujourdhuiParEntreprise(
        @Param("debutJournee") LocalDateTime debut,
        @Param("entrepriseId") Long entrepriseId
    );
}
