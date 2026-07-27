package cm.tonkine.backend.dto.request;

import lombok.Data;

/**
 * Évaluation d'un poste de travail (siège + bureau) candidat — soit par scan
 * webcam en direct (angle du genou mesuré), soit en renseignant les mesures
 * d'un meuble (magasin, autre poste...). Les deux champs sont facultatifs et
 * indépendants : on peut envoyer l'un, l'autre, ou les deux à la fois.
 */
@Data
public class EvaluationPosteRequest {

    /** Angle du genou (hanche-genou-cheville) mesuré en direct par la webcam, en degrés */
    private Double angleGenouMesure;

    /** Hauteur d'assise du siège candidat, en cm */
    private Integer hauteurSiegeCm;

    /** Hauteur du plan de bureau candidat, en cm */
    private Integer hauteurBureauCm;
}
