package cm.tonkine.backend.repository;

import cm.tonkine.backend.entity.Kinesitherapeute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KinesitherapeuteRepository extends JpaRepository<Kinesitherapeute, Long> {
    List<Kinesitherapeute> findByActifTrueOrderByNoteMoyenneDesc();
    List<Kinesitherapeute> findByVilleAndActifTrue(String ville);
}
