package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import com.hoteltaskmanager.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

/**
 * Kontroler REST do generowania i zarządzania raportami w systemie zarządzania hotelem.
 * Umożliwia tworzenie raportów w formacie JSON oraz PDF, pobieranie zapisanych raportów,
 * ich usuwanie i filtrowanie według typu.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private StaffPerformanceReportService staffPerformanceService;

    @Autowired
    private RoomStatusReportService roomStatusService;

    @Autowired
    private MaintenanceIssuesReportService maintenanceIssuesService;

    @Autowired
    private HousekeepingEfficiencyReportService housekeepingService;

    @Autowired
    private ReservationManagementReportService reservationService;

    @Autowired
    private FinancialReportService financialService;

    @Autowired
    private PdfReportGeneratorService pdfReportGeneratorService;

    @Autowired
    private ReportStorageService reportStorageService;

    /**
     * Generuje raport dotyczący wydajności personelu w zadanym zakresie dat.
     *
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return JSON zawierający dane raportu
     */
    @GetMapping("/staff-performance")
    public ResponseEntity<?> getStaffPerformanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        return ResponseEntity.ok(staffPerformanceService.generateStaffPerformanceReport(startDate, endDate));
    }

    /**
     * Generuje raport dotyczący stanu pokoi.
     *
     * @return JSON zawierający dane raportu
     */
    @GetMapping("/room-status")
    public ResponseEntity<?> getRoomStatusReport() {
        return ResponseEntity.ok(roomStatusService.generateRoomStatusReport());
    }

    /**
     * Generuje raport dotyczący zgłoszeń konserwacyjnych w zadanym zakresie dat.
     *
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return JSON zawierający dane raportu
     */
    @GetMapping("/maintenance-issues")
    public ResponseEntity<?> getMaintenanceIssuesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        return ResponseEntity.ok(maintenanceIssuesService.generateMaintenanceIssuesReport(startDate, endDate));
    }

    /**
     * Generuje raport dotyczący efektywności pracy działu housekeeping
     * w zadanym zakresie dat.
     *
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return JSON zawierający dane raportu
     */
    @GetMapping("/housekeeping-efficiency")
    public ResponseEntity<?> getHousekeepingEfficiencyReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        return ResponseEntity.ok(housekeepingService.generateHousekeepingEfficiencyReport(startDate, endDate));
    }

    /**
     * Generuje raport dotyczący zarządzania rezerwacjami w zadanym zakresie dat.
     *
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return JSON zawierający dane raportu
     */
    @GetMapping("/reservations")
    public ResponseEntity<?> getReservationManagementReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        return ResponseEntity.ok(reservationService.generateReservationManagementReport(startDate, endDate));
    }

    /**
     * Generuje raport finansowy za określony okres (tydzień, miesiąc, kwartał).
     *
     * @param period    Okres raportu (np. "week", "month", "quarter")
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return JSON zawierający dane raportu finansowego
     */
    @GetMapping("/financial")
    public ResponseEntity<?> getFinancialReport(
            @RequestParam(required = false) String period, // week, month, quarter
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (period == null) {
            period = "week";
        }
        return ResponseEntity.ok(financialService.generateFinancialReport(period, startDate, endDate));
    }

    /**
     * Generuje raport PDF dla personelu hotelowego,
     * łącząc dane o wydajności i efektywności sprzątania.
     *
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return PDF jako zasób HTTP
     */
    @GetMapping(value = "/pdf/staff", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getStaffReportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("staffPerformance", staffPerformanceService.generateStaffPerformanceReport(startDate, endDate));
        reportData.put("housekeepingEfficiency", housekeepingService.generateHousekeepingEfficiencyReport(startDate, endDate));

        Report savedReport = pdfReportGeneratorService.generateAndSaveStaffReport(reportData, startDate, endDate);

        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayResource resource = new ByteArrayResource(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=staff-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    /**
     * Generuje raport PDF zawierający dane finansowe.
     *
     * @param period    Okres raportu (np. "week", "month", "quarter")
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return PDF jako zasób HTTP
     */
    @GetMapping(value = "/pdf/financial", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getFinancialReportPdf(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (period == null) {
            period = "week";
        }

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("financial", financialService.generateFinancialReport(period, startDate, endDate));

        Report savedReport = pdfReportGeneratorService.generateAndSaveFinancialReport(reportData, period, startDate, endDate);

        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayResource resource = new ByteArrayResource(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=financial-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    /**
     * Generuje raport PDF dotyczący pokoi hotelowych,
     * zawierający dane o stanie pokoi, konserwacjach i rezerwacjach.
     *
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return PDF jako zasób HTTP
     */
    @GetMapping(value = "/pdf/rooms", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getRoomsReportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("roomStatus", roomStatusService.generateRoomStatusReport());
        reportData.put("maintenanceIssues", maintenanceIssuesService.generateMaintenanceIssuesReport(startDate, endDate));
        reportData.put("reservations", reservationService.generateReservationManagementReport(startDate, endDate));

        Report savedReport = pdfReportGeneratorService.generateAndSaveRoomsReport(reportData, startDate, endDate);

        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayResource resource = new ByteArrayResource(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=rooms-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    /**
     * Generuje pełny raport PDF zawierający wszystkie dostępne dane:
     * personel, housekeeping, pokoje, konserwacje, rezerwacje i finanse.
     *
     * @param period    Okres raportu finansowego
     * @param startDate Data początkowa (opcjonalna)
     * @param endDate   Data końcowa (opcjonalna)
     * @return PDF jako zasób HTTP
     */
    @GetMapping(value = "/pdf/complete", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getCompleteReportPdf(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (period == null) {
            period = "week";
        }

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("staffPerformance", staffPerformanceService.generateStaffPerformanceReport(startDate, endDate));
        reportData.put("housekeepingEfficiency", housekeepingService.generateHousekeepingEfficiencyReport(startDate, endDate));
        reportData.put("roomStatus", roomStatusService.generateRoomStatusReport());
        reportData.put("maintenanceIssues", maintenanceIssuesService.generateMaintenanceIssuesReport(startDate, endDate));
        reportData.put("reservations", reservationService.generateReservationManagementReport(startDate, endDate));
        reportData.put("financial", financialService.generateFinancialReport(period, startDate, endDate));

        Report savedReport = pdfReportGeneratorService.generateAndSaveCompleteReport(reportData, period, startDate, endDate);

        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayResource resource = new ByteArrayResource(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=hotel-complete-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    /**
     * Pobiera wcześniej zapisany raport PDF na podstawie identyfikatora.
     *
     * @param reportId ID raportu do pobrania
     * @return PDF jako zasób HTTP lub 404 jeśli raport nie istnieje
     */
    @GetMapping(value = "/saved/{reportId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getSavedReport(@PathVariable Long reportId) {
        try {
            byte[] reportData = reportStorageService.getReportFile(reportId);

            if (reportData == null || reportData.length == 0) {
                System.out.println("Brak danych dla raportu ID: " + reportId);
                return ResponseEntity.notFound().build();
            }

            System.out.println("Odczytano " + reportData.length + " bajtów dla raportu ID: " + reportId);

            if (reportData.length >= 5) {
                String pdfHeader = new String(reportData, 0, 5, "ASCII");
                System.out.println("Nagłówek pliku: " + pdfHeader);
            }

            ByteArrayResource resource = new ByteArrayResource(reportData);

            ContentDisposition contentDisposition = ContentDisposition.builder("inline")
                    .filename("report-" + reportId + ".pdf")
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentLength(reportData.length);
            headers.setContentDisposition(contentDisposition);

            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Expose-Headers", "Content-Disposition, Content-Type, Content-Length");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Usuwa zapisany raport z systemu plików i bazy danych.
     *
     * @param reportId ID raportu do usunięcia
     * @return Informacja o sukcesie lub błędzie operacji
     */
    @DeleteMapping("/saved/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        try {
            Report report = reportStorageService.getReportRepository()
                    .findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Raport o ID " + reportId + " nie istnieje"));

            String fileName = report.getReportFile();

            Path filePath = Paths.get(reportStorageService.getReportsStorageLocation()).resolve(fileName);

            boolean fileDeleted = Files.deleteIfExists(filePath);

            if (!fileDeleted) {
                System.out.println("Plik nie istnieje lub nie mógł zostać usunięty: " + filePath);
            }

            reportStorageService.getReportRepository().delete(report);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Raport został pomyślnie usunięty",
                    "reportId", reportId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Błąd podczas usuwania raportu: " + e.getMessage(),
                            "reportId", reportId
                    ));
        }
    }

    /**
     * Zwraca listę wszystkich zapisanych raportów lub filtruje je
     * według podanego typu raportu.
     *
     * @param reportType Typ raportu do filtrowania (opcjonalny)
     * @return Lista raportów
     */
    @GetMapping("/saved")
    public ResponseEntity<List<Report>> getSavedReports(
            @RequestParam(required = false) ReportType reportType) {
        List<Report> reports;

        if (reportType != null) {
            reports = reportStorageService.getReportRepository().findByReportType(reportType);
        } else {
            reports = reportStorageService.getReportRepository().findAll();
        }

        return ResponseEntity.ok(reports);
    }
}