package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Protocole;
import cm.tonkine.backend.enums.ZoneCorps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProtocoleRepository extends JpaRepository<Protocole, Long> {

    /** Tous les protocoles actifs pour une zone donnée */
    List<Protocole> findByZoneAndActifTrue(ZoneCorps zone);

    /** Tous les protocoles actifs (sans filtre zone) */
    List<Protocole> findByActifTrue();
}
