package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serwis odpowiedzialny za generowanie raportów dotyczących usterek technicznych
 * oraz efektywności ich rozwiązywania w obiekcie hotelowym.
 */
@Service
public class MaintenanceIssuesReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generuje raport dotyczący usterek konserwacyjnych w określonym przedziale czasowym.
     *
     * Raport zawiera:
     * <ul>
     *     <li>Statystyki czasu rozwiązywania usterek</li>
     *     <li>Częstotliwość występowania usterek według pokoju</li>
     *     <li>Częstotliwość występowania usterek według piętra</li>
     * </ul>
     *
     * @param startDate data początkowa zakresu raportu
     * @param endDate   data końcowa zakresu raportu
     * @return mapa zawierająca dane raportowe
     */
    public Map<String, Object> generateMaintenanceIssuesReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> reportData = new HashMap<>();

        // 1. Średni czas rozwiązywania zadań konserwacyjnych09.
        String avgResolutionTimeQuery = """
            SELECT 
                AVG(TIMESTAMPDIFF(HOUR, request_date, completion_date)) as avg_hours_to_complete,
                MIN(TIMESTAMPDIFF(HOUR, request_date, completion_date)) as min_hours_to_complete,
                MAX(TIMESTAMPDIFF(HOUR, request_date, completion_date)) as max_hours_to_complete
            FROM 
                maintenance_requests
            WHERE 
                completion_date IS NOT NULL
                AND request_date BETWEEN ? AND ?
        """;

        Map<String, Object> avgResolutionTime = jdbcTemplate.queryForMap(
                avgResolutionTimeQuery,
                startDate, endDate
        );

        reportData.put("avgResolutionTime", avgResolutionTime);

        // 2. Częstotliwość występowania problemów według pokoju/piętra
        String issuesByRoomQuery = """
            SELECT 
                r.id as room_id,
                r.room_number,
                r.floor,
                COUNT(m.id) as issue_count
            FROM 
                rooms r
                LEFT JOIN maintenance_requests m ON r.id = m.room_id
            WHERE 
                m.request_date BETWEEN ? AND ?
            GROUP BY 
                r.id, r.room_number, r.floor
            ORDER BY 
                issue_count DESC
        """;

        List<Map<String, Object>> issuesByRoom = jdbcTemplate.queryForList(
                issuesByRoomQuery,
                startDate, endDate
        );

        reportData.put("issuesByRoom", issuesByRoom);

        String issuesByFloorQuery = """
            SELECT 
                r.floor,
                COUNT(m.id) as issue_count,
                COUNT(DISTINCT r.id) as room_count,
                ROUND(COUNT(m.id) / COUNT(DISTINCT r.id), 2) as issues_per_room
            FROM 
                rooms r
                LEFT JOIN maintenance_requests m ON r.id = m.room_id
            WHERE 
                m.request_date BETWEEN ? AND ?
            GROUP BY 
                r.floor
            ORDER BY 
                issues_per_room DESC
        """;

        List<Map<String, Object>> issuesByFloor = jdbcTemplate.queryForList(
                issuesByFloorQuery,
                startDate, endDate
        );

        reportData.put("issuesByFloor", issuesByFloor);

        return reportData;
    }
}