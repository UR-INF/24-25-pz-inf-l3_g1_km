package com.hoteltaskmanager.service;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.ReportRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

/**
 * Serwis odpowiedzialny za przechowywanie raportów w formacie PDF
 * oraz zarządzanie ich metadanymi w bazie danych.
 */
@Service
public class ReportStorageService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Value("${reports.storage.location:reports}")
    private String reportsStorageLocation;

    /**
     * Inicjalizuje katalog przechowywania raportów po uruchomieniu aplikacji.
     * Tworzy katalog, jeśli nie istnieje.
     */
    @PostConstruct
    public void init() {
        try {
            Path reportsPath = Paths.get(reportsStorageLocation);
            if (!Files.exists(reportsPath)) {
                Files.createDirectories(reportsPath);
            }
            System.out.println("Katalog raportów: " + reportsPath.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Nie można utworzyć katalogu do przechowywania raportów: " + reportsStorageLocation, e);
        }
    }

    /**
     * Zapisuje raport w formacie PDF na dysku oraz tworzy odpowiedni wpis w bazie danych.
     * Raport jest przypisywany do aktualnie zalogowanego użytkownika.
     *
     * @param pdfData     dane raportu w formacie PDF
     * @param reportType  typ raportu (np. EMPLOYEE_STATISTICS, GENERAL_REPORT)
     * @param reportPrefix prefiks używany do nazwy pliku
     * @return obiekt {@link Report} reprezentujący zapisany raport
     */
    public Report saveReport(ByteArrayInputStream pdfData, ReportType reportType, String reportPrefix) {
        try {
            Employee currentEmployee = null;
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null) {
                    Object principal = authentication.getPrincipal();

                    // Sprawdź, czy principal to Employee
                    if (principal instanceof Employee) {
                        currentEmployee = (Employee) principal;
                    }
                    else if (principal instanceof String) {
                        String email = (String) principal;
                        Optional<Employee> employeeOpt = employeeRepository.findByEmail(email);
                        if (employeeOpt.isPresent()) {
                            currentEmployee = employeeOpt.get();
                        } else {
                            throw new RuntimeException("Nie można znaleźć pracownika o email: " + email);
                        }
                    } else {
                        throw new RuntimeException("Nieznany typ principal: " +
                                (principal != null ? principal.getClass().getName() : "null"));
                    }
                } else {
                    throw new RuntimeException("Brak autentykacji użytkownika");
                }
            } catch (Exception e) {
                throw new RuntimeException("Nie można pobrać zalogowanego użytkownika: " + e.getMessage(), e);
            }

            // Wygeneruj unikalną nazwę pliku
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = reportPrefix + "_" + timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";

            Path targetLocation = Paths.get(reportsStorageLocation).resolve(filename);

            // Zapisz plik na dysku
            byte[] buffer = new byte[pdfData.available()];
            pdfData.read(buffer);
            Files.write(targetLocation, buffer);

            Report report = new Report();
            report.setCreatedAt(LocalDateTime.now());
            report.setReportFile(filename);
            report.setReportType(reportType);
            report.setCreatedBy(currentEmployee);

            return reportRepository.save(report);
        } catch (IOException ex) {
            throw new RuntimeException("Nie można zapisać pliku raportu", ex);
        }
    }

    /**
     * Pobiera zawartość pliku raportu jako tablicę bajtów na podstawie ID raportu.
     *
     * @param reportId identyfikator raportu
     * @return tablica bajtów reprezentująca zawartość pliku PDF
     */
    public byte[] getReportFile(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Raport o ID " + reportId + " nie istnieje"));

        try {
            Path filePath = Paths.get(reportsStorageLocation).resolve(report.getReportFile());

            if (!Files.exists(filePath)) {
                throw new RuntimeException("Plik raportu nie istnieje na dysku: " + filePath);
            }

            //System.out.println("Odczytywanie pliku raportu: " + filePath);

            byte[] fileData = Files.readAllBytes(filePath);

            //System.out.println("Odczytano " + fileData.length + " bajtów z pliku raportu " + reportId);

            if (fileData.length >= 5) {
                String pdfHeader = new String(fileData, 0, 5, "ASCII");
                if (!pdfHeader.equals("%PDF-")) {
                    System.out.println("Ostrzeżenie: Dane pliku nie zaczynają się od sygnatury PDF (%PDF-)");
                }
            }

            return fileData;
        } catch (IOException ex) {
            throw new RuntimeException("Nie można odczytać pliku raportu: " + ex.getMessage(), ex);
        }
    }

    /**
     * Zwraca ścieżkę do katalogu, w którym są przechowywane pliki raportów.
     *
     * @return ścieżka do katalogu raportów
     */
    public String getReportsStorageLocation() {
        return reportsStorageLocation;
    }

    /**
     * Zwraca instancję repozytorium raportów.
     *
     * @return {@link ReportRepository}
     */
    public ReportRepository getReportRepository() {
        return reportRepository;
    }
}