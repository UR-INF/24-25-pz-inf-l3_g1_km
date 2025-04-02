package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.RoleRepository;
import com.hoteltaskmanager.security.PasswordHasher;
import org.springframework.stereotype.Component;

/**
 * Komponent odpowiedzialny za inicjalizację danych pracowników.
 * Dodaje przykładowych użytkowników z różnymi rolami, jeśli tabela 'employee' jest pusta.
 */
@Component
public class EmployeeSeeder {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordHasher passwordHasher;

    /**
     * Konstruktor z wstrzyknięciem zależności do repozytoriów.
     *
     * @param employeeRepository repozytorium pracowników
     * @param roleRepository     repozytorium ról
     */
    public EmployeeSeeder(EmployeeRepository employeeRepository, RoleRepository roleRepository, PasswordHasher passwordHasher) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.passwordHasher = passwordHasher;
    }

    /**
     * Dodaje przykładowych pracowników dla różnych ról hotelowych,
     * tylko jeśli tabela employee jest pusta.
     */
    public void seed() {
        if (employeeRepository.count() == 0) {
            System.out.println("👥 Rozpoczynanie dodawania przykładowych pracowników...");

            String defaultPassword = "admin123";

            addEmployee("Krzysztof", "Motas", "motas.krzysztof@gmail.com", defaultPassword, RoleName.MANAGER, "123456789");
            addEmployee("Dawid", "Wojcik", "dawid@hotel.pl", defaultPassword, RoleName.RECEPTIONIST, "987654321");
            addEmployee("Anna", "Zielinska", "anna@hotel.pl", defaultPassword, RoleName.HOUSEKEEPER, "111222333");
            addEmployee("Robert", "Kowalski", "robert@hotel.pl", defaultPassword, RoleName.MAINTENANCE, "444555666");

            System.out.println("✅ Dodano wszystkich przykładowych pracowników.");
        }
    }

    /**
     * Pomocnicza metoda do tworzenia i zapisu pracownika.
     *
     * @param firstName     imię pracownika
     * @param lastName      nazwisko pracownika
     * @param email         adres e-mail (unikalny)
     * @param rawPassword   hasło w formie jawnej (zostanie zaszyfrowane)
     * @param roleName      rola przypisana do pracownika
     * @param phoneNumber   numer telefonu
     * @param encoder       obiekt do haszowania haseł
     */
    private void addEmployee(String firstName, String lastName, String email, String rawPassword,
                             RoleName roleName, String phoneNumber) {

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Rola " + roleName + " nie została znaleziona"));

        Employee employee = new Employee();
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(email);
        employee.setPassword(passwordHasher.hashPassword(rawPassword));
        employee.setPhoneNumber(phoneNumber);
        employee.setRole(role);

        employeeRepository.save(employee);
        System.out.println("👤 Dodano pracownika: " + email + " z rolą " + roleName);
    }
}
