package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Reprezentuje rezerwację dokonano przez gościa w systemie.
 */
@Data
@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Data rozpoczęcia pobytu.
     */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * Data zakończenia pobytu.
     */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /**
     * Status rezerwacji (ACTIVE, CANCELLED, COMPLETED).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    /**
     * Specjalne życzenia gościa.
     */
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    /**
     * Data ostatniej modyfikacji rezerwacji.
     */
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    /**
     * Czy obejmuje catering.
     */
    @Column(nullable = false)
    private boolean catering;

    /**
     * Dane kontaktowe gościa.
     */
    private String guestFirstName;
    private String guestLastName;
    private String guestPesel;
    private String guestPhone;

    /**
     * Faktura powiązana z rezerwacją.
     */
    @OneToOne
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;
}
