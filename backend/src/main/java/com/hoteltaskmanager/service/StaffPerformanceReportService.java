package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serwis odpowiedzialny za generowanie raportu wydajności pracowników hotelu.
 * Raport zawiera dane o liczbie zadań zrealizowanych przez pracowników,
 * wskaźnikach sukcesu oraz średnim czasie realizacji zadań.
 */
@Service
public class StaffPerformanceReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generuje raport wydajności pracowników dla zadanego zakresu dat.
     * Raport obejmuje:
     * <ul>
     *   <li>identyfikator i imię i nazwisko pracownika</li>
     *   <li>nazwę roli pracownika</li>
     *   <li>liczbę zadań sprzątania i konserwacji przypisanych do pracownika</li>
     *   <li>sumaryczną liczbę zadań i liczbę ukończonych zadań</li>
     *   <li>procentowy wskaźnik ukończenia zadań (success rate)</li>
     *   <li>średni czas realizacji zadań wyrażony w godzinach</li>
     * </ul>
     *
     * @param startDate data początkowa zakresu raportu (włącznie)
     * @param endDate data końcowa zakresu raportu (włącznie)
     * @return mapa z danymi raportu, gdzie kluczem jest "tasksByEmployee", a wartością lista map z danymi poszczególnych pracowników
     */
    public Map<String, Object> generateStaffPerformanceReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> reportData = new HashMap<>();

        String staffPerformanceQuery = """
            SELECT 
                e.id as employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                r.name as role_name,
                e.avatar_filename as avatar_filename,
                COUNT(h.id) as housekeeping_tasks,
                COUNT(m.id) as maintenance_tasks,
                COUNT(h.id) + COUNT(m.id) as total_tasks,
                SUM(CASE WHEN h.status = 'COMPLETED' OR m.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                ROUND((SUM(CASE WHEN h.status = 'COMPLETED' OR m.status = 'COMPLETED' THEN 1 ELSE 0 END) / 
                      (COUNT(h.id) + COUNT(m.id))) * 100, 2) as success_rate,
                AVG(TIMESTAMPDIFF(HOUR, 
                    COALESCE(h.request_date, m.request_date), 
                    COALESCE(h.completion_date, m.completion_date)
                )) as avg_hours_to_complete
            FROM 
                employee e
                LEFT JOIN roles r ON e.role_id = r.id
                LEFT JOIN housekeeping_tasks h ON e.id = h.employee_id
                LEFT JOIN maintenance_requests m ON e.id = m.assignee_id
            WHERE 
                (h.request_date BETWEEN ? AND ? OR m.request_date BETWEEN ? AND ?)
            GROUP BY 
                e.id, e.first_name, e.last_name, r.name, e.avatar_filename
            HAVING 
                (COUNT(h.id) + COUNT(m.id)) > 0
            ORDER BY 
                (COUNT(h.id) + COUNT(m.id)) DESC
        """;

        List<Map<String, Object>> staffPerformance = jdbcTemplate.queryForList(
                staffPerformanceQuery,
                startDate, endDate, startDate, endDate
        );

        reportData.put("tasksByEmployee", staffPerformance);

        return reportData;
    }
}