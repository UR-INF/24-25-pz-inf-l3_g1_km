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
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StaffPerformanceReportServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private StaffPerformanceReportService staffPerformanceReportService;

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Map<String, Object>> sampleTasksByEmployee;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2025, 4, 1);
        endDate = LocalDate.of(2025, 5, 1);

        // Przygotowanie przykładowych danych
        sampleTasksByEmployee = new ArrayList<>();
        // Symulujemy dane, które mógłby zwrócić JdbcTemplate
        Map<String, Object> employee1 = Map.of(
                "employee_id", 1L,
                "employee_name", "Jan Kowalski",
                "role_name", "HOUSEKEEPER",
                "avatar_filename", "jan.jpg",
                "housekeeping_tasks", 15L,
                "maintenance_tasks", 0L,
                "total_tasks", 15L,
                "completed", 13L,
                "success_rate", 86.67,
                "avg_hours_to_complete", 1.5
        );

        Map<String, Object> employee2 = Map.of(
                "employee_id", 2L,
                "employee_name", "Anna Nowak",
                "role_name", "MAINTENANCE",
                "avatar_filename", "anna.jpg",
                "housekeeping_tasks", 0L,
                "maintenance_tasks", 10L,
                "total_tasks", 10L,
                "completed", 9L,
                "success_rate", 90.0,
                "avg_hours_to_complete", 3.2
        );

        sampleTasksByEmployee.add(employee1);
        sampleTasksByEmployee.add(employee2);
    }

    @Test
    void generateStaffPerformanceReport_ShouldReturnCorrectData() {
        // Given
        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(sampleTasksByEmployee);

        // When
        Map<String, Object> result = staffPerformanceReportService.generateStaffPerformanceReport(startDate, endDate);

        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("tasksByEmployee"));

        List<Map<String, Object>> tasksByEmployee = (List<Map<String, Object>>) result.get("tasksByEmployee");
        assertEquals(2, tasksByEmployee.size());

        // Sprawdzamy dane pierwszego pracownika
        Map<String, Object> firstEmployee = tasksByEmployee.get(0);
        assertEquals(1L, firstEmployee.get("employee_id"));
        assertEquals("Jan Kowalski", firstEmployee.get("employee_name"));
        assertEquals("HOUSEKEEPER", firstEmployee.get("role_name"));
        assertEquals(15L, firstEmployee.get("total_tasks"));
        assertEquals(86.67, firstEmployee.get("success_rate"));

        // Sprawdzamy dane drugiego pracownika
        Map<String, Object> secondEmployee = tasksByEmployee.get(1);
        assertEquals(2L, secondEmployee.get("employee_id"));
        assertEquals("Anna Nowak", secondEmployee.get("employee_name"));
        assertEquals("MAINTENANCE", secondEmployee.get("role_name"));
        assertEquals(10L, secondEmployee.get("total_tasks"));
        assertEquals(90.0, secondEmployee.get("success_rate"));
    }

    @Test
    void generateStaffPerformanceReport_WithEmptyData_ShouldReturnEmptyList() {
        // Given
        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate), eq(startDate), eq(endDate)
        )).thenReturn(new ArrayList<>());

        // When
        Map<String, Object> result = staffPerformanceReportService.generateStaffPerformanceReport(startDate, endDate);

        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("tasksByEmployee"));

        List<Map<String, Object>> tasksByEmployee = (List<Map<String, Object>>) result.get("tasksByEmployee");
        assertTrue(tasksByEmployee.isEmpty());
    }
}