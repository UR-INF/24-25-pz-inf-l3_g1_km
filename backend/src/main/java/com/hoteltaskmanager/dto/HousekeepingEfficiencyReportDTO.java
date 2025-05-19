package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object służący do przesyłania danych raportu efektywności pracy personelu sprzątającego.
 * Raport zawiera statystyki realizacji zadań przez pracowników oraz analizę zadań odrzuconych.
 */
@Data
public class HousekeepingEfficiencyReportDTO {
    private List<EmployeeEfficiency> taskCompletionRate;
    private List<DeclinedTask> declinedTasks;
    private Map<String, Object> declinedTasksAnalysis;

    /**
     * Reprezentuje statystyki efektywności pracy pojedynczego pracownika sprzątającego.
     */
    @Data
    public static class EmployeeEfficiency {
        private Long employeeId;
        private String employeeName;
        private Integer totalAssigned;
        private Integer completed;
        private Integer pending;
        private Integer inProgress;
        private Integer declined;
        private BigDecimal completionRate;
        private Double avgCompletionTimeMinutes;
    }

    /**
     * Reprezentuje szczegóły zadania sprzątania, które zostało odrzucone.
     */
    @Data
    public static class DeclinedTask {
        private Long taskId;
        private String roomNumber;
        private String description;
        private LocalDateTime requestDate;
        private String employeeName;
    }
}

