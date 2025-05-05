package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import com.hoteltaskmanager.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

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

    // Istniejące API JSON
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

    @GetMapping("/room-status")
    public ResponseEntity<?> getRoomStatusReport() {
        return ResponseEntity.ok(roomStatusService.generateRoomStatusReport());
    }

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
     * Generuje kompletny raport PDF dotyczący pracowników, zawierający dane o wydajności personelu
     * i efektywności obsługi pokojów.
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
     * Pobiera zapisany raport z bazy danych.
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

            // Sprawdź nagłówek PDF
            if (reportData.length >= 5) {
                String pdfHeader = new String(reportData, 0, 5, "ASCII");
                System.out.println("Nagłówek pliku: " + pdfHeader);
            }

            ByteArrayResource resource = new ByteArrayResource(reportData);

            // ContentDisposition.builder() dla większej kontroli
            ContentDisposition contentDisposition = ContentDisposition.builder("inline")
                    .filename("report-" + reportId + ".pdf")
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentLength(reportData.length);
            headers.setContentDisposition(contentDisposition);

            // Dodajemy CORS nagłówki, jeśli aplikacja działa w środowisku cross-origin
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
     * Usuwanie raportu z bazy danych i systemu plików.
     *
     * @param reportId Identyfikator raportu do usunięcia
     * @return ResponseEntity zawierający wynik operacji usuwania
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
     * Zwraca listę zapisanych raportów.
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