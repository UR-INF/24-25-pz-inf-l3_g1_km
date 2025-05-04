package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancialReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Map<String, Object> generateFinancialReport(String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> reportData = new HashMap<>();

        String groupBy = "";
        String dateFormat = "";

        if ("week".equals(period)) {
            groupBy = "YEARWEEK(res.start_date, 1)";
            dateFormat = "CONCAT(YEAR(MIN(res.start_date)), '-W', WEEK(MIN(res.start_date)))";
        } else if ("month".equals(period)) {
            groupBy = "DATE_FORMAT(res.start_date, '%Y-%m')";
            dateFormat = "DATE_FORMAT(MIN(res.start_date), '%Y-%m')";
        } else if ("quarter".equals(period)) {
            groupBy = "CONCAT(YEAR(res.start_date), '-Q', QUARTER(res.start_date))";
            dateFormat = "CONCAT(YEAR(MIN(res.start_date)), '-Q', QUARTER(MIN(res.start_date)))";
        } else {
            // Default to daily
            groupBy = "DATE(res.start_date)";
            dateFormat = "DATE(MIN(res.start_date))";
        }

        // 1. Przychód ogólny (z podziałem na tyg, msc, kwartał)
        String revenueByPeriodQuery = """
            SELECT 
                %s as period,
                COUNT(DISTINCT res.id) as reservation_count,
                SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) as total_revenue
            FROM 
                reservations res
                JOIN reservation_rooms rr ON res.id = rr.reservation_id
                JOIN rooms r ON rr.room_id = r.id
            WHERE 
                res.status != 'CANCELLED'
                AND res.start_date BETWEEN ? AND ?
            GROUP BY 
                %s
            ORDER BY 
                MIN(res.start_date) ASC
        """.formatted(dateFormat, groupBy);

        List<Map<String, Object>> revenueByPeriod = jdbcTemplate.queryForList(
                revenueByPeriodQuery,
                startDate, endDate
        );

        reportData.put("revenueByPeriod", revenueByPeriod);

        // 2. Korelacja obłożenia z przychodami
        String occupancyRevenueCorrelationQuery = """
            SELECT 
                %s as period,
                COUNT(DISTINCT res.id) as reservation_count,
                SUM(DATEDIFF(res.end_date, res.start_date)) as total_nights,
                COUNT(DISTINCT rr.room_id) as unique_rooms_used,
                SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) as total_revenue,
                ROUND(SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) / 
                      SUM(DATEDIFF(res.end_date, res.start_date)), 2) as avg_revenue_per_night,
                ROUND((COUNT(DISTINCT rr.room_id) / (SELECT COUNT(*) FROM rooms)) * 100, 2) as room_usage_percentage
            FROM 
                reservations res
                JOIN reservation_rooms rr ON res.id = rr.reservation_id
                JOIN rooms r ON rr.room_id = r.id
            WHERE 
                res.status != 'CANCELLED'
                AND res.start_date BETWEEN ? AND ?
            GROUP BY 
                %s
            ORDER BY 
                MIN(res.start_date) ASC
        """.formatted(dateFormat, groupBy);

        List<Map<String, Object>> occupancyRevenueCorrelation = jdbcTemplate.queryForList(
                occupancyRevenueCorrelationQuery,
                startDate, endDate
        );

        reportData.put("occupancyRevenueCorrelation", occupancyRevenueCorrelation);

        // 3. Statystyki generowania faktur
        String invoiceStatisticsQuery = """
            SELECT 
                COUNT(i.id) as total_invoices,
                COUNT(DISTINCT res.id) as total_reservations_with_invoices,
                (SELECT COUNT(*) FROM reservations WHERE status = 'COMPLETED' AND start_date BETWEEN ? AND ?) as total_completed_reservations,
                ROUND((COUNT(i.id) / (SELECT COUNT(*) FROM reservations WHERE status = 'COMPLETED' AND start_date BETWEEN ? AND ?)) * 100, 2) as invoice_coverage_percentage,
                COUNT(CASE WHEN i.company_name IS NOT NULL THEN 1 END) as company_invoices,
                COUNT(CASE WHEN i.company_name IS NULL THEN 1 END) as individual_invoices
            FROM 
                invoices i
                LEFT JOIN reservations res ON i.id = res.invoice_id
            WHERE 
                i.issue_date BETWEEN ? AND ?
        """;

        Map<String, Object> invoiceStatistics = jdbcTemplate.queryForMap(
                invoiceStatisticsQuery,
                startDate, endDate, startDate, endDate, startDate, endDate
        );

        reportData.put("invoiceStatistics", invoiceStatistics);

        // 4. Ogólne podsumowanie finansowe
        String financialSummaryQuery = """
            SELECT 
                COUNT(DISTINCT res.id) as total_completed_reservations,
                SUM(DATEDIFF(res.end_date, res.start_date)) as total_nights_sold,
                SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) as total_revenue,
                MAX(r.price_per_night) as highest_room_rate,
                MIN(r.price_per_night) as lowest_room_rate,
                AVG(r.price_per_night) as avg_room_rate,
                ROUND(SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) / 
                      SUM(DATEDIFF(res.end_date, res.start_date)), 2) as avg_daily_rate,
                SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) / 
                    DATEDIFF(?, ?) as avg_revenue_per_day_of_period
            FROM 
                reservations res
                JOIN reservation_rooms rr ON res.id = rr.reservation_id
                JOIN rooms r ON rr.room_id = r.id
            WHERE 
                res.status = 'COMPLETED'
                AND res.start_date BETWEEN ? AND ?
        """;

        Map<String, Object> financialSummary = jdbcTemplate.queryForMap(
                financialSummaryQuery,
                endDate, startDate, startDate, endDate
        );

        reportData.put("financialSummary", financialSummary);

        return reportData;
    }
}