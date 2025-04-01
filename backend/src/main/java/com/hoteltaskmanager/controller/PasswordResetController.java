package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.security.PasswordHasher;
import com.hoteltaskmanager.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Kontroler obsługujący proces resetowania hasła użytkownika.
 */
@RestController
@RequestMapping("/api/password")
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
     * Generuje token resetujący i wysyła go na e-mail powiązany z użytkownikiem.
     *
     * @param email adres e-mail użytkownika, który chce zresetować hasło
     * @return komunikat o powodzeniu lub błędzie operacji
     */
    @PostMapping("/password/reset-request")
    public ResponseEntity<?> requestReset(@RequestParam String email) {
        Optional<Employee> employeeOptional = employeeRepository.findByEmail(email);
        if (employeeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Nie znaleziono użytkownika.");
        }

        Employee employee = employeeOptional.get();
        String token = UUID.randomUUID().toString();
        employee.setResetToken(token);
        employeeRepository.save(employee);

        emailService.sendPasswordResetEmail(email, token);
        return ResponseEntity.ok("Link do resetu hasła został wysłany.");
    }

    /**
     * Endpoint do ustawienia nowego hasła na podstawie tokenu.
     *
     * @param token       token resetujący otrzymany na e-mail
     * @param newPassword nowe hasło użytkownika
     * @return komunikat o powodzeniu lub błędzie operacji
     */
    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        Optional<Employee> employeeOptional = employeeRepository.findAll().stream()
                .filter(emp -> token.equals(emp.getResetToken()))
                .findFirst();

        if (employeeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Nieprawidłowy token.");
        }

        Employee employee = employeeOptional.get();
        employee.setPassword(passwordHasher.hashPassword(newPassword));
        employee.setResetToken(null); // unieważnienie tokenu
        employeeRepository.save(employee);

        return ResponseEntity.ok("Hasło zostało zaktualizowane.");
    }
}
