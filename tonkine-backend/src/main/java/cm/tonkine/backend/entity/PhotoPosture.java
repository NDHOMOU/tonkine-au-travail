package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Photo de posture téléversée par l'employé à l'inscription.
 * 4 photos attendues : FACE, DOS, PROFIL_GAUCHE, PROFIL_DROIT.
 */
@Entity
@Table(name = "photos_posture")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PhotoPosture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profil_id", nullable = false)
    private ProfilErgonomique profil;

    public enum VuePhoto { FACE, DOS, PROFIL_GAUCHE, PROFIL_DROIT }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VuePhoto vue;

    /** Chemin relatif du fichier sur le serveur (ex: /uploads/photos-posture/user_1/face.jpg) */
    @Column(nullable = false, length = 500)
    private String cheminFichier;

    /** Nom original du fichier uploadé */
    @Column(length = 255)
    private String nomOriginal;

    /** Type MIME : image/jpeg, image/png */
    @Column(length = 50)
    private String typeMime;

    /** Taille en octets */
    private Long tailleOctets;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    @PrePersist
    protected void onCreate() {
        dateUpload = LocalDateTime.now();
    }
}
