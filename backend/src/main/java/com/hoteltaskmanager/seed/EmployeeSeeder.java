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
 * Dodaje przykładowych użytkowników z różnymi rolami, jeśli tabela 'employee' jest pusta.
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
     * Dodaje przykładowych pracowników dla różnych ról hotelowych,
     * tylko jeśli tabela employee jest pusta.
     */
    public void seed() {
        if (employeeRepository.count() == 0) {
            System.out.println("👥 Rozpoczynanie dodawania przykładowych pracowników...");

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            addEmployee("Jan", "Nowak", "admin@hotel.pl", "admin123", RoleName.MANAGER, "123456789", encoder);
            addEmployee("Dawid", "Wojcik", "dawid@hotel.pl", "tiger89", RoleName.MANAGER, "987654321", encoder);
            addEmployee("Anna", "Zielinska", "anna@hotel.pl", "haslo123", RoleName.HOUSEKEEPER, "111222333", encoder);
            addEmployee("Robert", "Kowalski", "robert@hotel.pl", "serwis12", RoleName.MAINTENANCE, "444555666", encoder);

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
                             RoleName roleName, String phoneNumber, BCryptPasswordEncoder encoder) {

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Rola " + roleName + " nie została znaleziona"));

        Employee employee = new Employee();
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(email);
        employee.setPassword(encoder.encode(rawPassword));
        employee.setPhoneNumber(phoneNumber);
        employee.setRole(role);

        employeeRepository.save(employee);
        System.out.println("👤 Dodano pracownika: " + email + " z rolą " + roleName);
    }
}
