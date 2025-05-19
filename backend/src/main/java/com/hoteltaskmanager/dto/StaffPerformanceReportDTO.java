package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data Transfer Object zawierający dane raportu dotyczącego wydajności personelu.
 * Raport obejmuje zadania przypisane do pracowników, średni czas realizacji zadań,
 * statystyki według typu zadań oraz wskaźnik sukcesu pracowników.
 */
@Data
public class StaffPerformanceReportDTO {
    private List<EmployeePerformance> tasksByEmployee;
    private List<TaskCompletionTime> avgCompletionTime;
    private List<TaskTypeStatistics> tasksByType;
    private List<EmployeeSuccessRate> successRate;

    /**
     * Reprezentuje dane dotyczące wydajności poszczególnych pracowników.
     */
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

    /**
     * Reprezentuje średni czas realizacji zadań według ich typu.
     */
    @Data
    public static class TaskCompletionTime {
        private String taskType;
        private Double avgHoursToComplete;
    }

    /**
     * Statystyki zadań według typu wraz z podziałem na statusy zadań.
     */
    @Data
    public static class TaskTypeStatistics {
        private String taskType;
        private Integer totalCount;
        private Integer completedCount;
        private Integer pendingCount;
        private Integer inProgressCount;
        private Integer declinedCount;
    }

    /**
     * Reprezentuje wskaźnik sukcesu pracownika w realizacji zadań.
     */
    @Data
    public static class EmployeeSuccessRate {
        private Long employeeId;
        private String employeeName;
        private Integer totalAssigned;
        private Integer completed;
        private BigDecimal successRate;
    }
}
