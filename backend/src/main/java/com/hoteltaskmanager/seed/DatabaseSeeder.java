package com.hoteltaskmanager.seed;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

/**
 * Klasa odpowiedzialna za inicjalizację bazy danych przykładowymi danymi
 * przy starcie aplikacji. Inicjalizacja uruchamiana jest tylko wtedy,
 * gdy właściwość `app.db.seed` jest ustawiona na `true`.
 *
 * Seeder wywołuje osobne komponenty odpowiedzialne za wstawianie danych
 * do konkretnych tabel (np. RoleSeeder, EmployeeSeeder).
 */
@Configuration
public class DatabaseSeeder implements CommandLineRunner {

    /**
     * Flaga aktywująca proces seeda.
     * Wartość pobierana z application.properties: app.db.seed=true
     */
    @Value("${app.db.seed:false}")
    private boolean seedEnabled;

    private final RoleSeeder roleSeeder;
    private final EmployeeSeeder employeeSeeder;

    /**
     * Konstruktor wstrzykujący seederów dla konkretnych modeli.
     *
     * @param roleSeeder      komponent odpowiedzialny za dane w tabeli ról
     * @param employeeSeeder  komponent odpowiedzialny za dane w tabeli pracowników
     */
    public DatabaseSeeder(
            RoleSeeder roleSeeder,
            EmployeeSeeder employeeSeeder
    ) {
        this.roleSeeder = roleSeeder;
        this.employeeSeeder = employeeSeeder;
    }

    /**
     * Metoda uruchamiana automatycznie przez Spring Boot po starcie aplikacji.
     * Sprawdza flagę aktywującą seed i uruchamia poszczególne seeder'y.
     *
     * @param args argumenty przekazane przy uruchamianiu aplikacji (nieużywane tutaj)
     */
    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            System.out.println("Seeding wyłączony (app.db.seed=false)");
            return;
        }

        System.out.println("Rozpoczynanie inicjalizacji danych...");
        roleSeeder.seed();
        employeeSeeder.seed();
        System.out.println("Inicjalizacja danych zakończona.");
    }
}
