package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

    /**
     * Znajduje pokoje dostępne w podanym zakresie dat (czyli takie, które nie mają rezerwacji kolidujących z zakresem).
     *
     * @param startDate data rozpoczęcia
     * @param endDate data zakończenia
     * @return lista dostępnych pokoi
     */
    @Query("""
        SELECT r FROM Room r WHERE r.id NOT IN (
                SELECT rr.room.id FROM ReservationRoom rr
                JOIN rr.reservation res
                WHERE res.status IN ('ACTIVE', 'UPCOMING')
                AND NOT (
                    res.endDate < :startDate OR
                    res.startDate > :endDate
                )
            )
    """)
    List<Room> findAvailableRoomsBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
