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
class HousekeepingEfficiencyReportServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private HousekeepingEfficiencyReportService housekeepingEfficiencyReportService;

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Map<String, Object>> sampleTaskCompletionRate;
    private List<Map<String, Object>> sampleDeclinedTasks;
    private Map<String, Object> sampleDeclinedTasksAnalysis;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2025, 4, 1);
        endDate = LocalDate.of(2025, 5, 1);

        // Przygotowanie danych wskaźników realizacji zadań
        sampleTaskCompletionRate = new ArrayList<>();
        Map<String, Object> taskData1 = new HashMap<>();
        taskData1.put("employee_id", 1L);
        taskData1.put("employee_name", "Anna Nowak");
        taskData1.put("total_assigned", 15);
        taskData1.put("completed", 14);
        taskData1.put("pending", 0);
        taskData1.put("in_progress", 0);
        taskData1.put("declined", 1);
        taskData1.put("completion_rate", 93.33);
        taskData1.put("avg_completion_time_minutes", 45);
        sampleTaskCompletionRate.add(taskData1);

        Map<String, Object> taskData2 = new HashMap<>();
        taskData2.put("employee_id", 2L);
        taskData2.put("employee_name", "Jan Kowalski");
        taskData2.put("total_assigned", 20);
        taskData2.put("completed", 18);
        taskData2.put("pending", 1);
        taskData2.put("in_progress", 1);
        taskData2.put("declined", 0);
        taskData2.put("completion_rate", 90.00);
        taskData2.put("avg_completion_time_minutes", 50);
        sampleTaskCompletionRate.add(taskData2);

        // Przygotowanie danych odrzuconych zadań
        sampleDeclinedTasks = new ArrayList<>();
        Map<String, Object> declinedTask1 = new HashMap<>();
        declinedTask1.put("task_id", 101L);
        declinedTask1.put("room_number", "201");
        declinedTask1.put("description", "Specjalne sprzątanie po check-out");
        declinedTask1.put("request_date", "2025-04-15T10:30:00");
        declinedTask1.put("employee_name", "Anna Nowak");
        sampleDeclinedTasks.add(declinedTask1);

        // Przygotowanie danych analizy odrzuconych zadań
        sampleDeclinedTasksAnalysis = new HashMap<>();
        sampleDeclinedTasksAnalysis.put("total_declined", 1);
        sampleDeclinedTasksAnalysis.put("decline_percentage", 2.86);
    }

    @Test
    void shouldGenerateHousekeepingEfficiencyReport() {
        // Konfiguracja zachowania mocków
        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(sampleTaskCompletionRate, sampleDeclinedTasks);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(sampleDeclinedTasksAnalysis);

        // Wywołanie testowanej metody
        Map<String, Object> report = housekeepingEfficiencyReportService.generateHousekeepingEfficiencyReport(startDate, endDate);

        // Weryfikacja wyników
        assertNotNull(report);

        // Sprawdzenie wskaźników realizacji zadań
        List<Map<String, Object>> taskCompletionRate = (List<Map<String, Object>>) report.get("taskCompletionRate");
        assertNotNull(taskCompletionRate);
        assertEquals(2, taskCompletionRate.size());

        Map<String, Object> firstEmployee = taskCompletionRate.get(0);
        assertEquals("Anna Nowak", firstEmployee.get("employee_name"));
        assertEquals(15, firstEmployee.get("total_assigned"));
        assertEquals(14, firstEmployee.get("completed"));
        assertEquals(93.33, firstEmployee.get("completion_rate"));
        assertEquals(45, firstEmployee.get("avg_completion_time_minutes"));

        Map<String, Object> secondEmployee = taskCompletionRate.get(1);
        assertEquals("Jan Kowalski", secondEmployee.get("employee_name"));
        assertEquals(20, secondEmployee.get("total_assigned"));
        assertEquals(18, secondEmployee.get("completed"));
        assertEquals(90.00, secondEmployee.get("completion_rate"));

        // Sprawdzenie odrzuconych zadań
        List<Map<String, Object>> declinedTasks = (List<Map<String, Object>>) report.get("declinedTasks");
        assertNotNull(declinedTasks);
        assertEquals(1, declinedTasks.size());

        Map<String, Object> declinedTask = declinedTasks.get(0);
        assertEquals(101L, declinedTask.get("task_id"));
        assertEquals("201", declinedTask.get("room_number"));
        assertEquals("Specjalne sprzątanie po check-out", declinedTask.get("description"));
        assertEquals("Anna Nowak", declinedTask.get("employee_name"));

        // Sprawdzenie analizy odrzuconych zadań
        Map<String, Object> declinedTasksAnalysis = (Map<String, Object>) report.get("declinedTasksAnalysis");
        assertNotNull(declinedTasksAnalysis);
        assertEquals(1, declinedTasksAnalysis.get("total_declined"));
        assertEquals(2.86, declinedTasksAnalysis.get("decline_percentage"));
    }

    @Test
    void shouldHandleEmptyResults() {
        // Konfiguracja zachowania mocków dla pustych wyników
        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(new ArrayList<>(), new ArrayList<>());

        Map<String, Object> emptyAnalysis = new HashMap<>();
        emptyAnalysis.put("total_declined", 0);
        emptyAnalysis.put("decline_percentage", 0.0);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(emptyAnalysis);

        // Wywołanie testowanej metody
        Map<String, Object> report = housekeepingEfficiencyReportService.generateHousekeepingEfficiencyReport(startDate, endDate);

        // Weryfikacja wyników
        assertNotNull(report);

        List<Map<String, Object>> taskCompletionRate = (List<Map<String, Object>>) report.get("taskCompletionRate");
        assertNotNull(taskCompletionRate);
        assertTrue(taskCompletionRate.isEmpty());

        List<Map<String, Object>> declinedTasks = (List<Map<String, Object>>) report.get("declinedTasks");
        assertNotNull(declinedTasks);
        assertTrue(declinedTasks.isEmpty());

        Map<String, Object> declinedTasksAnalysis = (Map<String, Object>) report.get("declinedTasksAnalysis");
        assertNotNull(declinedTasksAnalysis);
        assertEquals(0, declinedTasksAnalysis.get("total_declined"));
        assertEquals(0.0, declinedTasksAnalysis.get("decline_percentage"));
    }
}