package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Kinésithérapeute partenaire disponible pour les RDV.
 */
@Entity
@Table(name = "kinesitherapeutes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Kinesitherapeute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String biographie;

    /** Spécialités : "TMS,Cervicales,Lombaires" */
    @Column(length = 500)
    private String specialites;

    /** Modes d'intervention : "Cabinet,Entreprise,Domicile" */
    @Column(length = 200)
    private String modesIntervention;

    /** Note moyenne sur 5 */
    private Double noteMoyenne;

    private Integer nombreAvis;

    @Column(length = 200)
    private String adresseCabinet;

    @Column(length = 100)
    private String ville;

    @Column(length = 20)
    private String telephone;

    @Column(length = 200)
    private String email;

    /** Chemin de la photo de profil */
    @Column(length = 500)
    private String urlPhoto;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @OneToMany(mappedBy = "kinesitherapeute", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RendezVous> rendezVous = new ArrayList<>();
}
