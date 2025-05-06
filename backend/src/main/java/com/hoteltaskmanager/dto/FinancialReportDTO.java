package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class FinancialReportDTO {
    private List<PeriodRevenue> revenueByPeriod;
    private List<OccupancyRevenue> occupancyRevenueCorrelation;
    private Map<String, Object> invoiceStatistics;
    private Map<String, Object> financialSummary;

    @Data
    public static class PeriodRevenue {
        private String period;
        private Integer reservationCount;
        private BigDecimal totalRevenue;
    }

    @Data
    public static class OccupancyRevenue {
        private String period;
        private Integer reservationCount;
        private Integer totalNights;
        private Integer uniqueRoomsUsed;
        private BigDecimal totalRevenue;
        private BigDecimal avgRevenuePerNight;
        private BigDecimal roomUsagePercentage;
    }
}