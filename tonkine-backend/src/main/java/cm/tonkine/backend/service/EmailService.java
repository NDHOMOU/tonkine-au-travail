package cm.tonkine.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String expediteur;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoie un e-mail texte simple. N'importe quelle erreur (SMTP non
     * configuré, identifiants invalides, service indisponible) est
     * capturée et journalisée — elle ne doit jamais faire échouer
     * l'appel HTTP qui a déclenché l'envoi (ex. mot de passe oublié,
     * dont la réponse doit rester générique pour ne pas révéler si
     * un compte existe).
     */
    public void envoyer(String destinataire, String sujet, String corps) {
        if (expediteur == null || expediteur.isBlank()) {
            log.warn("✉️ Envoi d'e-mail ignoré (TONKINE_MAIL_USERNAME non configuré) — destinataire={}", destinataire);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(expediteur);
            message.setTo(destinataire);
            message.setSubject(sujet);
            message.setText(corps);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("✉️ Échec de l'envoi d'e-mail à {} : {}", destinataire, e.getMessage());
        }
    }
}
