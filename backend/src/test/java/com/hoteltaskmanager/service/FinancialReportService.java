package com.hoteltaskmanager.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialReportServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private FinancialReportService financialReportService;

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Map<String, Object>> sampleRevenueByPeriod;
    private List<Map<String, Object>> sampleOccupancyRevenueCorrelation;
    private Map<String, Object> sampleInvoiceStatistics;
    private Map<String, Object> sampleFinancialSummary;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2025, 4, 1);
        endDate = LocalDate.of(2025, 5, 1);

        // Przygotowanie danych przychodów według okresu
        sampleRevenueByPeriod = new ArrayList<>();
        Map<String, Object> revenuePeriod1 = new HashMap<>();
        revenuePeriod1.put("period", "2025-04-01");
        revenuePeriod1.put("reservation_count", 5);
        revenuePeriod1.put("total_revenue", 3000.0);
        sampleRevenueByPeriod.add(revenuePeriod1);

        Map<String, Object> revenuePeriod2 = new HashMap<>();
        revenuePeriod2.put("period", "2025-04-08");
        revenuePeriod2.put("reservation_count", 8);
        revenuePeriod2.put("total_revenue", 4500.0);
        sampleRevenueByPeriod.add(revenuePeriod2);

        // Przygotowanie danych korelacji obłożenia z przychodami
        sampleOccupancyRevenueCorrelation = new ArrayList<>();
        Map<String, Object> correlation1 = new HashMap<>();
        correlation1.put("period", "2025-04-01");
        correlation1.put("reservation_count", 5);
        correlation1.put("total_nights", 15);
        correlation1.put("unique_rooms_used", 10);
        correlation1.put("total_revenue", 3000.0);
        correlation1.put("avg_revenue_per_night", 200.0);
        correlation1.put("room_usage_percentage", 40.0);
        sampleOccupancyRevenueCorrelation.add(correlation1);

        Map<String, Object> correlation2 = new HashMap<>();
        correlation2.put("period", "2025-04-08");
        correlation2.put("reservation_count", 8);
        correlation2.put("total_nights", 20);
        correlation2.put("unique_rooms_used", 15);
        correlation2.put("total_revenue", 4500.0);
        correlation2.put("avg_revenue_per_night", 225.0);
        correlation2.put("room_usage_percentage", 60.0);
        sampleOccupancyRevenueCorrelation.add(correlation2);

        // Przygotowanie danych statystyk fakturowania
        sampleInvoiceStatistics = new HashMap<>();
        sampleInvoiceStatistics.put("total_invoices", 12);
        sampleInvoiceStatistics.put("total_reservations_with_invoices", 10);
        sampleInvoiceStatistics.put("total_completed_reservations", 15);
        sampleInvoiceStatistics.put("invoice_coverage_percentage", 80.0);
        sampleInvoiceStatistics.put("company_invoices", 4);
        sampleInvoiceStatistics.put("individual_invoices", 8);

        // Przygotowanie danych podsumowania finansowego
        sampleFinancialSummary = new HashMap<>();
        sampleFinancialSummary.put("total_completed_reservations", 15);
        sampleFinancialSummary.put("total_nights_sold", 45);
        sampleFinancialSummary.put("total_revenue", 9000.0);
        sampleFinancialSummary.put("highest_room_rate", 300.0);
        sampleFinancialSummary.put("lowest_room_rate", 150.0);
        sampleFinancialSummary.put("avg_room_rate", 200.0);
        sampleFinancialSummary.put("avg_daily_rate", 200.0);
        sampleFinancialSummary.put("avg_revenue_per_day_of_period", 300.0);
    }

    @Test
    void generateFinancialReport_WithWeekPeriod_ShouldReturnCorrectData() {
        // Given
        String period = "week";

        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(sampleRevenueByPeriod, sampleOccupancyRevenueCorrelation);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(sampleInvoiceStatistics);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(endDate), eq(startDate), eq(startDate), eq(endDate)
        )).thenReturn(sampleFinancialSummary);

        // When
        Map<String, Object> result = financialReportService.generateFinancialReport(period, startDate, endDate);

        // Then
        assertNotNull(result);

        // Sprawdzamy sekcję przychodów według okresu
        assertTrue(result.containsKey("revenueByPeriod"));
        List<Map<String, Object>> revenueByPeriod = (List<Map<String, Object>>) result.get("revenueByPeriod");
        assertEquals(2, revenueByPeriod.size());
        assertEquals("2025-04-01", revenueByPeriod.get(0).get("period"));
        assertEquals(5, revenueByPeriod.get(0).get("reservation_count"));
        assertEquals(3000.0, revenueByPeriod.get(0).get("total_revenue"));

        // Sprawdzamy sekcję korelacji obłożenia z przychodami
        assertTrue(result.containsKey("occupancyRevenueCorrelation"));
        List<Map<String, Object>> occupancyRevenueCorrelation = (List<Map<String, Object>>) result.get("occupancyRevenueCorrelation");
        assertEquals(2, occupancyRevenueCorrelation.size());
        assertEquals("2025-04-01", occupancyRevenueCorrelation.get(0).get("period"));
        assertEquals(15, occupancyRevenueCorrelation.get(0).get("total_nights"));
        assertEquals(40.0, occupancyRevenueCorrelation.get(0).get("room_usage_percentage"));

        // Sprawdzamy sekcję statystyk fakturowania
        assertTrue(result.containsKey("invoiceStatistics"));
        Map<String, Object> invoiceStatistics = (Map<String, Object>) result.get("invoiceStatistics");
        assertEquals(12, invoiceStatistics.get("total_invoices"));
        assertEquals(80.0, invoiceStatistics.get("invoice_coverage_percentage"));

        // Sprawdzamy sekcję podsumowania finansowego
        assertTrue(result.containsKey("financialSummary"));
        Map<String, Object> financialSummary = (Map<String, Object>) result.get("financialSummary");
        assertEquals(15, financialSummary.get("total_completed_reservations"));
        assertEquals(45, financialSummary.get("total_nights_sold"));
        assertEquals(9000.0, financialSummary.get("total_revenue"));
    }

    @Test
    void generateFinancialReport_WithMonthPeriod_ShouldReturnCorrectData() {
        // Given
        String period = "month";

        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(sampleRevenueByPeriod, sampleOccupancyRevenueCorrelation);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(sampleInvoiceStatistics);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(endDate), eq(startDate), eq(startDate), eq(endDate)
        )).thenReturn(sampleFinancialSummary);

        // When
        Map<String, Object> result = financialReportService.generateFinancialReport(period, startDate, endDate);

        // Then
        assertNotNull(result);

        // Sprawdzenie czy raport zawiera te same dane, tylko z innym grupowaniem (które jest obsługiwane przez SQL)
        assertTrue(result.containsKey("revenueByPeriod"));
        assertTrue(result.containsKey("occupancyRevenueCorrelation"));
        assertTrue(result.containsKey("invoiceStatistics"));
        assertTrue(result.containsKey("financialSummary"));
    }

    @Test
    void generateFinancialReport_WithEmptyData_ShouldHandleGracefully() {
        // Given
        String period = "week";

        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(new ArrayList<>(), new ArrayList<>());

        // Przygotuj puste statystyki fakturowania
        Map<String, Object> emptyInvoiceStats = new HashMap<>();
        emptyInvoiceStats.put("total_invoices", 0);
        emptyInvoiceStats.put("total_reservations_with_invoices", 0);
        emptyInvoiceStats.put("total_completed_reservations", 0);
        emptyInvoiceStats.put("invoice_coverage_percentage", 0.0);
        emptyInvoiceStats.put("company_invoices", 0);
        emptyInvoiceStats.put("individual_invoices", 0);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(emptyInvoiceStats);

        // Przygotuj puste podsumowanie finansowe
        Map<String, Object> emptyFinancialSummary = new HashMap<>();
        emptyFinancialSummary.put("total_completed_reservations", 0);
        emptyFinancialSummary.put("total_nights_sold", 0);
        emptyFinancialSummary.put("total_revenue", 0.0);
        emptyFinancialSummary.put("highest_room_rate", 0.0);
        emptyFinancialSummary.put("lowest_room_rate", 0.0);
        emptyFinancialSummary.put("avg_room_rate", 0.0);
        emptyFinancialSummary.put("avg_daily_rate", 0.0);
        emptyFinancialSummary.put("avg_revenue_per_day_of_period", 0.0);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(endDate), eq(startDate), eq(startDate), eq(endDate)
        )).thenReturn(emptyFinancialSummary);

        // When
        Map<String, Object> result = financialReportService.generateFinancialReport(period, startDate, endDate);

        // Then
        assertNotNull(result);

        // Sprawdzenie czy raport zawiera puste listy i wartości zerowe
        assertTrue(result.containsKey("revenueByPeriod"));
        List<Map<String, Object>> revenueByPeriod = (List<Map<String, Object>>) result.get("revenueByPeriod");
        assertTrue(revenueByPeriod.isEmpty());

        assertTrue(result.containsKey("occupancyRevenueCorrelation"));
        List<Map<String, Object>> occupancyRevenueCorrelation = (List<Map<String, Object>>) result.get("occupancyRevenueCorrelation");
        assertTrue(occupancyRevenueCorrelation.isEmpty());

        assertTrue(result.containsKey("invoiceStatistics"));
        Map<String, Object> invoiceStatistics = (Map<String, Object>) result.get("invoiceStatistics");
        assertEquals(0, invoiceStatistics.get("total_invoices"));

        assertTrue(result.containsKey("financialSummary"));
        Map<String, Object> financialSummary = (Map<String, Object>) result.get("financialSummary");
        assertEquals(0, financialSummary.get("total_completed_reservations"));
        assertEquals(0.0, financialSummary.get("total_revenue"));
    }
}