package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Znajdź pracownika po adresie e-mail.
     */
    Optional<Employee> findByEmail(String email);

    /**
     * Sprawdź, czy istnieje pracownik z danym e-mailem.
     */
    boolean existsByEmail(String email);

    /**
     * Znajdź wszystkich pracowników z daną rolą.
     */
    List<Employee> findAllByRole(Role role);
}
