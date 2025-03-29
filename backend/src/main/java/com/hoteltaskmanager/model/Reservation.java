package com.hoteltaskmanager.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Reprezentuje rezerwację dokonano przez gościa w systemie.
 */
@Data
@Entity
@Table(name = "reservations")
public class Reservation {

    /**
     * Unikalny identyfikator rezerwacji.
     */
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
     * Aktualny status rezerwacji (np. ACTIVE, COMPLETED, CANCELLED).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    /**
     * Dodatkowe życzenia lub uwagi gościa.
     */
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    /**
     * Data i czas ostatniej modyfikacji rezerwacji.
     */
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    /**
     * Flaga informująca, czy rezerwacja zawiera catering.
     */
    @Column(nullable = false)
    private boolean catering;

    /**
     * Imię gościa dokonującego rezerwacji.
     */
    private String guestFirstName;

    /**
     * Nazwisko gościa dokonującego rezerwacji.
     */
    private String guestLastName;

    /**
     * PESEL gościa.
     */
    private String guestPesel;

    /**
     * Numer telefonu kontaktowego gościa.
     */
    private String guestPhone;

    /**
     * Faktura powiązana z rezerwacją (jeśli istnieje).
     */
    @OneToOne
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    /**
     * Lista pokoi przypisanych do rezerwacji.
     */
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReservationRoom> reservationRooms = new ArrayList<>();
}
