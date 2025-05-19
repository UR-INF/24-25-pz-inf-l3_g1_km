package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serwis odpowiedzialny za generowanie raportów efektywności zespołu sprzątającego.
 * Raport analizuje wykonanie zadań porządkowych przez pracowników w wybranym zakresie dat.
 */
@Service
public class HousekeepingEfficiencyReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generuje raport efektywności zespołu sprzątającego w wybranym przedziale dat.
     *
     * Raport zawiera:
     * <ul>
     *     <li>Statystyki wykonania zadań porządkowych według pracownika (ilość, statusy, czas realizacji)</li>
     *     <li>Listę odrzuconych zadań z szczegółami</li>
     *     <li>Ogólną analizę procentową odrzuceń</li>
     * </ul>
     *
     * @param startDate data początkowa analizowanego okresu
     * @param endDate   data końcowa analizowanego okresu
     * @return mapa zawierająca sekcje raportu efektywności
     */
    public Map<String, Object> generateHousekeepingEfficiencyReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> reportData = new HashMap<>();

        // 1. Wskaźniki realizacji zadań według pracownika
        String taskCompletionRateQuery = """
            SELECT 
                e.id as employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                COUNT(h.id) as total_assigned,
                SUM(CASE WHEN h.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN h.status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN h.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN h.status = 'DECLINED' THEN 1 ELSE 0 END) as declined,
                ROUND((SUM(CASE WHEN h.status = 'COMPLETED' THEN 1 ELSE 0 END) / COUNT(h.id)) * 100, 2) as completion_rate,
                AVG(TIMESTAMPDIFF(MINUTE, h.request_date, h.completion_date)) as avg_completion_time_minutes
            FROM 
                employee e
                JOIN housekeeping_tasks h ON e.id = h.employee_id
            WHERE 
                h.request_date BETWEEN ? AND ?
            GROUP BY 
                e.id, e.first_name, e.last_name
            ORDER BY 
                completion_rate DESC
        """;

        List<Map<String, Object>> taskCompletionRate = jdbcTemplate.queryForList(
                taskCompletionRateQuery,
                startDate, endDate
        );

        reportData.put("taskCompletionRate", taskCompletionRate);

        // 2. Analiza odrzuconych zadań
        String declinedTasksQuery = """
            SELECT 
                h.id as task_id,
                r.room_number,
                h.description,
                h.request_date,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name
            FROM 
                housekeeping_tasks h
                JOIN employee e ON h.employee_id = e.id
                JOIN rooms r ON h.room_id = r.id
            WHERE 
                h.status = 'DECLINED'
                AND h.request_date BETWEEN ? AND ?
            ORDER BY 
                h.request_date DESC
        """;

        List<Map<String, Object>> declinedTasks = jdbcTemplate.queryForList(
                declinedTasksQuery,
                startDate, endDate
        );

        reportData.put("declinedTasks", declinedTasks);

        String declinedTasksAnalysisQuery = """
            SELECT 
                COUNT(*) as total_declined,
                ROUND((COUNT(*) / (SELECT COUNT(*) FROM housekeeping_tasks 
                    WHERE request_date BETWEEN ? AND ?)) * 100, 2) as decline_percentage
            FROM 
                housekeeping_tasks
            WHERE 
                status = 'DECLINED'
                AND request_date BETWEEN ? AND ?
        """;

        Map<String, Object> declinedTasksAnalysis = jdbcTemplate.queryForMap(
                declinedTasksAnalysisQuery,
                startDate, endDate, startDate, endDate
        );

        reportData.put("declinedTasksAnalysis", declinedTasksAnalysis);

        return reportData;
    }
}