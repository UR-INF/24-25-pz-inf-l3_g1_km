package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST API dla zarządzania pracownikami.
 * <p>
 * Dostępne endpointy:
 * <p>
 * GET    /api/employees                        - Pobierz wszystkich pracowników
 * GET    /api/employees/{id}                   - Pobierz pracownika po ID
 * POST   /api/employees                        - Dodaj nowego pracownika
 * PUT    /api/employees/{id}                   - Zaktualizuj dane pracownika
 * DELETE /api/employees/{id}                   - Usuń pracownika po ID
 * GET    /api/employees/search?email={email}   - Znajdź pracownika po e-mailu
 * GET    /api/employees/me                     - Pobierz dane aktualnie zalogowanego pracownika (wymaga tokena JWT)
 */

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * GET /api/employees
     * Pobierz listę wszystkich pracowników
     */
    @GetMapping
    public List<Employee> getAll() {
        return employeeRepository.findAll();
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
    public ResponseEntity<Employee> getCurrentUser(@RequestAttribute("user") String email) {
        return employeeRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
