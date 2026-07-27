package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.request.MettreAJourProfilRequest;
import cm.tonkine.backend.dto.response.MonProfilResponse;
import cm.tonkine.backend.entity.ProfilErgonomique;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.ProfilErgonomiqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Consultation et mise à jour du profil ergonomique par l'employé lui-même
 * (mesures corporelles, poste actuel, douleurs déclarées, hobbies, planning)
 * — rien de tout cela n'était modifiable après l'inscription jusqu'ici.
 */
@Service
@RequiredArgsConstructor
public class ProfilErgonomiqueService {

    private final ProfilErgonomiqueRepository profilRepository;

    @Transactional(readOnly = true)
    public MonProfilResponse getMonProfil(Utilisateur utilisateur) {
        ProfilErgonomique profil = profilRepository.findByUtilisateurId(utilisateur.getId())
            .orElseThrow(() -> new IllegalArgumentException("Profil ergonomique introuvable"));

        return MonProfilResponse.builder()
            .prenom(utilisateur.getPrenom())
            .nom(utilisateur.getNom())
            .email(utilisateur.getEmail())
            .departement(utilisateur.getDepartement())
            .poste(utilisateur.getPoste())
            .tailleCm(profil.getTailleCm())
            .longueurJambeCm(profil.getLongueurJambeCm())
            .longueurAvantBrasCm(profil.getLongueurAvantBrasCm())
            .poidsKg(profil.getPoidsKg())
            .typeSiege(profil.getTypeSiege())
            .typeEcran(profil.getTypeEcran())
            .bureauReglable(profil.getBureauReglable())
            .reposePieds(profil.getReposePieds())
            .heuresAssiParJour(profil.getHeuresAssiParJour())
            .douleursDeclarees(profil.getDouleursDeclarees())
            .hobbies(profil.getHobbies())
            .joursTravailes(profil.getJoursTravailes())
            .heureArrivee(profil.getHeureArrivee())
            .heureDepart(profil.getHeureDepart())
            .hauteurSiegeRecommandeCm(profil.getHauteurSiegeRecommandeCm())
            .hauteurBureauRecommandeCm(profil.getHauteurBureauRecommandeCm())
            .hauteurEcranRecommandeCm(profil.getHauteurEcranRecommandeCm())
            .build();
    }

    @Transactional
    public MonProfilResponse mettreAJourProfil(Utilisateur utilisateur, MettreAJourProfilRequest req) {
        ProfilErgonomique profil = profilRepository.findByUtilisateurId(utilisateur.getId())
            .orElseThrow(() -> new IllegalArgumentException("Profil ergonomique introuvable"));

        profil.setTailleCm(req.getTailleCm());
        profil.setLongueurJambeCm(req.getLongueurJambeCm());
        profil.setLongueurAvantBrasCm(req.getLongueurAvantBrasCm());
        profil.setPoidsKg(req.getPoidsKg());
        profil.setTypeSiege(req.getTypeSiege());
        profil.setTypeEcran(req.getTypeEcran());
        if (req.getBureauReglable() != null) profil.setBureauReglable(req.getBureauReglable());
        if (req.getReposePieds()   != null) profil.setReposePieds(req.getReposePieds());
        profil.setHeuresAssiParJour(req.getHeuresAssiParJour());
        profil.setDouleursDeclarees(req.getDouleursDeclarees());
        profil.setHobbies(req.getHobbies());
        profil.setJoursTravailes(req.getJoursTravailes());
        profil.setHeureArrivee(req.getHeureArrivee());
        profil.setHeureDepart(req.getHeureDepart());

        // @PreUpdate sur l'entité recalcule automatiquement hauteurSiegeRecommandeCm etc.
        profilRepository.save(profil);

        return getMonProfil(utilisateur);
    }
}
