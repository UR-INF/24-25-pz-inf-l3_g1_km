package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.model.ReservationRoom;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.ReservationRoomRepository;
import com.hoteltaskmanager.service.RoomStatusManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST API do zarządzania pokojami przypisanymi do danej rezerwacji.
 *
 * Endpointy:
 * GET    /api/reservations/{reservationId}/rooms           - Pobierz pokoje przypisane do danej rezerwacji
 * POST   /api/reservations/{reservationId}/rooms           - Dodaj pokój do rezerwacji
 * PUT    /api/reservations/{reservationId}/rooms/{id}      - Zaktualizuj przypisanie pokoju do rezerwacji
 * DELETE /api/reservations/{reservationId}/rooms/{id}      - Usuń przypisanie pokoju do rezerwacji
 */
@RestController
@RequestMapping("/api/reservations/{reservationId}/rooms")
public class ReservationRoomController {

    private final ReservationRoomRepository reservationRoomRepository;
    private final ReservationRepository reservationRepository;
    private final RoomStatusManagerService roomStatusManagerService;

    public ReservationRoomController(ReservationRoomRepository reservationRoomRepository,
                                     ReservationRepository reservationRepository,
                                     RoomStatusManagerService roomStatusManagerService) {
        this.reservationRoomRepository = reservationRoomRepository;
        this.reservationRepository = reservationRepository;
        this.roomStatusManagerService = roomStatusManagerService;
    }

    /**
     * GET /api/reservations/{reservationId}/rooms
     * Pobierz pokoje przypisane do danej rezerwacji
     */
    @GetMapping
    public ResponseEntity<List<ReservationRoom>> getRooms(@PathVariable Long reservationId) {
        if (!reservationRepository.existsById(reservationId)) {
            return ResponseEntity.notFound().build();
        }
        List<ReservationRoom> rooms = reservationRoomRepository.findByReservationId(reservationId);
        return ResponseEntity.ok(rooms);
    }

    /**
     * POST /api/reservations/{reservationId}/rooms
     * Dodaj pokój do rezerwacji
     */
    @PostMapping
public ResponseEntity<ReservationRoom> addRoom(@PathVariable Long reservationId,
                                               @RequestBody ReservationRoom requestReservationRoom) {
    Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);
    if (reservationOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    if (requestReservationRoom.getRoom() == null || requestReservationRoom.getRoom().getId() == null) {
        return ResponseEntity.badRequest().build();
    }

    if (requestReservationRoom.getGuestCount() <= 0) {
        return ResponseEntity.badRequest().build();
    }

    Reservation reservation = reservationOpt.get();
    requestReservationRoom.setReservation(reservation);
    ReservationRoom savedReservationRoom = reservationRoomRepository.save(requestReservationRoom);
    roomStatusManagerService.refreshRoomStatuses();

    return ResponseEntity.ok(savedReservationRoom);
}

    /**
     * PUT /api/reservations/{reservationId}/rooms/{id}
     * Zaktualizuj przypisanie pokoju do rezerwacji
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReservationRoom> updateRoomAssignment(@PathVariable Long reservationId,
                                                                @PathVariable Long id,
                                                                @RequestBody ReservationRoom updated) {
        Optional<ReservationRoom> optional = reservationRoomRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
    
        ReservationRoom existing = optional.get();
        if (!existing.getReservation().getId().equals(reservationId)) {
            return ResponseEntity.badRequest().build(); // Rezerwacja nie pasuje
        }
    
        // Sprawdzamy, czy pokój jest poprawnie ustawiony
        if (updated.getRoom() == null || updated.getRoom().getId() == null) {
            return ResponseEntity.badRequest().build(); // Zwracamy 400, jeśli pokój jest null
        }
    
        existing.setRoom(updated.getRoom());
        existing.setGuestCount(updated.getGuestCount());
    
        ReservationRoom saved = reservationRoomRepository.save(existing);
        roomStatusManagerService.refreshRoomStatuses();
        return ResponseEntity.ok(saved);
    }
    

    /**
     * DELETE /api/reservations/{reservationId}/rooms/{id}
     * Usuń przypisanie pokoju do rezerwacji
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomAssignment(@PathVariable Long reservationId,
                                                     @PathVariable Long id) {
        Optional<ReservationRoom> optional = reservationRoomRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();

        ReservationRoom existing = optional.get();
        if (!existing.getReservation().getId().equals(reservationId)) {
            return ResponseEntity.badRequest().build();
        }

        reservationRoomRepository.deleteById(id);
        roomStatusManagerService.refreshRoomStatuses();
        return ResponseEntity.noContent().build();
    }
}
