package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Znajduje rezerwacje o konkretnym statusie (np. ACTIVE).
     */
    List<Reservation> findByStatus(ReservationStatus status);

    /**
     * Znajduje rezerwacje, które mają datę rozpoczęcia po danym dniu.
     */
    List<Reservation> findByStartDateAfter(LocalDate date);
}
