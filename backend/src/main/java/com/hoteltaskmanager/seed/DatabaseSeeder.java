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
 * do konkretnych tabel (np. RoleSeeder, EmployeeSeeder, itd.).
 */
@Configuration
public class DatabaseSeeder implements CommandLineRunner {

    /**
     * Flaga aktywująca proces seeda.
     * Wartość pobierana z application.properties: app.db.seed=true
     */
    @Value("${app.db.seed:false}")
    private boolean seedEnabled;

    /**
     * Flaga aktywująca proces czyszczenia bazy danych przed seedem.
     * Wartość pobierana z application.properties: app.db.clear-before-seed=true
     */
    @Value("${app.db.clear-before-seed:false}")
    private boolean clearBeforeSeedEnabled;

    private final RoleSeeder roleSeeder;
    private final EmployeeSeeder employeeSeeder;
    private final RoomSeeder roomSeeder;
    private final HousekeepingTaskSeeder housekeepingTaskSeeder;
    private final MaintenanceRequestSeeder maintenanceRequestSeeder;
    private final ReservationSeeder reservationSeeder;
    private final DatabaseCleanerService databaseCleanerService;

    /**
     * Konstruktor wstrzykujący seederów dla konkretnych modeli oraz DatabaseCleanerService.
     *
     * @param roleSeeder                 komponent odpowiedzialny za dane w tabeli ról
     * @param employeeSeeder             komponent odpowiedzialny za dane w tabeli pracowników
     * @param roomSeeder                 komponent odpowiedzialny za dane w tabeli pokoi
     * @param housekeepingTaskSeeder     komponent odpowiedzialny za dane w tabeli zadań sprzątających
     * @param maintenanceRequestSeeder   komponent odpowiedzialny za dane w tabeli zgłoszeń usterek
     * @param reservationSeeder          komponent odpowiedzialny za dane w tabeli rezerwacji
     * @param databaseCleanerService     serwis czyszczący wszystkie dane z bazy
     */
    public DatabaseSeeder(
            RoleSeeder roleSeeder,
            EmployeeSeeder employeeSeeder,
            RoomSeeder roomSeeder,
            HousekeepingTaskSeeder housekeepingTaskSeeder,
            MaintenanceRequestSeeder maintenanceRequestSeeder,
            ReservationSeeder reservationSeeder,
            DatabaseCleanerService databaseCleanerService
    ) {
        this.roleSeeder = roleSeeder;
        this.employeeSeeder = employeeSeeder;
        this.roomSeeder = roomSeeder;
        this.housekeepingTaskSeeder = housekeepingTaskSeeder;
        this.maintenanceRequestSeeder = maintenanceRequestSeeder;
        this.reservationSeeder = reservationSeeder;
        this.databaseCleanerService = databaseCleanerService;
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
            System.out.println("⚠️ Seeding wyłączony (app.db.seed=false)");
            return;
        }

        System.out.println("📦 Rozpoczynanie inicjalizacji danych...");

        // Najpierw czyścimy bazę danych

        if (clearBeforeSeedEnabled) {
            databaseCleanerService.clearDatabase();
        } else {
            System.out.println("🧹 Czyszczenie danych wyłączone.");
        }

        // A potem uruchamiamy seedery w odpowiedniej kolejności
        roleSeeder.seed();
        employeeSeeder.seed();
        roomSeeder.seed();
        housekeepingTaskSeeder.seed();
        maintenanceRequestSeeder.seed();
        reservationSeeder.seed();

        System.out.println("✅ Inicjalizacja danych zakończona.");
    }
}
