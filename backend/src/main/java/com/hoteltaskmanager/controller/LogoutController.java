package com.hoteltaskmanager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Kontroler obsługujący wylogowywanie użytkowników.
 */
@RestController
public class LogoutController {

    /**
     * Obsługuje wylogowanie użytkownika.
     * @return Odpowiedź HTTP z komunikatem o powodzeniu operacji.
     */
    @PostMapping("/api/auth/logout")
    public ResponseEntity<?> logout() {
        System.out.println("Wylogowano pomyślnie!");
        return ResponseEntity.ok().body("Wylogowano pomyślnie!");
    }
}