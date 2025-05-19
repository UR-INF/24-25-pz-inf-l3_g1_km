package com.hoteltaskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serwis odpowiedzialny za generowanie raportu dotyczącego stanu pokojów hotelowych.
 * Raport zawiera informacje o statusach pokojów, wymaganej konserwacji oraz przychodach z poszczególnych pokojów.
 */
@Service
public class RoomStatusReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generuje raport dotyczący stanu pokojów hotelowych.
     * Raport zawiera trzy główne sekcje:
     * <ul>
     *     <li><b>roomStatus</b> – rozkład pokojów według ich aktualnego statusu (np. dostępny, zajęty, poza serwisem)</li>
     *     <li><b>roomsNeedingMaintenance</b> – szczegółowa lista pokojów wymagających konserwacji</li>
     *     <li><b>revenuePerRoom</b> – podsumowanie przychodów wygenerowanych przez każdy pokój na podstawie historii rezerwacji</li>
     * </ul>
     *
     * @return mapa danych raportowych, gdzie klucze to nazwy sekcji raportu, a wartości to listy danych w formacie mapy.
     */
    public Map<String, Object> generateRoomStatusReport() {
        Map<String, Object> reportData = new HashMap<>();

        // 1. Bieżący wskaźnik zajętości z podziałem na statusy pokojów
        String roomStatusQuery = """
            SELECT 
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) / (SELECT COUNT(*) FROM rooms)) * 100, 2) as percentage
            FROM 
                rooms
            GROUP BY 
                status
        """;

        List<Map<String, Object>> roomStatus = jdbcTemplate.queryForList(roomStatusQuery);
        reportData.put("roomStatus", roomStatus);

        // 2. Pokoje wymagające konserwacji
        String roomsNeedingMaintenanceQuery = """
            SELECT 
                r.id as room_id,
                r.room_number,
                r.floor,
                r.status,
                m.id as maintenance_request_id,
                m.description as maintenance_issue,
                m.request_date,
                m.status as maintenance_status,
                CONCAT(e.first_name, ' ', e.last_name) as assignee
            FROM 
                rooms r
                JOIN maintenance_requests m ON r.id = m.room_id
                LEFT JOIN employee e ON m.assignee_id = e.id
            WHERE 
                m.status IN ('PENDING', 'IN_PROGRESS')
            ORDER BY 
                m.request_date ASC
        """;

        List<Map<String, Object>> roomsNeedingMaintenance = jdbcTemplate.queryForList(roomsNeedingMaintenanceQuery);
        reportData.put("roomsNeedingMaintenance", roomsNeedingMaintenance);

        // 3. Przychód na pokój w oparciu o historię zajętości
        String revenuePerRoomQuery = """
            SELECT 
                r.id as room_id,
                r.room_number,
                r.floor,
                r.bed_count,
                r.price_per_night,
                COUNT(DISTINCT res.id) as total_reservations,
                SUM(DATEDIFF(res.end_date, res.start_date)) as days_occupied,
                SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) as total_revenue,
                ROUND(SUM(DATEDIFF(res.end_date, res.start_date) * r.price_per_night) / 
                      SUM(DATEDIFF(res.end_date, res.start_date)), 2) as revenue_per_day
            FROM 
                rooms r
                LEFT JOIN reservation_rooms rr ON r.id = rr.room_id
                LEFT JOIN reservations res ON rr.reservation_id = res.id
            WHERE 
                res.status != 'CANCELLED' OR res.status IS NULL
            GROUP BY 
                r.id, r.room_number, r.floor, r.bed_count, r.price_per_night
            ORDER BY 
                total_revenue DESC
        """;

        List<Map<String, Object>> revenuePerRoom = jdbcTemplate.queryForList(revenuePerRoomQuery);
        reportData.put("revenuePerRoom", revenuePerRoom);

        return reportData;
    }
}