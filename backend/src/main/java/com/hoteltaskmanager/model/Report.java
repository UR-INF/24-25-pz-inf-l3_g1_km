package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Reprezentuje raport wygenerowany w systemie, np. statystyki pracowników lub ogólne podsumowanie.
 */
@Data
@Entity
@Table(name = "reports")
public class Report {

    /**
     * Unikalny identyfikator raportu.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nazwa lub ścieżka do pliku raportu.
     */
    @Column(name = "report_file")
    private String reportFile;

    /**
     * Data i czas utworzenia raportu.
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Typ raportu, np. EMPLOYEE_STATISTICS lub GENERAL_REPORT.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    /**
     * Pracownik, który utworzył raport.
     * Relacja wiele raportów do jednego pracownika.
     */
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Employee createdBy;
}
