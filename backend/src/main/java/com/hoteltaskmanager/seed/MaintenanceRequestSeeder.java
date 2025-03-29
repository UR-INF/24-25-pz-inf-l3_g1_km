package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.*;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.MaintenanceRequestRepository;
import com.hoteltaskmanager.repository.RoomRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Komponent odpowiedzialny za inicjalizację danych zgłoszeń usterek.
 * Dodaje przykładowe zgłoszenia, jeśli tabela 'maintenance_requests' jest pusta.
 */
@Component
public class MaintenanceRequestSeeder {

    private final MaintenanceRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final RoomRepository roomRepository;

    /**
     * Konstruktor z wstrzyknięciem repozytoriów wymaganych do zgłoszenia usterek.
     */
    public MaintenanceRequestSeeder(MaintenanceRequestRepository requestRepository,
                                    EmployeeRepository employeeRepository,
                                    RoomRepository roomRepository) {
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Dodaje przykładowe zgłoszenia usterek do bazy danych,
     * tylko jeśli tabela 'maintenance_requests' jest pusta.
     */
    public void seed() {
        if (requestRepository.count() == 0) {
            List<Room> rooms = roomRepository.findAll();
            List<Employee> employees = employeeRepository.findAll();

            Room room1 = rooms.get(0);
            Room room2 = rooms.get(1);
            Room room3 = rooms.get(2);

            Employee requester = employees.get(0);
            Employee assignee = employees.stream()
                    .filter(e -> e.getRole().getName().name().equals("MAINTENANCE"))
                    .findFirst()
                    .orElse(requester);

            // ✅ Zgłoszenie 1 - zakończona naprawa
            MaintenanceRequest req1 = new MaintenanceRequest();
            req1.setRoom(room1);
            req1.setRequester(requester);
            req1.setAssignee(assignee);
            req1.setRequestDate(LocalDateTime.now().minusDays(3));
            req1.setDescription("W lazience przecieka kran.");
            req1.setStatus(MaintenanceStatus.COMPLETED);
            req1.setCompletionDate(LocalDateTime.now().minusDays(1));
            req1.setServiceSummary("Wymieniono uszczelke w kranie.");
            requestRepository.save(req1);

            // ✅ Zgłoszenie 2 - zakończona naprawa
            MaintenanceRequest req2 = new MaintenanceRequest();
            req2.setRoom(room2);
            req2.setRequester(requester);
            req2.setAssignee(assignee);
            req2.setRequestDate(LocalDateTime.now().minusDays(4));
            req2.setDescription("Nie dziala swiatlo w lazience.");
            req2.setStatus(MaintenanceStatus.COMPLETED);
            req2.setCompletionDate(LocalDateTime.now().minusDays(2));
            req2.setServiceSummary("Wymieniono zarowke i przelacznik.");
            requestRepository.save(req2);

            // ⏳ Zgłoszenie 3 - w trakcie (pokój powinien być niedostępny)
            MaintenanceRequest req3 = new MaintenanceRequest();
            req3.setRoom(room3);
            req3.setRequester(requester);
            req3.setAssignee(assignee);
            req3.setRequestDate(LocalDateTime.now().minusDays(1));
            req3.setDescription("Klimatyzacja nie chlodzi.");
            req3.setStatus(MaintenanceStatus.PENDING);
            req3.setServiceSummary(null);
            req3.setCompletionDate(null);
            requestRepository.save(req3);

            // 🔄 Ustawiamy pokój jako wyłączony z użytku
            room3.setStatus(RoomStatus.OUT_OF_SERVICE);
            roomRepository.save(room3);

            System.out.println("🔧 Dodano 3 przykładowe zgłoszenia serwisowe.");
        }
    }
}
