package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.RoleRepository;
import com.hoteltaskmanager.security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * REST API dla zarządzania pracownikami.
 * <p>
 * Dostępne endpointy:
 * <p>
 * GET    /api/employees                        - Pobierz wszystkich pracowników (z opcją filtrowania po roli)
 * GET    /api/employees/{id}                   - Pobierz pracownika po ID
 * POST   /api/employees                        - Dodaj nowego pracownika
 * PUT    /api/employees/{id}                   - Zaktualizuj dane pracownika
 * DELETE /api/employees/{id}                   - Usuń pracownika po ID
 * GET    /api/employees/search?email={email}   - Znajdź pracownika po e-mailu
 * GET    /api/employees/me                     - Pobierz dane aktualnie zalogowanego pracownika
 * POST   /api/employee/{id}/avatar             - Dodaj awatar pracownika
 * DELETE /api/employee/{id}/avatar             - Usuń pracownika pracownika
 * PUT    /api/employees/me/notifications       - Aktualizuje preferencje powiadomień zalogowanego użytkownika.
 */

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoleRepository roleRepository;

    /**
     * GET /api/employees
     * Pobiera listę wszystkich pracowników. Jeśli zostanie podany parametr `roleName`,
     * zwraca tylko pracowników przypisanych do tej roli.
     *
     * @param roleName (opcjonalny) Nazwa roli według enuma {@link RoleName}, np. MANAGER, HOUSEKEEPER
     * @return Lista pracowników odpowiadających zapytaniu; 404 jeśli rola nie istnieje
     */
    @GetMapping
    public ResponseEntity<List<Employee>> getAll(@RequestParam(required = false) RoleName roleName) {
        if (roleName == null) {
            return ResponseEntity.ok(employeeRepository.findAll());
        }

        Optional<Role> roleOptional = roleRepository.findByName(roleName);
        if (roleOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Employee> filteredEmployees = employeeRepository.findAllByRole(roleOptional.get());
        return ResponseEntity.ok(filteredEmployees);
    }

    /**
     * GET /api/employees/{id}
     * Pobierz jednego pracownika po ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/employees
     * Dodaj nowego pracownika
     */
    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody Employee employee) {
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(employeeRepository.save(employee));
    }

    /**
     * PUT /api/employees/{id}
     * Zaktualizuj dane istniejącego pracownika
     */
    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee updatedEmployee) {
        Optional<Employee> optionalEmployee = employeeRepository.findById(id);

        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Employee existing = optionalEmployee.get();
        existing.setFirstName(updatedEmployee.getFirstName());
        existing.setLastName(updatedEmployee.getLastName());
        existing.setEmail(updatedEmployee.getEmail());
        existing.setPassword(updatedEmployee.getPassword());
        existing.setPhoneNumber(updatedEmployee.getPhoneNumber());
        existing.setRole(updatedEmployee.getRole());

        return ResponseEntity.ok(employeeRepository.save(existing));
    }

    /**
     * DELETE /api/employees/{id}
     * Usuń pracownika po ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        employeeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/employees/search?email={email}
     * Znajdź pracownika po adresie e-mail
     */
    @GetMapping("/search")
    public ResponseEntity<Employee> findByEmail(@RequestParam String email) {
        return employeeRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/employee/me
     * Pobierz dane zalogowanego użytkownika na podstawie tokena JWT
     */
    @GetMapping("/me")
    public ResponseEntity<Employee> getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return employeeRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/employee/{id}/password
     * Zmodyfikuj hasło pracownika
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Hasło musi zawierać co najmniej 6 znaków.");
        }

        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Użytkownik nie istnieje.");
        }

        PasswordHasher hasher = new PasswordHasher();

        Employee employee = optionalEmployee.get();
        employee.setPassword(hasher.hashPassword(newPassword)); // tutaj można dodać szyfrowanie, np. encoder.encode()
        employeeRepository.save(employee);

        return ResponseEntity.ok("Hasło zostało pomyślnie zmienione.");
    }

    /**
     * PUT /api/employee/{id}/email
     * Zmodyfikuj e-mail pracownika
     */
    @PutMapping("/{id}/email")
    public ResponseEntity<?> changeEmail(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newEmail = body.get("email");

        if (newEmail == null || !newEmail.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return ResponseEntity.badRequest().body("Podaj poprawny adres e-mail.");
        }

        Optional<Employee> existingByEmail = employeeRepository.findByEmail(newEmail);
        if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
            return ResponseEntity.badRequest().body("Ten adres e-mail jest już zajęty.");
        }

        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Użytkownik nie istnieje.");
        }

        Employee employee = optionalEmployee.get();
        employee.setEmail(newEmail);
        employeeRepository.save(employee);

        return ResponseEntity.ok("Adres e-mail został zaktualizowany.");
    }

    /**
     * POST /api/employee/{id}/avatar
     * Dodaj awatar pracownika
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        Optional<Employee> optional = employeeRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Użytkownik nie istnieje.");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Plik jest pusty.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }

            String uniqueFilename = UUID.randomUUID() + extension;

            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "avatars");

            Files.createDirectories(uploadDir);

            Employee employee = optional.get();
            String oldAvatarFilename = employee.getAvatarFilename();

            if (oldAvatarFilename != null && !oldAvatarFilename.contains("example")) {
                Path oldFile = uploadDir.resolve(oldAvatarFilename);
                Files.deleteIfExists(oldFile);
            }

            Path targetPath = uploadDir.resolve(uniqueFilename);
            file.transferTo(targetPath.toFile());

            employee.setAvatarFilename(uniqueFilename);
            employeeRepository.save(employee);

            return ResponseEntity.ok("Zdjęcie profilowe zostało zapisane.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Błąd zapisu pliku.");
        }
    }

    /**
     * DELETE /api/employee/{id}/avatar
     * Usuń awatar pracownika
     */
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable Long id) {
        Optional<Employee> optional = employeeRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Użytkownik nie istnieje.");
        }

        Employee employee = optional.get();
        String oldAvatarFilename = employee.getAvatarFilename();

        if (oldAvatarFilename != null) {
            if (!oldAvatarFilename.contains("example")) {
                Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "avatars");
                Path avatarPath = uploadDir.resolve(oldAvatarFilename);

                try {
                    Files.deleteIfExists(avatarPath);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            employee.setAvatarFilename(null);
            employeeRepository.save(employee);
        }

        return ResponseEntity.ok("Zdjęcie profilowe zostało usunięte.");
    }

    /**
     * PUT /api/employees/me/notifications
     * Aktualizuje preferencje powiadomień zalogowanego użytkownika.
     *
     * @param body Mapa zawierająca klucz "notificationsEnabled" z wartością boolean.
     * @return Odpowiedź z aktualizowanym obiektem Employee lub odpowiedni kod błędu.
     */
    @PutMapping("/me/notifications")
    public ResponseEntity<?> updateNotificationPreference(@RequestBody Map<String, Boolean> body) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Optional<Employee> optionalEmployee = employeeRepository.findByEmail(email);
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Użytkownik nie istnieje.");
        }

        Employee employee = optionalEmployee.get();
        Boolean notificationsEnabled = body.get("notificationsEnabled");
        if (notificationsEnabled == null) {
            return ResponseEntity.badRequest().body("Brak wartości dla 'notificationsEnabled'.");
        }

        employee.setNotificationsEnabled(notificationsEnabled);
        employeeRepository.save(employee);

        return ResponseEntity.ok(employee);
    }
}
