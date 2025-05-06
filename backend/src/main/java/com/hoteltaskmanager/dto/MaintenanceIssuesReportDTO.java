package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class MaintenanceIssuesReportDTO {
    private Map<String, Object> avgResolutionTime;
    private List<RoomIssueCount> issuesByRoom;
    private List<FloorIssueCount> issuesByFloor;

    @Data
    public static class RoomIssueCount {
        private Long roomId;
        private String roomNumber;
        private Integer floor;
        private Integer issueCount;
    }

    @Data
    public static class FloorIssueCount {
        private Integer floor;
        private Integer issueCount;
        private Integer roomCount;
        private BigDecimal issuesPerRoom;
    }
}
