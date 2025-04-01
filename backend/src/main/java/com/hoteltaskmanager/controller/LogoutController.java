package com.hoteltaskmanager.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LogoutController {

    @PostMapping("/api/logout")
    public ResponseEntity<?> logout() {
        System.out.println("Wylogowano pomyślnie!");
        return ResponseEntity.ok().body("Wylogowano pomyślnie!");
    }
}