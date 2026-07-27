package cm.tonkine.backend.service;

import cm.tonkine.backend.dto.request.EvaluationPosteRequest;
import cm.tonkine.backend.dto.response.EvaluationPosteResponse;
import cm.tonkine.backend.entity.ProfilErgonomique;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.ProfilErgonomiqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Évalue si un poste de travail (siège + bureau) convient à l'employé — soit
 * à partir d'un angle de genou mesuré en direct par la webcam pendant qu'il
 * est assis dessus, soit à partir des mesures d'un meuble qu'il envisage
 * d'acheter (utilisable en magasin, sans webcam).
 *
 * Note technique : une webcam 2D ne mesure pas de distances réelles (pas de
 * profondeur), seulement des angles. Le scan en direct donne donc un verdict
 * sur la posture (l'angle du genou est-il correct ?), pas une hauteur en cm —
 * pour ça, on compare aux mesures du meuble saisies manuellement.
 */
@Service
@RequiredArgsConstructor
public class ErgonomieService {

    private static final double ANGLE_GENOU_MIN = 85.0;
    private static final double ANGLE_GENOU_MAX = 105.0;
    private static final int    TOLERANCE_CM     = 2;

    private final ProfilErgonomiqueRepository profilRepository;

    public EvaluationPosteResponse evaluerPoste(EvaluationPosteRequest req, Utilisateur utilisateur) {
        ProfilErgonomique profil = profilRepository.findByUtilisateurId(utilisateur.getId())
            .orElseThrow(() -> new IllegalArgumentException(
                "Complétez d'abord votre profil ergonomique (taille, longueur de jambe) pour obtenir une recommandation."));

        Integer siegeIdeal  = profil.getHauteurSiegeRecommandeCm();
        Integer bureauIdeal = profil.getHauteurBureauRecommandeCm();
        Integer ecranIdeal  = profil.getHauteurEcranRecommandeCm();

        EvaluationPosteResponse.EvaluationPosteResponseBuilder rep = EvaluationPosteResponse.builder()
            .hauteurSiegeIdealeCm(siegeIdeal)
            .hauteurBureauIdealeCm(bureauIdeal)
            .hauteurEcranIdealeCm(ecranIdeal);

        if (req.getAngleGenouMesure() != null) {
            double angle = req.getAngleGenouMesure();
            String verdict;
            String message;
            if (angle >= ANGLE_GENOU_MIN && angle <= ANGLE_GENOU_MAX) {
                verdict = "CORRECT";
                message = String.format("Angle du genou correct (%.0f°) — ce siège et ce bureau vous conviennent bien.", angle);
            } else if (angle < ANGLE_GENOU_MIN) {
                verdict = "SIEGE_TROP_BAS";
                message = String.format("Angle du genou trop fermé (%.0f°) — le siège est trop bas pour vous par rapport au bureau (ou le bureau trop haut).", angle);
            } else {
                verdict = "SIEGE_TROP_HAUT";
                message = String.format("Angle du genou trop ouvert (%.0f°) — le siège est trop haut pour vous.", angle);
            }
            rep.verdictAngleGenou(verdict).messageAngleGenou(message);
        }

        if (req.getHauteurSiegeCm() != null && siegeIdeal != null) {
            int ecart = req.getHauteurSiegeCm() - siegeIdeal;
            rep.ecartSiegeCm(ecart).verdictSiege(verdictEcart(ecart));
        }

        if (req.getHauteurBureauCm() != null && bureauIdeal != null) {
            int ecart = req.getHauteurBureauCm() - bureauIdeal;
            rep.ecartBureauCm(ecart).verdictBureau(verdictEcart(ecart));
        }

        return rep.build();
    }

    private String verdictEcart(int ecartCm) {
        if (Math.abs(ecartCm) <= TOLERANCE_CM) return "CORRECT";
        return ecartCm > 0 ? "TROP_HAUT" : "TROP_BAS";
    }
}
