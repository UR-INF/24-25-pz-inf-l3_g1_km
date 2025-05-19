package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repozytorium JPA dla encji {@link Report}.
 * Umożliwia wykonywanie operacji CRUD oraz wyszukiwanie raportów po autorze i typie.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * Zwraca listę raportów utworzonych przez danego pracownika.
     *
     * @param employeeId ID pracownika, który utworzył raporty
     * @return lista raportów utworzonych przez danego pracownika
     */
    List<Report> findByCreatedById(Long employeeId);

    /**
     * Zwraca listę raportów o określonym typie.
     *
     * @param reportType typ raportu
     * @return lista raportów danego typu
     */
    List<Report> findByReportType(ReportType reportType);
}