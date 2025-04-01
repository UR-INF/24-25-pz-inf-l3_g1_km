package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Serwis odpowiedzialny za wysyłanie wiadomości e-mail.
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Wysyła e-mail z linkiem do resetowania hasła.
     *
     * @param to adres e-mail odbiorcy
     * @param resetToken token do resetowania hasła
     */
    public void sendPasswordResetEmail(String to, String resetToken) {
        String link = "http://localhost:3000/reset-password?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Resetowanie hasła");
        message.setText("Kliknij w poniższy link, aby zresetować hasło:\n" + link);

        mailSender.send(message);
    }
}
