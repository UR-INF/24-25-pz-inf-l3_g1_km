package com.hoteltaskmanager.service;

import com.hoteltaskmanager.model.*;
import com.hoteltaskmanager.repository.MaintenanceRequestRepository;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serwis odpowiedzialny za zarządzanie statusem pokoi na podstawie rezerwacji i zgłoszeń usterek.
 */
@Service
public class RoomStatusManagerService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public RoomStatusManagerService(RoomRepository roomRepository,
                                    ReservationRepository reservationRepository,
                                    MaintenanceRequestRepository maintenanceRequestRepository) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    /**
     * Odświeża statusy wszystkich pokoi na podstawie ich przypisań do rezerwacji i zgłoszeń.
     */
    @Transactional
    public void refreshRoomStatuses() {
        List<Room> allRooms = roomRepository.findAll();

        for (Room room : allRooms) {
            boolean hasActiveReservation = reservationRepository.findAll().stream()
                    .filter(r -> r.getReservationRooms().stream().anyMatch(rr -> rr.getRoom().getId().equals(room.getId())))
                    .anyMatch(r -> r.getStatus() == ReservationStatus.ACTIVE);

            boolean hasPendingMaintenance = maintenanceRequestRepository.findByRoomId(room.getId()).stream()
                    .anyMatch(mr -> mr.getStatus() != MaintenanceStatus.COMPLETED);

            if (hasPendingMaintenance) {
                room.setStatus(RoomStatus.OUT_OF_SERVICE);
            } else if (hasActiveReservation) {
                room.setStatus(RoomStatus.OCCUPIED);
            } else {
                room.setStatus(RoomStatus.AVAILABLE);
            }

            roomRepository.save(room);
        }
    }
}
