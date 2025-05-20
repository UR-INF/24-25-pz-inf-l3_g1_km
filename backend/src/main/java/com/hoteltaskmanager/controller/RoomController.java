package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.model.RoomStatus;
import com.hoteltaskmanager.repository.RoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST API dla zarządzania pokojami hotelowymi.
 *
 * Dostępne endpointy:
 *
 * GET    /api/rooms                   - Pobierz wszystkie pokoje
 * GET    /api/rooms/rooms/available   - Pobierz pokoje dostępne w danym okresie czasu
 * GET    /api/rooms/{id}              - Pobierz pokój po ID
 * POST   /api/rooms                   - Dodaj nowy pokój
 * PUT    /api/rooms/{id}              - Zaktualizuj dane pokoju
 * DELETE /api/rooms/{id}              - Usuń pokój
 * GET    /api/rooms/status/{status}   - Pokoje według statusu (np. AVAILABLE)
 * GET    /api/rooms/exists/{number}   - Sprawdź, czy istnieje pokój o danym numerze
 */

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    /**
     * GET /api/rooms
     * Pobierz wszystkie pokoje
     */
    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    /**
     * GET /api/rooms/rooms/available
     * Pobierz wszystkie pokoje
     */
    @GetMapping("/rooms/available")
    public ResponseEntity<List<Room>> getAvailableRooms(@RequestParam("from") String from, @RequestParam("to") String to) {

        LocalDate startDate = LocalDate.parse(from);
        LocalDate endDate = LocalDate.parse(to);

        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }

        List<Room> availableRooms = roomRepository.findAvailableRoomsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(availableRooms);
    }

    /**
     * GET /api/rooms/{id}
     * Pobierz pokój po jego ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/rooms
     * Dodaj nowy pokój
     */
    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(roomRepository.save(room));
    }

    /**
     * PUT /api/rooms/{id}
     * Zaktualizuj dane pokoju
     */
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room updatedRoom) {
        Optional<Room> optionalRoom = roomRepository.findById(id);

        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room existingRoom = optionalRoom.get();
        existingRoom.setRoomNumber(updatedRoom.getRoomNumber());
        existingRoom.setFloor(updatedRoom.getFloor());
        existingRoom.setBedCount(updatedRoom.getBedCount());
        existingRoom.setPricePerNight(updatedRoom.getPricePerNight());
        existingRoom.setStatus(updatedRoom.getStatus());

        return ResponseEntity.ok(roomRepository.save(existingRoom));
    }

    /**
     * DELETE /api/rooms/{id}
     * Usuń pokój po ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        roomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/rooms/status/{status}
     * Pobierz pokoje według statusu (np. AVAILABLE)
     */
    @GetMapping("/status/{status}")
    public List<Room> getRoomsByStatus(@PathVariable RoomStatus status) {
        return roomRepository.findByStatus(status);
    }

    /**
     * GET /api/rooms/exists/{number}
     * Sprawdź, czy istnieje pokój o danym numerze
     */
    @GetMapping("/exists/{number}")
    public ResponseEntity<Boolean> roomExists(@PathVariable String number) {
        boolean exists = roomRepository.existsByRoomNumber(number);
        return ResponseEntity.ok(exists);
    }

}
