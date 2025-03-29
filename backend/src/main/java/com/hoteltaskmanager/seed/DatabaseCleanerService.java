package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serwis czyszczący wszystkie dane z bazy danych
 * oraz resetujący AUTO_INCREMENT dla tabel z ID.
 */
@Service
public class DatabaseCleanerService {

    private final ReservationRoomRepository reservationRoomRepository;
    private final ReservationRepository reservationRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final EmployeeRepository employeeRepository;
    private final RoomRepository roomRepository;
    private final RoleRepository roleRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DatabaseCleanerService(ReservationRoomRepository reservationRoomRepository,
                                  ReservationRepository reservationRepository,
                                  MaintenanceRequestRepository maintenanceRequestRepository,
                                  HousekeepingTaskRepository housekeepingTaskRepository,
                                  EmployeeRepository employeeRepository,
                                  RoomRepository roomRepository,
                                  RoleRepository roleRepository) {
        this.reservationRoomRepository = reservationRoomRepository;
        this.reservationRepository = reservationRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.employeeRepository = employeeRepository;
        this.roomRepository = roomRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Czyści wszystkie dane z bazy danych w odpowiedniej kolejności,
     * z zachowaniem relacji między encjami. Resetuje również AUTO_INCREMENT.
     */
    @Transactional
    public void clearDatabase() {
        System.out.println("🧹 Czyszczenie danych...");

        reservationRoomRepository.deleteAll();
        resetAutoIncrement("reservation_rooms");
        System.out.println("🗑️ Usunięto dane z reservation_rooms");

        reservationRepository.deleteAll();
        resetAutoIncrement("reservations");
        System.out.println("🗑️ Usunięto dane z reservations");

        maintenanceRequestRepository.deleteAll();
        resetAutoIncrement("maintenance_requests");
        System.out.println("🗑️ Usunięto dane z maintenance_requests");

        housekeepingTaskRepository.deleteAll();
        resetAutoIncrement("housekeeping_tasks");
        System.out.println("🗑️ Usunięto dane z housekeeping_tasks");

        employeeRepository.deleteAll();
        resetAutoIncrement("employee");
        System.out.println("🗑️ Usunięto dane z employees");

        roleRepository.deleteAll();
        resetAutoIncrement("roles");
        System.out.println("🗑️ Usunięto dane z roles");

        roomRepository.deleteAll();
        resetAutoIncrement("rooms");
        System.out.println("🗑️ Usunięto dane z rooms");

        System.out.println("✅ Czyszczenie bazy zakończone.");
    }

    /**
     * Resetuje licznik AUTO_INCREMENT dla podanej tabeli do 1.
     *
     * @param tableName nazwa tabeli w bazie danych
     */
    private void resetAutoIncrement(String tableName) {
        entityManager.createNativeQuery("ALTER TABLE " + tableName + " AUTO_INCREMENT = 1").executeUpdate();
    }
}
