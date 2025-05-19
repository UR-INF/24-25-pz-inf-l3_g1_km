package com.hoteltaskmanager.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object zawierający dane raportu zarządzania rezerwacjami.
 * Raport obejmuje nadchodzące zameldowania i wymeldowania, prognozę dostępności pokoi,
 * wskaźnik anulowania rezerwacji oraz analizę anulowań według miesięcy.
 */
@Data
public class ReservationManagementReportDTO {
    private List<CheckInOut> upcomingCheckIns;
    private List<CheckInOut> upcomingCheckOuts;
    private List<DailyAvailability> roomAvailabilityForecast;
    private Map<String, Object> cancellationRate;
    private List<MonthlyCancellation> cancellationsByMonth;

    /**
     * Reprezentuje informacje o nadchodzącym zameldowaniu lub wymeldowaniu.
     */
    @Data
    public static class CheckInOut {
        private Long reservationId;
        private String guestFirstName;
        private String guestLastName;
        private String guestPhone;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private String rooms;
        private String specialRequests;
        private String catering;
    }

    /**
     * Reprezentuje prognozę dostępności pokoi na konkretny dzień.
     */
    @Data
    public static class DailyAvailability {
        private LocalDate date;
        private Integer totalRooms;
        private Integer availableRooms;
        private Integer occupiedRooms;
        private BigDecimal occupancyRate;
    }

    /**
     * Reprezentuje dane dotyczące anulacji rezerwacji w danym miesiącu.
     */
    @Data
    public static class MonthlyCancellation {
        private String month;
        private Integer totalReservations;
        private Integer cancelledReservations;
        private BigDecimal cancellationRate;
    }
}
