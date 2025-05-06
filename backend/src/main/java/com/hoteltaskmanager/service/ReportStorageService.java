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

@Service
public class ReportStorageService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Value("${reports.storage.location:reports}")
    private String reportsStorageLocation;

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
     * Zapisuje raport PDF i tworzy wpis w tabeli reports.
     *
     * @param pdfData Strumień danych PDF
     * @param reportType Typ raportu (EMPLOYEE_STATISTICS lub GENERAL_REPORT)
     * @param reportPrefix Prefiks nazwy pliku
     * @return Obiekt Report reprezentujący zapisany raport
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
     * Pobiera raport na podstawie identyfikatora.
     *
     * @param reportId Identyfikator raportu
     * @return Tablica bajtów zawierająca dane PDF
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
     * Zwraca ścieżkę do lokalizacji przechowywania raportów.
     *
     * @return Ścieżka do katalogu z raportami
     */
    public String getReportsStorageLocation() {
        return reportsStorageLocation;
    }

    /**
     * Pobiera repozytorium raportów.
     */
    public ReportRepository getReportRepository() {
        return reportRepository;
    }
}