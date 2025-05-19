package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO zawierające dane do raportu finansowego.
 * Zawiera zestawienia przychodów według okresu, korelację z obłożeniem, statystyki faktur
 * oraz podsumowanie finansowe.
 */
@Data
public class FinancialReportDTO {
    private List<PeriodRevenue> revenueByPeriod;
    private List<OccupancyRevenue> occupancyRevenueCorrelation;
    private Map<String, Object> invoiceStatistics;
    private Map<String, Object> financialSummary;

    /**
     * Klasa reprezentująca przychód za określony okres czasu.
     */
    @Data
    public static class PeriodRevenue {
        private String period;
        private Integer reservationCount;
        private BigDecimal totalRevenue;
    }

    /**
     * Klasa reprezentująca dane dotyczące korelacji obłożenia pokoi z przychodami.
     */
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