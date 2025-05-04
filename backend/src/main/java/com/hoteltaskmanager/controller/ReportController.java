package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import com.hoteltaskmanager.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
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

    // Nowe endpointy PDF

    /**
     * Generuje kompletny raport PDF dotyczący pracowników, zawierający dane o wydajności personelu
     * i efektywności obsługi pokojów.
     */
    @GetMapping(value = "/pdf/staff", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> getStaffReportPdf(
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

        // Use generateAndSaveStaffReport instead of generateStaffReport
        Report savedReport = pdfReportGeneratorService.generateAndSaveStaffReport(reportData, startDate, endDate);

        // Get the saved report file
        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayInputStream pdfStream = new ByteArrayInputStream(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=staff-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @GetMapping(value = "/pdf/financial", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> getFinancialReportPdf(
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

        // Use generateAndSaveFinancialReport instead of generateFinancialReport
        Report savedReport = pdfReportGeneratorService.generateAndSaveFinancialReport(reportData, period, startDate, endDate);

        // Get the saved report file
        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayInputStream pdfStream = new ByteArrayInputStream(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=financial-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @GetMapping(value = "/pdf/rooms", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> getRoomsReportPdf(
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

        // Use generateAndSaveRoomsReport instead of generateRoomsReport
        Report savedReport = pdfReportGeneratorService.generateAndSaveRoomsReport(reportData, startDate, endDate);

        // Get the saved report file
        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayInputStream pdfStream = new ByteArrayInputStream(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=rooms-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @GetMapping(value = "/pdf/complete", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> getCompleteReportPdf(
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

        // Use generateAndSaveCompleteReport instead of generateCompleteReport
        Report savedReport = pdfReportGeneratorService.generateAndSaveCompleteReport(reportData, period, startDate, endDate);

        // Get the saved report file
        byte[] reportBytes = reportStorageService.getReportFile(savedReport.getId());
        ByteArrayInputStream pdfStream = new ByteArrayInputStream(reportBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=hotel-complete-report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    /**
     * Pobiera zapisany raport z bazy danych.
     */
    @GetMapping(value = "/saved/{reportId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getSavedReport(@PathVariable Long reportId) {
        byte[] reportData = reportStorageService.getReportFile(reportId);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report-" + reportId + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(reportData);
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