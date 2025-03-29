package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.ReservationRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRoomRepository extends JpaRepository<ReservationRoom, Long> {

    /**
     * Znajduje wszystkie pokoje przypisane do danej rezerwacji.
     */
    List<ReservationRoom> findByReservationId(Long reservationId);
}
