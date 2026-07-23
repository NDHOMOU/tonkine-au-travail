package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Alerte;
import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AlerteRepository extends JpaRepository<Alerte, Long> {

    List<Alerte> findByUtilisateurIdOrderByDateEnvoiDesc(Long utilisateurId);

    List<Alerte> findByStatutIn(List<StatutAlerte> statuts);

    /** Toutes alertes non traitées — usage interne uniquement (sans filtre tenant). */
    @Query("SELECT a FROM Alerte a WHERE a.statut IN ('ENVOYEE','VUE') " +
           "ORDER BY a.dateEnvoi DESC")
    List<Alerte> findAlertesNonTraitees();

    /**
     * Alertes non traitées filtrées par entreprise.
     * À utiliser dans AdminController / KineController pour l'isolation multi-tenant.
     * JOIN FETCH utilisateur/session : AdminController lit ensuite leurs champs
     * hors transaction — évite un LazyInitializationException.
     */
    @Query("SELECT a FROM Alerte a JOIN FETCH a.utilisateur u LEFT JOIN FETCH a.session " +
           "WHERE a.statut IN ('ENVOYEE','VUE') " +
           "AND u.entreprise.id = :entrepriseId " +
           "ORDER BY a.dateEnvoi DESC")
    List<Alerte> findAlertesNonTraiteesParEntreprise(@Param("entrepriseId") Long entrepriseId);

    /** Compte des employés inscrits dans une entreprise donnée. */
    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.entreprise.id = :entrepriseId")
    long countByEntreprise(@Param("entrepriseId") Long entrepriseId);

    @Query("SELECT COUNT(a) FROM Alerte a WHERE a.utilisateur.id = :uid " +
           "AND a.dateEnvoi >= :debut AND a.statut = 'IGNOREE'")
    long countAlertesIgnoreesDepuis(
        @Param("uid")   Long uid,
        @Param("debut") LocalDateTime debut
    );

    @Query("SELECT COUNT(a) FROM Alerte a WHERE a.utilisateur.id = :uid " +
           "AND a.dateEnvoi >= :debut AND a.statut = 'PAUSE_EFFECTUEE'")
    long countPausesEffectueesDepuis(
        @Param("uid")   Long uid,
        @Param("debut") LocalDateTime debut
    );
}
