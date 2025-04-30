package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Reprezentuje zadanie zlecone personelowi sprzątającemu.
 */
@Data
@Entity
@Table(name = "housekeeping_tasks")
public class HousekeepingTask {

    /**
     * Unikalny identyfikator zadania.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Pracownik przypisany do wykonania zadania.
     */
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = true)
    private Employee employee;

    /**
     * Pokój, którego dotyczy zadanie.
     */
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    /**
     * Data i czas przypisania zadania.
     */
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    /**
     * Data i czas zakończenia zadania (jeśli zakończone).
     */
    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    /**
     * Aktualny status zadania.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HousekeepingStatus status;

    /**
     * Opis zadania do wykonania.
     */
    @Column(columnDefinition = "TEXT")
    private String description;
}
