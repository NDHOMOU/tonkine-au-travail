package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Protocole curatif : ensemble progressif d'exercices sur plusieurs semaines
 * pour traiter une douleur ou un TMS déclaré.
 */
@Entity
@Table(name = "protocoles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Protocole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ZoneCorps zone;

    /** Durée totale du protocole en semaines */
    @Column(nullable = false)
    private Integer dureeSemaines;

    /** Avertissement médical affiché avant de commencer */
    @Column(columnDefinition = "TEXT")
    private String avertissementMedical;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @OneToMany(mappedBy = "protocole", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @OrderBy("semaine ASC, ordre ASC")
    @Builder.Default
    private List<EtapeProtocole> etapes = new ArrayList<>();
}
