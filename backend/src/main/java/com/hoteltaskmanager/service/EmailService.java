package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${mail.from}")
    private String fromAddress;

    /**
     * Wysyła e-mail z linkiem do resetowania hasła.
     *
     * @param to adres e-mail odbiorcy
     * @param resetToken token do resetowania hasła
     */
    public void sendPasswordResetEmail(String to, String resetToken) {
        String link = "http://localhost:8080/reset-password.html?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Resetowanie hasła");
        message.setText("Kliknij w poniższy link, aby zresetować hasło:\n" + link);
        message.setFrom(fromAddress);

        message.setTo(to);
        message.setSubject("Resetowanie hasła do konta");
        message.setText(
            "Cześć,\n\n" +
            "Otrzymaliśmy prośbę o zresetowanie Twojego hasła. Jeśli to nie Ty, możesz zignorować tę wiadomość.\n\n" +
            "Aby zresetować hasło, kliknij w poniższy link:\n" +
            link + "\n\n" +
            "Link będzie ważny przez 24 godziny.\n\n" +
            "Pozdrawiamy,\nHotel Task Manager"
        );

        message.setFrom(fromAddress);

        mailSender.send(message);
    }
}
