package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Reprezentuje zgłoszenie serwisowe.
 * Zawiera informacje o zgłoszeniu, osobach uczestniczących oraz statusie naprawy.
 */
@Data
@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {

    /**
     * Unikalny identyfikator zgłoszenia.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Data i czas zgłoszenia.
     */
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    /**
     * Opis problemu zgłoszonego do naprawy.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Pokój, którego dotyczy zgłoszenie.
     */
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = true)
    private Room room;

    /**
     * Pracownik, który zgłosił problem.
     */
    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    /**
     * Pracownik przypisany do wykonania naprawy.
     */
    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private Employee assignee;

    /**
     * Aktualny status zgłoszenia (np. PENDING, COMPLETED).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;

    /**
     * Podsumowanie wykonanej usługi / naprawy.
     */
    @Column(name = "service_summary", columnDefinition = "TEXT")
    private String serviceSummary;

    /**
     * Data i czas zakończenia zgłoszenia.
     */
    @Column(name = "completion_date")
    private LocalDateTime completionDate;
}
