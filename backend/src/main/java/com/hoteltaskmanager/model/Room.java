package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Reprezentuje pokój hotelowy wraz z jego numerem, piętrem, liczbą łóżek oraz stanem dostępności.
 */
@Data
@Entity
@Table(name = "rooms")
public class Room {

    /**
     * Unikalny identyfikator pokoju.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Numer pokoju (np. "101", "B12").
     */
    @Column(name = "room_number", nullable = false, length = 10)
    private String roomNumber;

    /**
     * Piętro, na którym znajduje się pokój.
     */
    @Column(nullable = false)
    private Integer floor;

    /**
     * Liczba łóżek w pokoju.
     */
    @Column(name = "bed_count", nullable = false)
    private Integer bedCount;

    /**
     * Cena za jedną noc pobytu.
     */
    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    /**
     * Aktualny status pokoju (np. dostępny, zajęty, wyłączony z użytku).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;
}
