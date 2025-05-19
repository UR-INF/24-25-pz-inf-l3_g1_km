package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object zawierający dane raportu dotyczącego problemów konserwacyjnych w hotelu.
 * Raport obejmuje średni czas rozwiązania problemów oraz liczbę zgłoszeń na poziomie pokoi i pięter.
 */
@Data
public class MaintenanceIssuesReportDTO {
    private Map<String, Object> avgResolutionTime;
    private List<RoomIssueCount> issuesByRoom;
    private List<FloorIssueCount> issuesByFloor;

    /**
     * Reprezentuje liczbę zgłoszonych problemów konserwacyjnych dla pojedynczego pokoju.
     */
    @Data
    public static class RoomIssueCount {
        private Long roomId;
        private String roomNumber;
        private Integer floor;
        private Integer issueCount;
    }

    /**
     * Reprezentuje statystyki dotyczące liczby problemów konserwacyjnych na danym piętrze,
     * łącznie z liczbą pokoi oraz średnią problemów na pokój.
     */
    @Data
    public static class FloorIssueCount {
        private Integer floor;
        private Integer issueCount;
        private Integer roomCount;
        private BigDecimal issuesPerRoom;
    }
}
