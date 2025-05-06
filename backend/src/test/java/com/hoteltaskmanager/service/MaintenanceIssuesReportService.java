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
class MaintenanceIssuesReportServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private MaintenanceIssuesReportService maintenanceIssuesReportService;

    private LocalDate startDate;
    private LocalDate endDate;
    private Map<String, Object> sampleAvgResolutionTime;
    private List<Map<String, Object>> sampleIssuesByRoom;
    private List<Map<String, Object>> sampleIssuesByFloor;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2025, 4, 1);
        endDate = LocalDate.of(2025, 5, 1);

        // Przygotowanie danych dla średniego czasu rozwiązywania
        sampleAvgResolutionTime = new HashMap<>();
        sampleAvgResolutionTime.put("avg_hours_to_complete", 5.5);
        sampleAvgResolutionTime.put("min_hours_to_complete", 1.0);
        sampleAvgResolutionTime.put("max_hours_to_complete", 24.0);

        // Przygotowanie danych dla problemów wg pokoi
        sampleIssuesByRoom = new ArrayList<>();
        Map<String, Object> room1 = new HashMap<>();
        room1.put("room_id", 1L);
        room1.put("room_number", "101");
        room1.put("floor", 1);
        room1.put("issue_count", 3);
        sampleIssuesByRoom.add(room1);

        Map<String, Object> room2 = new HashMap<>();
        room2.put("room_id", 2L);
        room2.put("room_number", "102");
        room2.put("floor", 1);
        room2.put("issue_count", 2);
        sampleIssuesByRoom.add(room2);

        // Przygotowanie danych dla problemów wg pięter
        sampleIssuesByFloor = new ArrayList<>();
        Map<String, Object> floor1 = new HashMap<>();
        floor1.put("floor", 1);
        floor1.put("issue_count", 5);
        floor1.put("room_count", 10);
        floor1.put("issues_per_room", 0.5);
        sampleIssuesByFloor.add(floor1);

        Map<String, Object> floor2 = new HashMap<>();
        floor2.put("floor", 2);
        floor2.put("issue_count", 3);
        floor2.put("room_count", 8);
        floor2.put("issues_per_room", 0.38);
        sampleIssuesByFloor.add(floor2);
    }

    @Test
    void generateMaintenanceIssuesReport_ShouldReturnCorrectData() {
        // Given
        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(sampleAvgResolutionTime);

        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(sampleIssuesByRoom, sampleIssuesByFloor);

        // When
        Map<String, Object> result = maintenanceIssuesReportService.generateMaintenanceIssuesReport(startDate, endDate);

        // Then
        assertNotNull(result);

        // Sprawdzamy sekcję średniego czasu rozwiązywania
        assertTrue(result.containsKey("avgResolutionTime"));
        Map<String, Object> avgResolutionTime = (Map<String, Object>) result.get("avgResolutionTime");
        assertEquals(5.5, avgResolutionTime.get("avg_hours_to_complete"));
        assertEquals(1.0, avgResolutionTime.get("min_hours_to_complete"));
        assertEquals(24.0, avgResolutionTime.get("max_hours_to_complete"));

        // Sprawdzamy sekcję problemów wg pokoi
        assertTrue(result.containsKey("issuesByRoom"));
        List<Map<String, Object>> issuesByRoom = (List<Map<String, Object>>) result.get("issuesByRoom");
        assertEquals(2, issuesByRoom.size());
        assertEquals(1L, issuesByRoom.get(0).get("room_id"));
        assertEquals("101", issuesByRoom.get(0).get("room_number"));
        assertEquals(3, issuesByRoom.get(0).get("issue_count"));

        // Sprawdzamy sekcję problemów wg pięter
        assertTrue(result.containsKey("issuesByFloor"));
        List<Map<String, Object>> issuesByFloor = (List<Map<String, Object>>) result.get("issuesByFloor");
        assertEquals(2, issuesByFloor.size());
        assertEquals(1, issuesByFloor.get(0).get("floor"));
        assertEquals(5, issuesByFloor.get(0).get("issue_count"));
        assertEquals(0.5, issuesByFloor.get(0).get("issues_per_room"));
    }

    @Test
    void generateMaintenanceIssuesReport_WithEmptyData_ShouldHandleGracefully() {
        // Given
        Map<String, Object> emptyAvgResolutionTime = new HashMap<>();
        emptyAvgResolutionTime.put("avg_hours_to_complete", null);
        emptyAvgResolutionTime.put("min_hours_to_complete", null);
        emptyAvgResolutionTime.put("max_hours_to_complete", null);

        when(jdbcTemplate.queryForMap(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(emptyAvgResolutionTime);

        when(jdbcTemplate.queryForList(
                any(String.class),
                eq(startDate), eq(endDate)
        )).thenReturn(new ArrayList<>(), new ArrayList<>());

        // When
        Map<String, Object> result = maintenanceIssuesReportService.generateMaintenanceIssuesReport(startDate, endDate);

        // Then
        assertNotNull(result);

        assertTrue(result.containsKey("avgResolutionTime"));
        Map<String, Object> avgResolutionTime = (Map<String, Object>) result.get("avgResolutionTime");
        assertNull(avgResolutionTime.get("avg_hours_to_complete"));

        assertTrue(result.containsKey("issuesByRoom"));
        List<Map<String, Object>> issuesByRoom = (List<Map<String, Object>>) result.get("issuesByRoom");
        assertTrue(issuesByRoom.isEmpty());

        assertTrue(result.containsKey("issuesByFloor"));
        List<Map<String, Object>> issuesByFloor = (List<Map<String, Object>>) result.get("issuesByFloor");
        assertTrue(issuesByFloor.isEmpty());
    }
}