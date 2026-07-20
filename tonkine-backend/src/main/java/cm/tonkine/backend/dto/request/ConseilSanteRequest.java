package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Demande de conseil kinésithérapique envoyée par un employé.
 */
@Data
public class ConseilSanteRequest {

    @NotBlank(message = "La question est obligatoire")
    @Size(min = 10, max = 2000, message = "La question doit contenir entre 10 et 2000 caractères")
    private String question;

    /**
     * Zone du corps concernée (optionnel).
     * Valeurs : DOS_LOMBAIRES, NUQUE_CERVICALES, EPAULES, POIGNETS_AVANT_BRAS,
     *           HANCHES_BASSIN, YEUX_VISION
     */
    private String zoneConcernee;

    /**
     * Niveau d'urgence perçu par l'employé.
     * NORMAL (défaut) ou URGENT (douleur aiguë, mouvement difficile).
     */
    private String niveauUrgence = "NORMAL";
}
