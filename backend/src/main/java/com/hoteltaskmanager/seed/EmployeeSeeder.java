package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.RoleRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Komponent odpowiedzialny za inicjalizację danych pracowników.
 * Dodaje przykładowego użytkownika administratora, jeśli tabela pracowników jest pusta.
 */
@Component
public class EmployeeSeeder {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    /**
     * Konstruktor z wstrzyknięciem zależności do repozytoriów.
     *
     * @param employeeRepository repozytorium pracowników
     * @param roleRepository     repozytorium ról
     */
    public EmployeeSeeder(EmployeeRepository employeeRepository, RoleRepository roleRepository) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Dodaje jednego użytkownika typu MANAGER do bazy danych,
     * tylko jeśli tabela employee jest pusta.
     */
    public void seed() {
        if (employeeRepository.count() == 0) {
            Role managerRole = roleRepository.findByName(RoleName.MANAGER)
                    .orElseThrow(() -> new IllegalStateException("Rola MANAGER nie została znaleziona"));

            Employee e = new Employee();
            e.setFirstName("Jan");
            e.setLastName("Nowak");
            e.setEmail("admin@hotel.pl");
            e.setPassword(new BCryptPasswordEncoder().encode("admin123"));
            e.setRole(managerRole);
            e.setPhoneNumber("123456789");

            employeeRepository.save(e);
            System.out.println("Dodano pracownika: " + e.getEmail());
        }
    }
}
