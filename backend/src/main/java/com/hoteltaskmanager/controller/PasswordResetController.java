package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.security.PasswordHasher;
import com.hoteltaskmanager.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Kontroler obsługujący proces resetowania hasła użytkownika.
 */
@RestController
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordHasher passwordHasher;

    /**
     * Endpoint do wysłania żądania resetu hasła.
     *
     * Przyjmuje żądanie w formacie JSON z polem "email", np:
     * {
     *     "email": "user@example.com"
     * }
     *
     * Generuje unikalny token resetujący, zapisuje go w bazie danych
     * i wysyła link resetujący na podany adres e-mail.
     *
     * @param request Mapa zawierająca pole "email" z żądania JSON
     * @return ResponseEntity z komunikatem o powodzeniu lub błędzie:
     *         - 200 OK z potwierdzeniem wysłania linku
     *         - 400 Bad Request jeśli email jest pusty lub użytkownik nie istnieje
     */
    @PostMapping("/reset-request")
    public ResponseEntity<?> requestReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email jest wymagany.");
        }

        Optional<Employee> employeeOptional = employeeRepository.findByEmail(email);
        if (employeeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Nie znaleziono użytkownika.");
        }

        Employee employee = employeeOptional.get();
        String token = UUID.randomUUID().toString();

        employee.setResetToken(token);
        employee.setResetTokenExpiry(LocalDateTime.now().plusHours(24));

        employeeRepository.save(employee);

        emailService.sendPasswordResetEmail(email, token);
        return ResponseEntity.ok("Link do resetu hasła został wysłany.");
    }

    /**
     * Endpoint do ustawienia nowego hasła na podstawie tokenu.
     * Przyjmuje JSON w formacie: {"token": "xxx", "newPassword": "xxx"}
     *
     * @return komunikat o powodzeniu lub błędzie operacji
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        Optional<Employee> employeeOptional = employeeRepository.findAll().stream()
                .filter(emp -> token.equals(emp.getResetToken()))
                .findFirst();

        if (employeeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Nieprawidłowy token.");
        }

        Employee employee = employeeOptional.get();

        if (employee.getResetTokenExpiry() == null || employee.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token wygasł. Wygeneruj nowy link do resetu hasła.");
        }

        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body("Hasło musi mieć minimum 8 znaków.");
        }

        employee.setPassword(passwordHasher.hashPassword(newPassword));
        employee.setResetToken(null); // unieważnienie tokenu
        employee.setResetTokenExpiry(null);
        employeeRepository.save(employee);

        return ResponseEntity.ok("Hasło zostało zaktualizowane.");
    }
}
