package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.HousekeepingStatus;
import com.hoteltaskmanager.model.HousekeepingTask;
import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.HousekeepingTaskRepository;
import com.hoteltaskmanager.repository.RoomRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Komponent odpowiedzialny za inicjalizację danych zadań sprzątających.
 * Dodaje przykładowe zadania, jeśli tabela 'housekeeping_tasks' jest pusta.
 */
@Component
public class HousekeepingTaskSeeder {

    private final HousekeepingTaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final RoomRepository roomRepository;

    /**
     * Konstruktor z wstrzyknięciem repozytoriów wymaganych do zbudowania zadań.
     *
     * @param taskRepository      repozytorium zadań sprzątających
     * @param employeeRepository  repozytorium pracowników
     * @param roomRepository      repozytorium pokoi
     */
    public HousekeepingTaskSeeder(HousekeepingTaskRepository taskRepository,
                                  EmployeeRepository employeeRepository,
                                  RoomRepository roomRepository) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Dodaje przykładowe zadania sprzątające do bazy danych,
     * tylko jeśli tabela 'housekeeping_tasks' jest pusta.
     */
    public void seed() {
        if (taskRepository.count() == 0) {
            List<Room> rooms = roomRepository.findAll();
            Room room1 = rooms.get(0);
            Room room2 = rooms.get(1);

            Employee housekeeper = employeeRepository.findAll().stream()
                    .filter(e -> e.getRole().getName().name().equals("HOUSEKEEPER"))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Brak pracownika z rolą HOUSEKEEPER"));

            // ✅ Zadanie zakończone
            HousekeepingTask task1 = new HousekeepingTask();
            task1.setEmployee(housekeeper);
            task1.setRoom(room1);
            task1.setRequestDate(LocalDateTime.now().minusDays(1));
            task1.setCompletionDate(LocalDateTime.now());
            task1.setStatus(HousekeepingStatus.COMPLETED);
            task1.setDescription("Sprzatanie po gosciu VIP z apartamentu 101.");
            taskRepository.save(task1);

            // ⏳ Zadanie w trakcie
            HousekeepingTask task2 = new HousekeepingTask();
            task2.setEmployee(housekeeper);
            task2.setRoom(room2);
            task2.setRequestDate(LocalDateTime.now());
            task2.setStatus(HousekeepingStatus.IN_PROGRESS);
            task2.setDescription("Sprzatanie po dluzszym pobycie rodziny z dziecmi.");
            taskRepository.save(task2);

            System.out.println("🧽 Dodano 2 przykładowe zadania housekeeping.");
        }
    }
}
