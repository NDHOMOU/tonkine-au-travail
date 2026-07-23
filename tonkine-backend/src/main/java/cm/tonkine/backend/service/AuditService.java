package cm.tonkine.backend.service;

import cm.tonkine.backend.entity.JournalAudit;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.JournalAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final JournalAuditRepository journalAuditRepository;

    @Transactional
    public void enregistrer(Utilisateur acteur, String action, String details) {
        journalAuditRepository.save(JournalAudit.builder()
            .acteur(acteur)
            .action(action)
            .details(details)
            .build());
    }
}
