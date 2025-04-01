package com.hoteltaskmanager.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Klasa do obsługi hashowania i weryfikacji haseł użytkowników.
 */
@Component
public class PasswordHasher {

    private final PasswordEncoder passwordEncoder;

    /**
     * Konstruktor inicjalizujący kodowanie BCrypt.
     */
    public PasswordHasher() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Hashuje podane hasło.
     * @param password Hasło do zahashowania.
     * @return Zahashowane hasło.
     */
    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    /**
     * Sprawdza, czy podane hasło zgadza się z zahashowanym.
     * @param rawPassword Niezaszyfrowane hasło.
     * @param encodedPassword Zahashowane hasło.
     * @return true, jeśli hasła pasują; false w przeciwnym razie.
     */
    public boolean matchPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
