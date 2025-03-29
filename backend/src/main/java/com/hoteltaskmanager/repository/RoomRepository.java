package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    /**
     * Znajduje pokoje o określonym statusie (np. AVAILABLE).
     */
    List<Room> findByStatus(RoomStatus status);

    /**
     * Sprawdza, czy istnieje pokój o danym numerze.
     */
    boolean existsByRoomNumber(String roomNumber);
}
