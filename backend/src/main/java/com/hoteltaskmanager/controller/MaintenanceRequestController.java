package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.MaintenanceRequest;
import com.hoteltaskmanager.model.MaintenanceStatus;
import com.hoteltaskmanager.repository.MaintenanceRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST API dla zarządzania zgłoszeniami serwisowymi (maintenance requests).
 *
 * Dostępne endpointy:
 *
 * GET    /api/maintenance-requests                   - Pobierz wszystkie zgłoszenia
 * GET    /api/maintenance-requests/{id}              - Pobierz zgłoszenie po ID
 * POST   /api/maintenance-requests                   - Dodaj nowe zgłoszenie
 * PUT    /api/maintenance-requests/{id}              - Zaktualizuj istniejące zgłoszenie
 * DELETE /api/maintenance-requests/{id}              - Usuń zgłoszenie po ID
 * GET    /api/maintenance-requests/status/{status}   - Znajdź zgłoszenia wg statusu
 * GET    /api/maintenance-requests/room/{roomId}     - Znajdź zgłoszenia dla pokoju
 * GET    /api/maintenance-requests/assignee/{id}     - Znajdź zgłoszenia przypisane do pracownika
 */
@RestController
@RequestMapping("/api/maintenance-requests")
public class MaintenanceRequestController {

    private final MaintenanceRequestRepository requestRepository;

    public MaintenanceRequestController(MaintenanceRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    /**
     * GET /api/maintenance-requests
     * Pobierz wszystkie zgłoszenia serwisowe
     */
    @GetMapping
    public List<MaintenanceRequest> getAll() {
        return requestRepository.findAll();
    }

    /**
     * GET /api/maintenance-requests/{id}
     * Pobierz jedno zgłoszenie serwisowe po ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> getById(@PathVariable Long id) {
        return requestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/maintenance-requests
     * Dodaj nowe zgłoszenie serwisowe
     */
    @PostMapping
    public ResponseEntity<MaintenanceRequest> create(@RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(requestRepository.save(request));
    }

    /**
     * PUT /api/maintenance-requests/{id}
     * Zaktualizuj istniejące zgłoszenie
     */
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> update(@PathVariable Long id, @RequestBody MaintenanceRequest updated) {
        Optional<MaintenanceRequest> optional = requestRepository.findById(id);

        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MaintenanceRequest existing = optional.get();
        existing.setRoom(updated.getRoom());
        existing.setRequester(updated.getRequester());
        existing.setAssignee(updated.getAssignee());
        existing.setRequestDate(updated.getRequestDate());
        existing.setCompletionDate(updated.getCompletionDate());
        existing.setStatus(updated.getStatus());
        existing.setDescription(updated.getDescription());
        existing.setServiceSummary(updated.getServiceSummary());

        return ResponseEntity.ok(requestRepository.save(existing));
    }

    /**
     * DELETE /api/maintenance-requests/{id}
     * Usuń zgłoszenie po ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!requestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        requestRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/maintenance-requests/status/{status}
     * Pobierz zgłoszenia według statusu (np. PENDING, COMPLETED)
     */
    @GetMapping("/status/{status}")
    public List<MaintenanceRequest> getByStatus(@PathVariable MaintenanceStatus status) {
        return requestRepository.findByStatus(status);
    }

    /**
     * GET /api/maintenance-requests/room/{roomId}
     * Pobierz zgłoszenia przypisane do danego pokoju
     */
    @GetMapping("/room/{roomId}")
    public List<MaintenanceRequest> getByRoom(@PathVariable Long roomId) {
        return requestRepository.findByRoomId(roomId);
    }

    /**
     * GET /api/maintenance-requests/assignee/{id}
     * Pobierz zgłoszenia przypisane do danego pracownika (assignee)
     */
    @GetMapping("/assignee/{id}")
    public List<MaintenanceRequest> getByAssignee(@PathVariable Long id) {
        return requestRepository.findByAssigneeId(id);
    }
}
