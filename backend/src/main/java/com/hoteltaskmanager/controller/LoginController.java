package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.security.PasswordHasher;
import com.hoteltaskmanager.config.JwtConfig;
import com.hoteltaskmanager.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Kontroler obsługujący logowanie użytkowników.
 */
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordHasher passwordHasher;

    @Autowired
    private JwtConfig jwtConfig;

    /**
     * Obsługuje logowanie użytkownika i generuje token JWT.
     * @param loginData Dane logowania (email, hasło).
     * @return Mapa z wynikiem operacji i tokenem JWT.
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        Map<String, Object> response = new HashMap<>();
        Optional<Employee> employeeOptional = employeeRepository.findByEmail(email);

        if (employeeOptional.isPresent()) {
            Employee employee = employeeOptional.get();
            if (passwordHasher.matchPassword(password, employee.getPassword())) {
                
                String token = jwtConfig.generateToken(employee.getEmail());
                response.put("success", true);
                response.put("token", token);
                System.out.println("Zalogowano pomyślnie!");
            } else {
                response.put("success", false);
                response.put("message", "Nieprawidłowe dane logowania.");
                System.out.println("Błąd logowania! Nieprawidłowe dane logowania dla użytkownika: " + email);
            }
        } else {
            response.put("success", false);
            response.put("message", "Nie znaleziono użytkownika.");
            System.out.println("Błąd logowania! Użytkownik o emailu: " + email + " nie został znaleziony.");
        }

        return response;
    }
}
