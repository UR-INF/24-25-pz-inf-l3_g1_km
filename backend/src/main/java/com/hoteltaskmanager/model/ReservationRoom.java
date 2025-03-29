package com.hoteltaskmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

/**
 * Reprezentuje przypisanie pokoju do konkretnej rezerwacji,
 * wraz z informacją o liczbie gości w tym pokoju.
 */
@Data
@Entity
@Table(name = "reservation_rooms")
public class ReservationRoom {

    /**
     * Unikalny identyfikator przypisania.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Rezerwacja, do której przypisano pokój.
     */
    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    @JsonBackReference
    private Reservation reservation;

    /**
     * Pokój przypisany do rezerwacji.
     */
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /**
     * Liczba gości zakwaterowanych w danym pokoju w ramach rezerwacji.
     */
    @Column(name = "guest_count", nullable = false)
    private int guestCount;
}
