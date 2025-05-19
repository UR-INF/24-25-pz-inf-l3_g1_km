package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serwis generujący raporty zarządzania rezerwacjami w hotelu.
 * Zawiera dane o zameldowaniach, wymeldowaniach, dostępności pokoi oraz wskaźnikach anulowania rezerwacji.
 */
@Service
public class ReservationManagementReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generuje kompleksowy raport dotyczący zarządzania rezerwacjami w danym przedziale czasowym.
     * Raport zawiera dane o nadchodzących zameldowaniach i wymeldowaniach, prognozę dostępności pokoi,
     * oraz analizę wskaźnika anulowania rezerwacji.
     *
     * @param startDate data początkowa zakresu analizowanego raportu (dot. anulowań)
     * @param endDate   data końcowa zakresu analizowanego raportu (dot. anulowań)
     * @return mapa zawierająca dane raportowe z kluczami:
     *         <ul>
     *             <li><b>upcomingCheckIns</b> - lista rezerwacji z zameldowaniami w ciągu 7 dni</li>
     *             <li><b>upcomingCheckOuts</b> - lista rezerwacji z wymeldowaniami w ciągu 7 dni</li>
     *             <li><b>roomAvailabilityForecast</b> - prognoza dostępności pokoi na 30 dni</li>
     *             <li><b>cancellationRate</b> - ogólny wskaźnik anulowań w danym zakresie</li>
     *             <li><b>cancellationsByMonth</b> - miesięczna statystyka anulowań</li>
     *         </ul>
     */
    public Map<String, Object> generateReservationManagementReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> reportData = new HashMap<>();

        // 1. Nadchodzące zameldowania/wymeldowania
        String upcomingCheckInsQuery = """
            SELECT 
                r.id as reservation_id,
                r.guest_first_name,
                r.guest_last_name,
                r.guest_phone,
                r.start_date as check_in_date,
                r.end_date as check_out_date,
                GROUP_CONCAT(rm.room_number) as rooms,
                r.special_requests,
                CASE WHEN r.catering = 1 THEN 'Tak' ELSE 'Nie' END as catering
            FROM 
                reservations r
                JOIN reservation_rooms rr ON r.id = rr.reservation_id
                JOIN rooms rm ON rr.room_id = rm.id
            WHERE 
                r.status = 'ACTIVE'
                AND r.start_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
            GROUP BY 
                r.id, r.guest_first_name, r.guest_last_name, r.guest_phone, r.start_date, r.end_date, r.special_requests, r.catering
            ORDER BY 
                r.start_date ASC
        """;

        List<Map<String, Object>> upcomingCheckIns = jdbcTemplate.queryForList(upcomingCheckInsQuery);
        reportData.put("upcomingCheckIns", upcomingCheckIns);

        String upcomingCheckOutsQuery = """
            SELECT 
                r.id as reservation_id,
                r.guest_first_name,
                r.guest_last_name,
                r.guest_phone,
                r.start_date as check_in_date,
                r.end_date as check_out_date,
                GROUP_CONCAT(rm.room_number) as rooms
            FROM 
                reservations r
                JOIN reservation_rooms rr ON r.id = rr.reservation_id
                JOIN rooms rm ON rr.room_id = rm.id
            WHERE 
                r.status = 'ACTIVE'
                AND r.end_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
            GROUP BY 
                r.id, r.guest_first_name, r.guest_last_name, r.guest_phone, r.start_date, r.end_date
            ORDER BY 
                r.end_date ASC
        """;

        List<Map<String, Object>> upcomingCheckOuts = jdbcTemplate.queryForList(upcomingCheckOutsQuery);
        reportData.put("upcomingCheckOuts", upcomingCheckOuts);

        // 2. Prognozowanie dostępności pokojów
        String roomAvailabilityForecastQuery = """
            SELECT 
                d.date,
                COUNT(r.id) as total_rooms,
                COUNT(r.id) - COUNT(rr.reservation_id) as available_rooms,
                COUNT(rr.reservation_id) as occupied_rooms,
                ROUND((COUNT(rr.reservation_id) / COUNT(r.id)) * 100, 2) as occupancy_rate
            FROM 
                (
                    SELECT ADDDATE('2023-01-01', t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) as date
                    FROM 
                        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t0,
                        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
                        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
                        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
                        (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t4
                ) d
                CROSS JOIN rooms r
                LEFT JOIN reservation_rooms rr ON r.id = rr.room_id
                LEFT JOIN reservations res ON rr.reservation_id = res.id 
                    AND res.status = 'ACTIVE'
                    AND d.date BETWEEN res.start_date AND DATE_SUB(res.end_date, INTERVAL 1 DAY)
            WHERE 
                d.date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)
                AND r.status != 'OUT_OF_SERVICE'
            GROUP BY 
                d.date
            ORDER BY 
                d.date ASC
        """;

        List<Map<String, Object>> roomAvailabilityForecast = jdbcTemplate.queryForList(roomAvailabilityForecastQuery);
        reportData.put("roomAvailabilityForecast", roomAvailabilityForecast);

        // 3. Analiza wskaźnika anulowania
        String cancellationRateQuery = """
            SELECT 
                COUNT(*) as total_reservations,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_reservations,
                ROUND((SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as cancellation_rate
            FROM 
                reservations
            WHERE 
                start_date BETWEEN ? AND ?
        """;

        Map<String, Object> cancellationRate = jdbcTemplate.queryForMap(
                cancellationRateQuery,
                startDate, endDate
        );

        reportData.put("cancellationRate", cancellationRate);

        String cancellationsByMonthQuery = """
            SELECT 
                DATE_FORMAT(start_date, '%Y-%m') as month,
                COUNT(*) as total_reservations,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_reservations,
                ROUND((SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as cancellation_rate
            FROM 
                reservations
            WHERE 
                start_date BETWEEN ? AND ?
            GROUP BY 
                DATE_FORMAT(start_date, '%Y-%m')
            ORDER BY 
                month ASC
        """;

        List<Map<String, Object>> cancellationsByMonth = jdbcTemplate.queryForList(
                cancellationsByMonthQuery,
                startDate, endDate
        );

        reportData.put("cancellationsByMonth", cancellationsByMonth);

        return reportData;
    }
}