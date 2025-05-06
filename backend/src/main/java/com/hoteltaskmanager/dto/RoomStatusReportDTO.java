package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoomStatusReportDTO {
    private List<RoomStatusCount> roomStatus;
    private List<MaintenanceRoom> roomsNeedingMaintenance;
    private List<RoomRevenue> revenuePerRoom;

    @Data
    public static class RoomStatusCount {
        private String status;
        private Integer count;
        private BigDecimal percentage;
    }

    @Data
    public static class MaintenanceRoom {
        private Long roomId;
        private String roomNumber;
        private Integer floor;
        private String status;
        private Long maintenanceRequestId;
        private String maintenanceIssue;
        private LocalDateTime requestDate;
        private String maintenanceStatus;
        private String assignee;
    }

    @Data
    public static class RoomRevenue {
        private Long roomId;
        private String roomNumber;
        private Integer floor;
        private Integer bedCount;
        private BigDecimal pricePerNight;
        private Integer totalReservations;
        private Integer daysOccupied;
        private BigDecimal totalRevenue;
        private BigDecimal revenuePerDay;
    }
}
