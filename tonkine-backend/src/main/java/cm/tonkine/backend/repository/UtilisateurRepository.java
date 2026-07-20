package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    // ── Compatibilité ancienne (sans multi-tenant) ──
    List<Utilisateur> findByRole(Role role);
    List<Utilisateur> findByDepartementAndRole(String departement, Role role);

    // ── Multi-tenant : requêtes isolées par entreprise ──

    /** Trouve le kinésithérapeute attitré d'une entreprise */
    Optional<Utilisateur> findByEntrepriseIdAndRole(Long entrepriseId, Role role);

    /** Tous les employés actifs d'une entreprise, par rôle */
    List<Utilisateur> findByEntrepriseIdAndRoleAndActifTrue(Long entrepriseId, Role role);

    /** Tous les utilisateurs actifs d'une entreprise (tous rôles) */
    List<Utilisateur> findByEntrepriseIdAndActifTrue(Long entrepriseId);

    /** Nombre d'utilisateurs par rôle dans une entreprise */
    long countByEntrepriseIdAndRole(Long entrepriseId, Role role);

    /** Nombre d'employés actifs dans une entreprise */
    long countByEntrepriseIdAndRoleAndActifTrue(Long entrepriseId, Role role);

    /** Employés sans session active en cours (non connectés / app inactive) */
    @Query("""
        SELECT u FROM Utilisateur u
        WHERE u.entreprise.id = :entrepriseId
          AND u.role = cm.tonkine.backend.enums.Role.EMPLOYE
          AND u.actif = true
          AND u.id NOT IN (
              SELECT s.utilisateur.id FROM SessionTravail s
              WHERE s.dateFin IS NULL
          )
        ORDER BY u.nom
        """)
    List<Utilisateur> findEmployesSansSessionActive(@Param("entrepriseId") Long entrepriseId);

    @Query("SELECT u FROM Utilisateur u WHERE u.actif = true AND u.role = cm.tonkine.backend.enums.Role.EMPLOYE ORDER BY u.nom")
    List<Utilisateur> findAllEmployesActifs();

    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.role = :role AND u.actif = true")
    long countByRoleAndActif(@Param("role") Role role);
}
