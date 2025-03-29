package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.HousekeepingStatus;
import com.hoteltaskmanager.model.HousekeepingTask;
import com.hoteltaskmanager.repository.HousekeepingTaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST API dla zarządzania zadaniami sprzątającymi (housekeeping).
 *
 * Dostępne endpointy:
 *
 * GET    /api/housekeeping-tasks                - Pobierz wszystkie zadania
 * GET    /api/housekeeping-tasks/{id}           - Pobierz zadanie po ID
 * POST   /api/housekeeping-tasks                - Dodaj nowe zadanie
 * PUT    /api/housekeeping-tasks/{id}           - Zaktualizuj istniejące zadanie
 * DELETE /api/housekeeping-tasks/{id}           - Usuń zadanie po ID
 * GET    /api/housekeeping-tasks/status/{status}      - Zadania wg statusu (np. COMPLETED)
 * GET    /api/housekeeping-tasks/employee/{employeeId} - Zadania przypisane do konkretnego pracownika
 */
@RestController
@RequestMapping("/api/housekeeping-tasks")
public class HousekeepingTaskController {

    private final HousekeepingTaskRepository taskRepository;

    public HousekeepingTaskController(HousekeepingTaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * GET /api/housekeeping-tasks
     * Pobierz wszystkie zadania sprzątające
     */
    @GetMapping
    public List<HousekeepingTask> getAll() {
        return taskRepository.findAll();
    }

    /**
     * GET /api/housekeeping-tasks/{id}
     * Pobierz zadanie po ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HousekeepingTask> getById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/housekeeping-tasks
     * Dodaj nowe zadanie sprzątające
     */
    @PostMapping
    public ResponseEntity<HousekeepingTask> create(@RequestBody HousekeepingTask task) {
        return ResponseEntity.ok(taskRepository.save(task));
    }

    /**
     * PUT /api/housekeeping-tasks/{id}
     * Zaktualizuj istniejące zadanie
     */
    @PutMapping("/{id}")
    public ResponseEntity<HousekeepingTask> update(@PathVariable Long id, @RequestBody HousekeepingTask updatedTask) {
        Optional<HousekeepingTask> optional = taskRepository.findById(id);

        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HousekeepingTask existing = optional.get();
        existing.setEmployee(updatedTask.getEmployee());
        existing.setRoom(updatedTask.getRoom());
        existing.setRequestDate(updatedTask.getRequestDate());
        existing.setCompletionDate(updatedTask.getCompletionDate());
        existing.setStatus(updatedTask.getStatus());
        existing.setDescription(updatedTask.getDescription());

        return ResponseEntity.ok(taskRepository.save(existing));
    }

    /**
     * DELETE /api/housekeeping-tasks/{id}
     * Usuń zadanie sprzątające po ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/housekeeping-tasks/status/{status}
     * Pobierz zadania o określonym statusie (np. COMPLETED)
     */
    @GetMapping("/status/{status}")
    public List<HousekeepingTask> getByStatus(@PathVariable HousekeepingStatus status) {
        return taskRepository.findByStatus(status);
    }

    /**
     * GET /api/housekeeping-tasks/employee/{employeeId}
     * Pobierz zadania przypisane do pracownika o podanym ID
     */
    @GetMapping("/employee/{employeeId}")
    public List<HousekeepingTask> getByEmployee(@PathVariable Long employeeId) {
        return taskRepository.findByEmployeeId(employeeId);
    }
}
