package com.hoteltaskmanager.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serwis odpowiedzialny za automatyczne przydzielanie codziennych zadań sprzątania.
 * Uruchamia się codziennie rano i przydziela zadania pokojówkom rotacyjnie,
 * pomijając pokoje, które już mają przypisane zadanie na dzisiejszy dzień.
 */
@Service
@RequiredArgsConstructor
public class HousekeepingAssignmentService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Zaplanowane zadanie uruchamiane codziennie o ustalonej godzinie.
     * Przypisuje pokojówkom zadania sprzątania dla pokoi z aktywnymi rezerwacjami.
     */
    @Scheduled(cron = "0 0 8 * * *") // Codziennie o 8:00
    @Transactional
    public void assignDailyCleaningTasks() {
        System.out.println("[INFO] Rozpoczynam przydzielanie zadań sprzątania...");

        // 1. Pobierz ID pokoi do posprzątania
        String roomsQuery = """
                    SELECT rr.room_id
                    FROM reservation_rooms rr
                    JOIN reservations r ON rr.reservation_id = r.id
                    WHERE r.status = 'ACTIVE'
                      AND CURDATE() BETWEEN r.start_date AND r.end_date
                      AND NOT EXISTS (
                          SELECT 1
                          FROM housekeeping_tasks ht
                          WHERE ht.room_id = rr.room_id
                            AND DATE(ht.request_date) = CURDATE()
                            AND ht.status != 'PENDING'
                            AND ht.description != 'Codzienne sprzątanie'
                      );
                """;

        List<Long> roomIds = jdbcTemplate.query(roomsQuery, (rs, rowNum) -> rs.getLong("room_id"));
        System.out.println("[DEBUG] Pokoje do sprzątania: " + roomIds);

        if (roomIds.isEmpty()) {
            System.out.println("[INFO] Brak pokoi do przydzielenia zadań.");
            return;
        }

        // 2. Pobierz ID pracowników z rolą HOUSEKEEPER
        String employeesQuery = """
                    SELECT e.id
                    FROM employee e
                    JOIN roles r ON e.role_id = r.id
                    WHERE r.name = 'HOUSEKEEPER';
                """;

        List<Long> housekeeperIds = jdbcTemplate.query(employeesQuery, (rs, rowNum) -> rs.getLong("id"));
        System.out.println("[DEBUG] Dostępni pracownicy (HOUSEKEEPER): " + housekeeperIds);

        if (housekeeperIds.isEmpty()) {
            System.out.println("[INFO] Brak dostępnych pokojówek.");
            return;
        }

        for (Long roomId : roomIds) {
            String insertQuery = """
                        INSERT INTO housekeeping_tasks (employee_id, room_id, request_date, status, description)
                        VALUES (null, ?, NOW(), 'PENDING', 'Codzienne sprzątanie');
                    """;

            jdbcTemplate.update(insertQuery, roomId);
            System.out.println("[INSERT] Dodano zadanie sprzątania dla pokoju ID: " + roomId);
        }

        System.out.println("[INFO] Zakończono przydzielanie zadań.");
    }

}
