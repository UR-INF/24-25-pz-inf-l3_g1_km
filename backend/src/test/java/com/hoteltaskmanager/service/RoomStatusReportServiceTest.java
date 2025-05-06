package com.hoteltaskmanager.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla {@link RoomStatusReportService}.
 * <p>
 * Testy sprawdzają poprawność generowania raportu o statusach pokoi,
 * zawierającego statystyki zajętości, informacje o pokojach wymagających konserwacji
 * oraz dane o przychodach w przeliczeniu na pokój.
 * <p>
 * Testy obejmują sprawdzenie:
 * <ul>
 *     <li>Generowania kompletnego raportu zawierającego wszystkie wymagane sekcje</li>
 *     <li>Poprawności danych statystycznych o statusach pokoi</li>
 *     <li>Poprawności danych o pokojach wymagających konserwacji</li>
 *     <li>Poprawności danych o przychodach generowanych przez poszczególne pokoje</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class RoomStatusReportServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private RoomStatusReportService roomStatusReportService;

    private List<Map<String, Object>> mockRoomStatusData;
    private List<Map<String, Object>> mockRoomsNeedingMaintenanceData;
    private List<Map<String, Object>> mockRevenuePerRoomData;

    /**
     * Przygotowanie danych testowych przed każdym testem.
     * <p>
     * Tworzy przykładowe dane, które będą zwracane przez zamockowany JdbcTemplate
     * podczas wykonywania zapytań SQL:
     * <ul>
     *     <li>Dane statystyczne o statusach pokoi (dostępne, zajęte, wyłączone z użytku)</li>
     *     <li>Dane o pokojach wymagających konserwacji wraz ze szczegółami zgłoszeń</li>
     *     <li>Dane o przychodach generowanych przez poszczególne pokoje</li>
     * </ul>
     */
    @BeforeEach
    void setUp() {
        Map<String, Object> availableRooms = new HashMap<>();
        availableRooms.put("status", "AVAILABLE");
        availableRooms.put("count", 10);
        availableRooms.put("percentage", 50.00);

        Map<String, Object> occupiedRooms = new HashMap<>();
        occupiedRooms.put("status", "OCCUPIED");
        occupiedRooms.put("count", 8);
        occupiedRooms.put("percentage", 40.00);

        Map<String, Object> outOfServiceRooms = new HashMap<>();
        outOfServiceRooms.put("status", "OUT_OF_SERVICE");
        outOfServiceRooms.put("count", 2);
        outOfServiceRooms.put("percentage", 10.00);

        mockRoomStatusData = List.of(availableRooms, occupiedRooms, outOfServiceRooms);

        Map<String, Object> maintenanceRoom1 = new HashMap<>();
        maintenanceRoom1.put("room_id", 1);
        maintenanceRoom1.put("room_number", "101");
        maintenanceRoom1.put("floor", 1);
        maintenanceRoom1.put("status", "OUT_OF_SERVICE");
        maintenanceRoom1.put("maintenance_request_id", 101);
        maintenanceRoom1.put("maintenance_issue", "Zepsuty kran");
        maintenanceRoom1.put("request_date", Date.valueOf(LocalDate.now().minusDays(2)));
        maintenanceRoom1.put("maintenance_status", "IN_PROGRESS");
        maintenanceRoom1.put("assignee", "Jan Kowalski");

        Map<String, Object> maintenanceRoom2 = new HashMap<>();
        maintenanceRoom2.put("room_id", 2);
        maintenanceRoom2.put("room_number", "102");
        maintenanceRoom2.put("floor", 1);
        maintenanceRoom2.put("status", "OUT_OF_SERVICE");
        maintenanceRoom2.put("maintenance_request_id", 102);
        maintenanceRoom2.put("maintenance_issue", "Uszkodzona klimatyzacja");
        maintenanceRoom2.put("request_date", Date.valueOf(LocalDate.now().minusDays(1)));
        maintenanceRoom2.put("maintenance_status", "PENDING");
        maintenanceRoom2.put("assignee", null);

        mockRoomsNeedingMaintenanceData = List.of(maintenanceRoom1, maintenanceRoom2);

        Map<String, Object> revenueRoom1 = new HashMap<>();
        revenueRoom1.put("room_id", 3);
        revenueRoom1.put("room_number", "201");
        revenueRoom1.put("floor", 2);
        revenueRoom1.put("bed_count", 2);
        revenueRoom1.put("price_per_night", BigDecimal.valueOf(200.00));
        revenueRoom1.put("total_reservations", 10);
        revenueRoom1.put("days_occupied", 30);
        revenueRoom1.put("total_revenue", BigDecimal.valueOf(6000.00));
        revenueRoom1.put("revenue_per_day", BigDecimal.valueOf(200.00));

        Map<String, Object> revenueRoom2 = new HashMap<>();
        revenueRoom2.put("room_id", 4);
        revenueRoom2.put("room_number", "202");
        revenueRoom2.put("floor", 2);
        revenueRoom2.put("bed_count", 1);
        revenueRoom2.put("price_per_night", BigDecimal.valueOf(150.00));
        revenueRoom2.put("total_reservations", 8);
        revenueRoom2.put("days_occupied", 20);
        revenueRoom2.put("total_revenue", BigDecimal.valueOf(3000.00));
        revenueRoom2.put("revenue_per_day", BigDecimal.valueOf(150.00));

        mockRevenuePerRoomData = List.of(revenueRoom1, revenueRoom2);
    }

    /**
     * Utworzenie mockowanej instancji JdbcTemplate, która zwraca różne dane
     * w zależności od numeru wywołania
     */
    private void setupMockJdbcTemplate() {
        when(jdbcTemplate.queryForList(anyString()))
                .thenReturn(mockRoomStatusData)
                .thenReturn(mockRoomsNeedingMaintenanceData)
                .thenReturn(mockRevenuePerRoomData);
    }

    /**
     * Test głównej metody generującej raport o statusach pokoi.
     * <p>
     * Sprawdza czy metoda poprawnie zbiera dane ze wszystkich zapytań
     * i zwraca kompletny raport zawierający wszystkie wymagane sekcje:
     * statystyki statusów pokoi, informacje o pokojach wymagających konserwacji
     * oraz dane o przychodach z poszczególnych pokoi.
     * <p>
     * Oczekiwany rezultat: Raport zawierający trzy sekcje z poprawnymi danymi dla każdej z nich.
     */
    @Test
    void generateRoomStatusReport_shouldReturnCompleteReport() {
        setupMockJdbcTemplate();

        Map<String, Object> report = roomStatusReportService.generateRoomStatusReport();

        assertNotNull(report);
        assertEquals(3, report.size());

        assertTrue(report.containsKey("roomStatus"));
        assertTrue(report.containsKey("roomsNeedingMaintenance"));
        assertTrue(report.containsKey("revenuePerRoom"));

        assertEquals(mockRoomStatusData, report.get("roomStatus"));
        assertEquals(mockRoomsNeedingMaintenanceData, report.get("roomsNeedingMaintenance"));
        assertEquals(mockRevenuePerRoomData, report.get("revenuePerRoom"));

        verify(jdbcTemplate, times(3)).queryForList(anyString());
    }

    /**
     * Test zwracania poprawnych danych dla statystyk statusów pokoi.
     * <p>
     * Sprawdza czy sekcja statusów pokoi w raporcie zawiera poprawne dane statystyczne
     * dotyczące liczby i procentowego udziału pokoi w każdym statusie: dostępne, zajęte
     * oraz wyłączone z użytku.
     * <p>
     * Oczekiwany rezultat: Sekcja raportu zawierająca poprawne dane o liczbie
     * i procentowym udziale pokoi w każdym z trzech możliwych statusów.
     */
    @Test
    void generateRoomStatusReport_shouldReturnCorrectRoomStatusStatistics() {
        doReturn(mockRoomStatusData)
                .doReturn(List.of())
                .doReturn(List.of())
                .when(jdbcTemplate).queryForList(anyString());

        Map<String, Object> report = roomStatusReportService.generateRoomStatusReport();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roomStatus = (List<Map<String, Object>>) report.get("roomStatus");
        assertNotNull(roomStatus);
        assertEquals(3, roomStatus.size());

        boolean foundAvailable = false;
        boolean foundOccupied = false;
        boolean foundOutOfService = false;

        for (Map<String, Object> status : roomStatus) {
            String statusName = (String) status.get("status");
            if ("AVAILABLE".equals(statusName)) {
                assertEquals(10, status.get("count"));
                assertEquals(50.00, status.get("percentage"));
                foundAvailable = true;
            } else if ("OCCUPIED".equals(statusName)) {
                assertEquals(8, status.get("count"));
                assertEquals(40.00, status.get("percentage"));
                foundOccupied = true;
            } else if ("OUT_OF_SERVICE".equals(statusName)) {
                assertEquals(2, status.get("count"));
                assertEquals(10.00, status.get("percentage"));
                foundOutOfService = true;
            }
        }

        assertTrue(foundAvailable && foundOccupied && foundOutOfService);
    }

    /**
     * Test zwracania poprawnych danych dla pokoi wymagających konserwacji.
     * <p>
     * Sprawdza czy sekcja dotycząca konserwacji w raporcie zawiera poprawne informacje
     * o pokojach wymagających naprawy, ich statusach oraz szczegółach zgłoszeń.
     * Test weryfikuje poprawność danych dla dwóch przykładowych zgłoszeń konserwacyjnych
     * o różnych statusach i przypisaniach do pracowników.
     * <p>
     * Oczekiwany rezultat: Sekcja raportu zawierająca listę pokoi wymagających konserwacji
     * wraz ze wszystkimi szczegółami zgłoszeń (status, opis, osoba przypisana).
     */
    @Test
    void generateRoomStatusReport_shouldReturnCorrectMaintenanceData() {
        doReturn(List.of())
                .doReturn(mockRoomsNeedingMaintenanceData)
                .doReturn(List.of())
                .when(jdbcTemplate).queryForList(anyString());

        Map<String, Object> report = roomStatusReportService.generateRoomStatusReport();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> maintenanceData = (List<Map<String, Object>>) report.get("roomsNeedingMaintenance");
        assertNotNull(maintenanceData);
        assertEquals(2, maintenanceData.size());

        Map<String, Object> request1 = maintenanceData.get(0);
        assertEquals(1, request1.get("room_id"));
        assertEquals("101", request1.get("room_number"));
        assertEquals("Zepsuty kran", request1.get("maintenance_issue"));
        assertEquals("IN_PROGRESS", request1.get("maintenance_status"));
        assertEquals("Jan Kowalski", request1.get("assignee"));

        Map<String, Object> request2 = maintenanceData.get(1);
        assertEquals(2, request2.get("room_id"));
        assertEquals("102", request2.get("room_number"));
        assertEquals("Uszkodzona klimatyzacja", request2.get("maintenance_issue"));
        assertEquals("PENDING", request2.get("maintenance_status"));
        assertNull(request2.get("assignee"));
    }

    /**
     * Test zwracania poprawnych danych dla przychodów z poszczególnych pokoi.
     * <p>
     * Sprawdza czy sekcja przychodów w raporcie zawiera poprawne informacje finansowe
     * o przychodach generowanych przez poszczególne pokoje, w tym liczby rezerwacji,
     * dni zajętości oraz przychody całkowite i w przeliczeniu na dzień.
     * <p>
     * Oczekiwany rezultat: Sekcja raportu zawierająca dane o przychodach pokoi,
     * z poprawnymi wartościami finansowymi i statystykami wykorzystania.
     */
    @Test
    void generateRoomStatusReport_shouldReturnCorrectRevenueData() {
        doReturn(List.of())
                .doReturn(List.of())
                .doReturn(mockRevenuePerRoomData)
                .when(jdbcTemplate).queryForList(anyString());

        Map<String, Object> report = roomStatusReportService.generateRoomStatusReport();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> revenueData = (List<Map<String, Object>>) report.get("revenuePerRoom");
        assertNotNull(revenueData);
        assertEquals(2, revenueData.size());

        Map<String, Object> room1 = revenueData.get(0);
        assertEquals(3, room1.get("room_id"));
        assertEquals("201", room1.get("room_number"));
        assertEquals(2, room1.get("bed_count"));
        assertEquals(BigDecimal.valueOf(200.00), room1.get("price_per_night"));
        assertEquals(10, room1.get("total_reservations"));
        assertEquals(30, room1.get("days_occupied"));
        assertEquals(BigDecimal.valueOf(6000.00), room1.get("total_revenue"));
        assertEquals(BigDecimal.valueOf(200.00), room1.get("revenue_per_day"));

        Map<String, Object> room2 = revenueData.get(1);
        assertEquals(4, room2.get("room_id"));
        assertEquals("202", room2.get("room_number"));
        assertEquals(1, room2.get("bed_count"));
    }
}