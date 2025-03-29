package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Znajdź pracownika po adresie e-mail.
     */
    Optional<Employee> findByEmail(String email);

    /**
     * Sprawdź, czy istnieje pracownik z danym e-mailem.
     */
    boolean existsByEmail(String email);
}
