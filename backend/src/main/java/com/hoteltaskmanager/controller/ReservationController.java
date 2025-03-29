package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.model.ReservationRoom;
import com.hoteltaskmanager.model.ReservationStatus;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.ReservationRoomRepository;
import com.hoteltaskmanager.service.RoomStatusManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST API dla zarządzania rezerwacjami (Reservation).
 *
 * Dostępne endpointy:
 *
 * GET    /api/reservations                          - Pobierz wszystkie rezerwacje
 * GET    /api/reservations/{id}                     - Pobierz rezerwację po ID
 * POST   /api/reservations                          - Dodaj nową rezerwację
 * PUT    /api/reservations/{id}                     - Zaktualizuj istniejącą rezerwację
 * DELETE /api/reservations/{id}                     - Usuń rezerwację po ID
 * GET    /api/reservations/status/{status}          - Znajdź rezerwacje wg statusu
 * GET    /api/reservations/after/{date}             - Znajdź rezerwacje po dacie rozpoczęcia
 * GET    /api/reservations/{id}/rooms               - Pobierz pokoje przypisane do rezerwacji
 */
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final ReservationRoomRepository reservationRoomRepository;

    public ReservationController(ReservationRepository reservationRepository,
                                 ReservationRoomRepository reservationRoomRepository) {
        this.reservationRepository = reservationRepository;
        this.reservationRoomRepository = reservationRoomRepository;
    }

    /**
     * Serwis odpowiedzialny za aktualizację statusów pokoi na podstawie rezerwacji i zgłoszeń serwisowych.
     */
    @Autowired
    private RoomStatusManagerService roomStatusManagerService;

    /**
     * GET /api/reservations
     * Pobierz listę wszystkich rezerwacji
     */
    @GetMapping
    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    /**
     * GET /api/reservations/{id}
     * Pobierz jedną rezerwację po ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getById(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/reservations
     * Dodaj nową rezerwację
     */
    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Reservation reservation) {
        Reservation saved = reservationRepository.save(reservation);
        roomStatusManagerService.refreshRoomStatuses(); // Odśwież statusy pokoi po dodaniu rezerwacji
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/reservations/{id}
     * Zaktualizuj dane istniejącej rezerwacji
     */
    @PutMapping("/{id}")
    public ResponseEntity<Reservation> update(@PathVariable Long id, @RequestBody Reservation updated) {
        Optional<Reservation> optional = reservationRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Reservation existing = optional.get();
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setStatus(updated.getStatus());
        existing.setSpecialRequests(updated.getSpecialRequests());
        existing.setModifiedAt(updated.getModifiedAt());
        existing.setCatering(updated.isCatering());
        existing.setGuestFirstName(updated.getGuestFirstName());
        existing.setGuestLastName(updated.getGuestLastName());
        existing.setGuestPesel(updated.getGuestPesel());
        existing.setGuestPhone(updated.getGuestPhone());

        Reservation saved = reservationRepository.save(existing);
        roomStatusManagerService.refreshRoomStatuses(); // Odśwież statusy pokoi po edycji rezerwacji
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/reservations/{id}
     * Usuń rezerwację po ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!reservationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reservationRepository.deleteById(id);
        roomStatusManagerService.refreshRoomStatuses(); // Odśwież statusy pokoi po usunięciu rezerwacji
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/reservations/status/{status}
     * Pobierz rezerwacje wg statusu (ACTIVE, COMPLETED, CANCELLED)
     */
    @GetMapping("/status/{status}")
    public List<Reservation> getByStatus(@PathVariable ReservationStatus status) {
        return reservationRepository.findByStatus(status);
    }

    /**
     * GET /api/reservations/after/{date}
     * Pobierz rezerwacje rozpoczynające się po określonej dacie
     * Format daty: YYYY-MM-DD
     */
    @GetMapping("/after/{date}")
    public List<Reservation> getByStartDateAfter(@PathVariable String date) {
        return reservationRepository.findByStartDateAfter(LocalDate.parse(date));
    }

    /**
     * GET /api/reservations/{id}/rooms
     * Pobierz przypisane pokoje dla rezerwacji
     */
    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<ReservationRoom>> getAssignedRooms(@PathVariable Long id) {
        if (!reservationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<ReservationRoom> rooms = reservationRoomRepository.findByReservationId(id);
        return ResponseEntity.ok(rooms);
    }
}
