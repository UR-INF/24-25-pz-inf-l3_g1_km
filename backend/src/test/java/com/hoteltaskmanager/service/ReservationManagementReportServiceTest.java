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
class ReservationManagementReportServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ReservationManagementReportService reservationManagementReportService;

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Map<String, Object>> sampleUpcomingCheckIns;
    private List<Map<String, Object>> sampleUpcomingCheckOuts;
    private List<Map<String, Object>> sampleRoomAvailabilityForecast;
    private Map<String, Object> sampleCancellationRate;
    private List<Map<String, Object>> sampleCancellationsByMonth;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2025, 4, 1);
        endDate = LocalDate.of(2025, 5, 1);

        // Przygotowanie danych dla nadchodzących zameldowań
        sampleUpcomingCheckIns = new ArrayList<>();
        Map<String, Object> checkIn1 = new HashMap<>();
        checkIn1.put("reservation_id", 101L);
        checkIn1.put("guest_first_name", "Jan");
        checkIn1.put("guest_last_name", "Kowalski");
        checkIn1.put("guest_phone", "+48123456789");
        checkIn1.put("check_in_date", LocalDate.now());
        checkIn1.put("check_out_date", LocalDate.now().plusDays(3));
        checkIn1.put("rooms", "101, 102");
        checkIn1.put("special_requests", "Łóżko dla dziecka");
        checkIn1.put("catering", "Tak");
        sampleUpcomingCheckIns.add(checkIn1);

        // Przygotowanie danych dla nadchodzących wymeldowań
        sampleUpcomingCheckOuts = new ArrayList<>();
        Map<String, Object> checkOut1 = new HashMap<>();
        checkOut1.put("reservation_id", 102L);
        checkOut1.put("guest_first_name", "Anna");
        checkOut1.put("guest_last_name", "Nowak");
        checkOut1.put("guest_phone", "+48987654321");
        checkOut1.put("check_in_date", LocalDate.now().minusDays(2));
        checkOut1.put("check_out_date", LocalDate.now().plusDays(1));
        checkOut1.put("rooms", "201");
        sampleUpcomingCheckOuts.add(checkOut1);

        // Przygotowanie danych dla prognozy dostępności pokojów
        sampleRoomAvailabilityForecast = new ArrayList<>();
        Map<String, Object> forecast1 = new HashMap<>();
        forecast1.put("date", LocalDate.now());
        forecast1.put("total_rooms", 25);
        forecast1.put("available_rooms", 15);
        forecast1.put("occupied_rooms", 10);
        forecast1.put("occupancy_rate", 40.0);
        sampleRoomAvailabilityForecast.add(forecast1);

        Map<String, Object> forecast2 = new HashMap<>();
        forecast2.put("date", LocalDate.now().plusDays(1));
        forecast2.put("total_rooms", 25);
        forecast2.put("available_rooms", 12);
        forecast2.put("occupied_rooms", 13);
        forecast2.put("occupancy_rate", 52.0);
        sampleRoomAvailabilityForecast.add(forecast2);

        // Przygotowanie danych dla wskaźnika anulowania
        sampleCancellationRate = new HashMap<>();
        sampleCancellationRate.put("total_reservations", 50);
        sampleCancellationRate.put("cancelled_reservations", 5);
        sampleCancellationRate.put("cancellation_rate", 10.0);

        // Przygotowanie danych dla anulowań wg miesiąca
        sampleCancellationsByMonth = new ArrayList<>();
        Map<String, Object> cancellation1 = new HashMap<>();
        cancellation1.put("month", "2025-04");
        cancellation1.put("total_reservations", 30);
        cancellation1.put("cancelled_reservations", 3);
        cancellation1.put("cancellation_rate", 10.0);
        sampleCancellationsByMonth.add(cancellation1);

        Map<String, Object> cancellation2 = new HashMap<>();
        cancellation2.put("month", "2025-05");
        cancellation2.put("total_reservations", 20);
        cancellation2.put("cancelled_reservations", 2);
        cancellation2.put("cancellation_rate", 10.0);
        sampleCancellationsByMonth.add(cancellation2);
    }

    @Test
    void generateReservationManagementReport_ShouldReturnCorrectData() {
        // Given
        when(jdbcTemplate.queryForList(any(String.class)))
                .thenReturn(sampleUpcomingCheckIns, sampleUpcomingCheckOuts, sampleRoomAvailabilityForecast);

        when(jdbcTemplate.queryForMap(any(String.class), eq(startDate), eq(endDate)))
                .thenReturn(sampleCancellationRate);

        when(jdbcTemplate.queryForList(any(String.class), eq(startDate), eq(endDate)))
                .thenReturn(sampleCancellationsByMonth);

        // When
        Map<String, Object> result = reservationManagementReportService.generateReservationManagementReport(startDate, endDate);

        // Then
        assertNotNull(result);

        assertTrue(result.containsKey("upcomingCheckIns"));
        List<Map<String, Object>> upcomingCheckIns = (List<Map<String, Object>>) result.get("upcomingCheckIns");
        assertEquals(1, upcomingCheckIns.size());
        assertEquals(101L, upcomingCheckIns.get(0).get("reservation_id"));
        assertEquals("Jan", upcomingCheckIns.get(0).get("guest_first_name"));
        assertEquals("Kowalski", upcomingCheckIns.get(0).get("guest_last_name"));
        assertEquals("Łóżko dla dziecka", upcomingCheckIns.get(0).get("special_requests"));

        assertTrue(result.containsKey("upcomingCheckOuts"));
        List<Map<String, Object>> upcomingCheckOuts = (List<Map<String, Object>>) result.get("upcomingCheckOuts");
        assertEquals(1, upcomingCheckOuts.size());
        assertEquals(102L, upcomingCheckOuts.get(0).get("reservation_id"));
        assertEquals("Anna", upcomingCheckOuts.get(0).get("guest_first_name"));
        assertEquals("201", upcomingCheckOuts.get(0).get("rooms"));

        assertTrue(result.containsKey("roomAvailabilityForecast"));
        List<Map<String, Object>> roomAvailabilityForecast = (List<Map<String, Object>>) result.get("roomAvailabilityForecast");
        assertEquals(2, roomAvailabilityForecast.size());
        assertEquals(25, roomAvailabilityForecast.get(0).get("total_rooms"));
        assertEquals(15, roomAvailabilityForecast.get(0).get("available_rooms"));
        assertEquals(40.0, roomAvailabilityForecast.get(0).get("occupancy_rate"));

        assertTrue(result.containsKey("cancellationRate"));
        Map<String, Object> cancellationRate = (Map<String, Object>) result.get("cancellationRate");
        assertEquals(50, cancellationRate.get("total_reservations"));
        assertEquals(5, cancellationRate.get("cancelled_reservations"));
        assertEquals(10.0, cancellationRate.get("cancellation_rate"));

        assertTrue(result.containsKey("cancellationsByMonth"));
        List<Map<String, Object>> cancellationsByMonth = (List<Map<String, Object>>) result.get("cancellationsByMonth");
        assertEquals(2, cancellationsByMonth.size());
        assertEquals("2025-04", cancellationsByMonth.get(0).get("month"));
        assertEquals(30, cancellationsByMonth.get(0).get("total_reservations"));
        assertEquals(3, cancellationsByMonth.get(0).get("cancelled_reservations"));
    }

    @Test
    void generateReservationManagementReport_WithEmptyData_ShouldHandleGracefully() {
        // Given
        when(jdbcTemplate.queryForList(any(String.class)))
                .thenReturn(new ArrayList<>(), new ArrayList<>(), new ArrayList<>());

        Map<String, Object> emptyCancellationRate = new HashMap<>();
        emptyCancellationRate.put("total_reservations", 0);
        emptyCancellationRate.put("cancelled_reservations", 0);
        emptyCancellationRate.put("cancellation_rate", 0.0);

        when(jdbcTemplate.queryForMap(any(String.class), eq(startDate), eq(endDate)))
                .thenReturn(emptyCancellationRate);

        when(jdbcTemplate.queryForList(any(String.class), eq(startDate), eq(endDate)))
                .thenReturn(new ArrayList<>());

        // When
        Map<String, Object> result = reservationManagementReportService.generateReservationManagementReport(startDate, endDate);

        // Then
        assertNotNull(result);

        // Sprawdzenie czy raport zawiera puste listy i wartości zerowe
        assertTrue(result.containsKey("upcomingCheckIns"));
        List<Map<String, Object>> upcomingCheckIns = (List<Map<String, Object>>) result.get("upcomingCheckIns");
        assertTrue(upcomingCheckIns.isEmpty());

        assertTrue(result.containsKey("upcomingCheckOuts"));
        List<Map<String, Object>> upcomingCheckOuts = (List<Map<String, Object>>) result.get("upcomingCheckOuts");
        assertTrue(upcomingCheckOuts.isEmpty());

        assertTrue(result.containsKey("roomAvailabilityForecast"));
        List<Map<String, Object>> roomAvailabilityForecast = (List<Map<String, Object>>) result.get("roomAvailabilityForecast");
        assertTrue(roomAvailabilityForecast.isEmpty());

        assertTrue(result.containsKey("cancellationRate"));
        Map<String, Object> cancellationRate = (Map<String, Object>) result.get("cancellationRate");
        assertEquals(0, cancellationRate.get("total_reservations"));
        assertEquals(0, cancellationRate.get("cancelled_reservations"));
        assertEquals(0.0, cancellationRate.get("cancellation_rate"));

        assertTrue(result.containsKey("cancellationsByMonth"));
        List<Map<String, Object>> cancellationsByMonth = (List<Map<String, Object>>) result.get("cancellationsByMonth");
        assertTrue(cancellationsByMonth.isEmpty());
    }
}