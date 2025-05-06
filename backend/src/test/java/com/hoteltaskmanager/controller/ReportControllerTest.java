package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import com.hoteltaskmanager.repository.ReportRepository;
import com.hoteltaskmanager.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StaffPerformanceReportService staffPerformanceService;

    @Mock
    private RoomStatusReportService roomStatusService;

    @Mock
    private MaintenanceIssuesReportService maintenanceIssuesService;

    @Mock
    private HousekeepingEfficiencyReportService housekeepingService;

    @Mock
    private ReservationManagementReportService reservationService;

    @Mock
    private FinancialReportService financialService;

    @Mock
    private PdfReportGeneratorService pdfReportGeneratorService;

    @Mock
    private ReportStorageService reportStorageService;

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportController reportController;

    private Map<String, Object> sampleStaffReport;
    private Map<String, Object> sampleRoomStatusReport;
    private Map<String, Object> sampleMaintenanceReport;
    private Map<String, Object> sampleHousekeepingReport;
    private Map<String, Object> sampleReservationReport;
    private Map<String, Object> sampleFinancialReport;
    private Report sampleReport;
    private byte[] samplePdfBytes;

    @BeforeEach
    void setUp() {
        // Inicjalizacja obiektu MockMvc
        mockMvc = MockMvcBuilders
                .standaloneSetup(reportController)
                .build();

        // NIE konfigurujemy tutaj reportStorageService.getReportRepository() globalnie
        // Będziemy to robić tylko w testach, które tego potrzebują

        // Przygotowanie danych testowych
        sampleStaffReport = new HashMap<>();
        List<Map<String, Object>> tasksByEmployee = new ArrayList<>();
        Map<String, Object> employeeTask = new HashMap<>();
        employeeTask.put("employee_name", "Jan Kowalski");
        employeeTask.put("role_name", "HOUSEKEEPER");
        employeeTask.put("housekeeping_tasks", 10);
        employeeTask.put("maintenance_tasks", 0);
        employeeTask.put("total_tasks", 10);
        employeeTask.put("success_rate", 90.0);
        tasksByEmployee.add(employeeTask);
        sampleStaffReport.put("tasksByEmployee", tasksByEmployee);

        // Przygotowanie danych pokojów
        sampleRoomStatusReport = new HashMap<>();
        List<Map<String, Object>> roomStatus = new ArrayList<>();
        Map<String, Object> roomData = new HashMap<>();
        roomData.put("status", "AVAILABLE");
        roomData.put("count", 20);
        roomData.put("percentage", 80.0);
        roomStatus.add(roomData);
        sampleRoomStatusReport.put("roomStatus", roomStatus);

        // Przygotowanie danych konserwacji
        sampleMaintenanceReport = new HashMap<>();
        Map<String, Object> avgResolutionTime = new HashMap<>();
        avgResolutionTime.put("avg_hours_to_complete", 5.5);
        sampleMaintenanceReport.put("avgResolutionTime", avgResolutionTime);

        // Przygotowanie danych sprzątania
        sampleHousekeepingReport = new HashMap<>();
        List<Map<String, Object>> taskCompletionRate = new ArrayList<>();
        Map<String, Object> taskData = new HashMap<>();
        taskData.put("employee_name", "Anna Nowak");
        taskData.put("total_assigned", 15);
        taskData.put("completed", 14);
        taskData.put("completion_rate", 93.33);
        taskCompletionRate.add(taskData);
        sampleHousekeepingReport.put("taskCompletionRate", taskCompletionRate);

        // Przygotowanie danych rezerwacji
        sampleReservationReport = new HashMap<>();
        List<Map<String, Object>> roomAvailabilityForecast = new ArrayList<>();
        Map<String, Object> forecastData = new HashMap<>();
        forecastData.put("date", LocalDate.now());
        forecastData.put("total_rooms", 25);
        forecastData.put("available_rooms", 10);
        forecastData.put("occupied_rooms", 15);
        forecastData.put("occupancy_rate", 60.0);
        roomAvailabilityForecast.add(forecastData);
        sampleReservationReport.put("roomAvailabilityForecast", roomAvailabilityForecast);

        // Przygotowanie danych finansowych
        sampleFinancialReport = new HashMap<>();
        Map<String, Object> financialSummary = new HashMap<>();
        financialSummary.put("total_completed_reservations", 50);
        financialSummary.put("total_revenue", 25000.0);
        sampleFinancialReport.put("financialSummary", financialSummary);

        // Przygotowanie przykładowego raportu
        sampleReport = new Report();
        sampleReport.setId(1L);
        sampleReport.setReportType(ReportType.EMPLOYEE_STATISTICS);
        sampleReport.setReportFile("staff_report_20250506.pdf");
        sampleReport.setCreatedAt(LocalDateTime.now());

        // Przykładowe dane PDF
        samplePdfBytes = new byte[]{37, 80, 68, 70, 45, 49, 46, 53}; // %PDF-1.5 header
    }

    // ---------------- JSON Reports Tests ----------------

    @Test
    void shouldReturnStaffPerformanceReport() throws Exception {
        when(staffPerformanceService.generateStaffPerformanceReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleStaffReport);

        mockMvc.perform(get("/api/reports/staff-performance")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasksByEmployee[0].employee_name").value("Jan Kowalski"))
                .andExpect(jsonPath("$.tasksByEmployee[0].role_name").value("HOUSEKEEPER"))
                .andExpect(jsonPath("$.tasksByEmployee[0].success_rate").value(90.0));
    }

    @Test
    void shouldReturnRoomStatusReport() throws Exception {
        when(roomStatusService.generateRoomStatusReport()).thenReturn(sampleRoomStatusReport);

        mockMvc.perform(get("/api/reports/room-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomStatus[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.roomStatus[0].count").value(20))
                .andExpect(jsonPath("$.roomStatus[0].percentage").value(80.0));
    }

    @Test
    void shouldReturnMaintenanceIssuesReport() throws Exception {
        when(maintenanceIssuesService.generateMaintenanceIssuesReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleMaintenanceReport);

        mockMvc.perform(get("/api/reports/maintenance-issues")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avgResolutionTime.avg_hours_to_complete").value(5.5));
    }

    @Test
    void shouldReturnHousekeepingEfficiencyReport() throws Exception {
        when(housekeepingService.generateHousekeepingEfficiencyReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleHousekeepingReport);

        mockMvc.perform(get("/api/reports/housekeeping-efficiency")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskCompletionRate[0].employee_name").value("Anna Nowak"))
                .andExpect(jsonPath("$.taskCompletionRate[0].completion_rate").value(93.33));
    }

    @Test
    void shouldReturnReservationManagementReport() throws Exception {
        when(reservationService.generateReservationManagementReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReservationReport);

        mockMvc.perform(get("/api/reports/reservations")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomAvailabilityForecast[0].total_rooms").value(25))
                .andExpect(jsonPath("$.roomAvailabilityForecast[0].occupancy_rate").value(60.0));
    }

    @Test
    void shouldReturnFinancialReport() throws Exception {
        when(financialService.generateFinancialReport(any(String.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleFinancialReport);

        mockMvc.perform(get("/api/reports/financial")
                        .param("period", "month")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.financialSummary.total_completed_reservations").value(50))
                .andExpect(jsonPath("$.financialSummary.total_revenue").value(25000.0));
    }

    // ---------------- PDF Reports Tests ----------------

    @Test
    void shouldReturnStaffReportPdf() throws Exception {
        when(staffPerformanceService.generateStaffPerformanceReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleStaffReport);
        when(housekeepingService.generateHousekeepingEfficiencyReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleHousekeepingReport);
        when(pdfReportGeneratorService.generateAndSaveStaffReport(any(Map.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReport);
        when(reportStorageService.getReportFile(1L)).thenReturn(samplePdfBytes);

        mockMvc.perform(get("/api/reports/pdf/staff")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void shouldReturnFinancialReportPdf() throws Exception {
        when(financialService.generateFinancialReport(any(String.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleFinancialReport);
        when(pdfReportGeneratorService.generateAndSaveFinancialReport(any(Map.class), any(String.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReport);
        when(reportStorageService.getReportFile(1L)).thenReturn(samplePdfBytes);

        mockMvc.perform(get("/api/reports/pdf/financial")
                        .param("period", "month")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void shouldReturnRoomsReportPdf() throws Exception {
        when(roomStatusService.generateRoomStatusReport()).thenReturn(sampleRoomStatusReport);
        when(maintenanceIssuesService.generateMaintenanceIssuesReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleMaintenanceReport);
        when(reservationService.generateReservationManagementReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReservationReport);
        when(pdfReportGeneratorService.generateAndSaveRoomsReport(any(Map.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReport);
        when(reportStorageService.getReportFile(1L)).thenReturn(samplePdfBytes);

        mockMvc.perform(get("/api/reports/pdf/rooms")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void shouldReturnCompleteReportPdf() throws Exception {
        when(staffPerformanceService.generateStaffPerformanceReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleStaffReport);
        when(housekeepingService.generateHousekeepingEfficiencyReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleHousekeepingReport);
        when(roomStatusService.generateRoomStatusReport()).thenReturn(sampleRoomStatusReport);
        when(maintenanceIssuesService.generateMaintenanceIssuesReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleMaintenanceReport);
        when(reservationService.generateReservationManagementReport(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReservationReport);
        when(financialService.generateFinancialReport(any(String.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleFinancialReport);
        when(pdfReportGeneratorService.generateAndSaveCompleteReport(any(Map.class), any(String.class), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sampleReport);
        when(reportStorageService.getReportFile(1L)).thenReturn(samplePdfBytes);

        mockMvc.perform(get("/api/reports/pdf/complete")
                        .param("period", "month")
                        .param("startDate", "2025-04-01")
                        .param("endDate", "2025-05-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    // ---------------- Saved Reports Tests ----------------

    @Test
    void shouldReturnSavedReport() throws Exception {
        when(reportStorageService.getReportFile(1L)).thenReturn(samplePdfBytes);

        mockMvc.perform(get("/api/reports/saved/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void shouldReturnNotFoundForNonExistentReport() throws Exception {
        when(reportStorageService.getReportFile(99L)).thenThrow(new RuntimeException("Raport o ID 99 nie istnieje"));

        mockMvc.perform(get("/api/reports/saved/99"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldReturnSavedReportsList() throws Exception {
        // Konfigurowanie mocka w ramach testu, a nie globalnie
        when(reportStorageService.getReportRepository()).thenReturn(reportRepository);

        List<Report> reports = new ArrayList<>();
        reports.add(sampleReport);

        when(reportRepository.findAll()).thenReturn(reports);

        mockMvc.perform(get("/api/reports/saved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].reportType").value("EMPLOYEE_STATISTICS"));
    }

    @Test
    void shouldReturnSavedReportsListFilteredByType() throws Exception {
        // Konfigurowanie mocka w ramach testu, a nie globalnie
        when(reportStorageService.getReportRepository()).thenReturn(reportRepository);

        List<Report> reports = new ArrayList<>();
        reports.add(sampleReport);

        when(reportRepository.findByReportType(ReportType.EMPLOYEE_STATISTICS)).thenReturn(reports);

        mockMvc.perform(get("/api/reports/saved")
                        .param("reportType", "EMPLOYEE_STATISTICS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].reportType").value("EMPLOYEE_STATISTICS"));
    }

    @Test
    void shouldDeleteReport() throws Exception {
        // Konfigurowanie mocka w ramach testu, a nie globalnie
        when(reportStorageService.getReportRepository()).thenReturn(reportRepository);

        // Przygotowanie mocka dla raportu z plikiem
        Report reportToDelete = new Report();
        reportToDelete.setId(1L);
        reportToDelete.setReportType(ReportType.EMPLOYEE_STATISTICS);
        reportToDelete.setReportFile("test_report.pdf");

        when(reportRepository.findById(1L)).thenReturn(Optional.of(reportToDelete));

        // Mockowanie metody getReportsStorageLocation
        when(reportStorageService.getReportsStorageLocation()).thenReturn("./reports");

        doNothing().when(reportRepository).delete(any(Report.class));

        // Pomiń wywołanie Files.deleteIfExists

        mockMvc.perform(delete("/api/reports/saved/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.reportId").value(1));
    }
}