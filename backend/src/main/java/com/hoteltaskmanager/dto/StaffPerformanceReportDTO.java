package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class StaffPerformanceReportDTO {
    private List<EmployeePerformance> tasksByEmployee;
    private List<TaskCompletionTime> avgCompletionTime;
    private List<TaskTypeStatistics> tasksByType;
    private List<EmployeeSuccessRate> successRate;

    @Data
    public static class EmployeePerformance {
        private Long employeeId;
        private String employeeName;
        private String avatarUrl;
        private String roleName;
        private Integer housekeepingTasks;
        private Integer maintenanceTasks;
        private Integer totalTasks;
    }

    @Data
    public static class TaskCompletionTime {
        private String taskType;
        private Double avgHoursToComplete;
    }

    @Data
    public static class TaskTypeStatistics {
        private String taskType;
        private Integer totalCount;
        private Integer completedCount;
        private Integer pendingCount;
        private Integer inProgressCount;
        private Integer declinedCount;
    }

    @Data
    public static class EmployeeSuccessRate {
        private Long employeeId;
        private String employeeName;
        private Integer totalAssigned;
        private Integer completed;
        private BigDecimal successRate;
    }
}
