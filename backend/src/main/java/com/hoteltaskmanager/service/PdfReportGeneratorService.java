package com.hoteltaskmanager.service;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PdfReportGeneratorService {

    private static final String FONT_PATH = "fonts/DejaVuSans.ttf";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    @Autowired
    private ReportStorageService reportStorageService;

    private BaseFont createPolishFont() throws DocumentException, IOException {
        return BaseFont.createFont(FONT_PATH, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
    }

    /**
     * Generuje i zapisuje raport PDF dotyczący pracowników.
     */
    public Report generateAndSaveStaffReport(Map<String, Object> reportData, LocalDate startDate, LocalDate endDate) {
        ByteArrayInputStream pdfStream = generateStaffReport(reportData, startDate, endDate);
        return reportStorageService.saveReport(pdfStream, ReportType.EMPLOYEE_STATISTICS, "staff_report");
    }

    /**
     * Generuje i zapisuje raport PDF dotyczący finansów.
     */
    public Report generateAndSaveFinancialReport(Map<String, Object> reportData, String period,
                                                 LocalDate startDate, LocalDate endDate) {
        ByteArrayInputStream pdfStream = generateFinancialReport(reportData, period, startDate, endDate);
        return reportStorageService.saveReport(pdfStream, ReportType.GENERAL_REPORT, "financial_report");
    }

    /**
     * Generuje i zapisuje raport PDF dotyczący pokojów.
     */
    public Report generateAndSaveRoomsReport(Map<String, Object> reportData, LocalDate startDate, LocalDate endDate) {
        ByteArrayInputStream pdfStream = generateRoomsReport(reportData, startDate, endDate);
        return reportStorageService.saveReport(pdfStream, ReportType.GENERAL_REPORT, "rooms_report");
    }

    /**
     * Generuje i zapisuje kompletny raport PDF zawierający wszystkie dane.
     */
    public Report generateAndSaveCompleteReport(Map<String, Object> reportData, String period,
                                                LocalDate startDate, LocalDate endDate) {
        ByteArrayInputStream pdfStream = generateCompleteReport(reportData, period, startDate, endDate);
        return reportStorageService.saveReport(pdfStream, ReportType.GENERAL_REPORT, "complete_report");
    }

    /**
     * Generuje raport PDF dotyczący pracowników.
     */
    public ByteArrayInputStream generateStaffReport(Map<String, Object> reportData, LocalDate startDate, LocalDate endDate) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setInitialLeading(16); 

            try {
                writer.setRunDirection(PdfWriter.RUN_DIRECTION_DEFAULT);
                document.addTitle("Raport personelu hotelu");
                document.addCreator("System hotelowy");
                writer.setPdfVersion(PdfWriter.PDF_VERSION_1_7);
            } catch (Exception e) {
                // Ignorujemy wyjątki związane z metadanymi
            }

            document.open();

            // Tytuł raportu
            addTitle(document, "Raport personelu hotelu");
            addSubtitle(document, "Okres: " + startDate.format(DATE_FORMATTER) + " - " + endDate.format(DATE_FORMATTER));

            // Wydajność pracowników
            addSectionTitle(document, "Wydajność personelu");
            Map<String, Object> staffPerformanceData = (Map<String, Object>) reportData.get("staffPerformance");
            List<Map<String, Object>> tasksByEmployee = (List<Map<String, Object>>) staffPerformanceData.get("tasksByEmployee");

            if (tasksByEmployee != null && !tasksByEmployee.isEmpty()) {
                addStaffPerformanceTable(document, tasksByEmployee);
            } else {
                addParagraph(document, "Brak danych o wydajności personelu.");
            }

            // Efektywność obsługi pokojów
            addSectionTitle(document, "Efektywność obsługi pokojów");
            Map<String, Object> housekeepingData = (Map<String, Object>) reportData.get("housekeepingEfficiency");

            if (housekeepingData != null) {
                List<Map<String, Object>> taskCompletionRate = (List<Map<String, Object>>) housekeepingData.get("taskCompletionRate");

                if (taskCompletionRate != null && !taskCompletionRate.isEmpty()) {
                    addHousekeepingEfficiencyTable(document, taskCompletionRate);
                } else {
                    addParagraph(document, "Brak danych o efektywności obsługi pokojów.");
                }

                // Zadania odrzucone
                if (housekeepingData.containsKey("declinedTasks")) {
                    addSectionTitle(document, "Odrzucone zadania sprzątania");
                    List<Map<String, Object>> declinedTasks = (List<Map<String, Object>>) housekeepingData.get("declinedTasks");

                    if (declinedTasks != null && !declinedTasks.isEmpty()) {
                        addDeclinedTasksTable(document, declinedTasks);
                    } else {
                        addParagraph(document, "Brak odrzuconych zadań w tym okresie.");
                    }
                }
            } else {
                addParagraph(document, "Brak danych o efektywności obsługi pokojów.");
            }

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Błąd podczas generowania raportu PDF dla personelu", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
    /**
     * Generuje raport PDF dotyczący finansów.
     */
    public ByteArrayInputStream generateFinancialReport(Map<String, Object> reportData, String period,
                                                        LocalDate startDate, LocalDate endDate) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setInitialLeading(16); 
            document.open();

            // Tytuł raportu
            addTitle(document, "Raport finansowy hotelu");
            addSubtitle(document, "Okres: " + startDate.format(DATE_FORMATTER) + " - " + endDate.format(DATE_FORMATTER));
            addSubtitle(document, "Grupowanie: " + getPolishPeriodName(period));

            // Przychody w okresie
            Map<String, Object> financialData = (Map<String, Object>) reportData.get("financial");

            if (financialData.containsKey("revenueByPeriod")) {
                addSectionTitle(document, "Przychody w okresie");
                List<Map<String, Object>> revenueByPeriod = (List<Map<String, Object>>) financialData.get("revenueByPeriod");

                if (revenueByPeriod != null && !revenueByPeriod.isEmpty()) {
                    addRevenueByPeriodTable(document, revenueByPeriod);
                } else {
                    addParagraph(document, "Brak danych o przychodach w tym okresie.");
                }
            }

            // Korelacja obłożenia z przychodami
            if (financialData.containsKey("occupancyRevenueCorrelation")) {
                addSectionTitle(document, "Korelacja obłożenia z przychodami");
                List<Map<String, Object>> occupancyRevenueCorrelation =
                        (List<Map<String, Object>>) financialData.get("occupancyRevenueCorrelation");

                if (occupancyRevenueCorrelation != null && !occupancyRevenueCorrelation.isEmpty()) {
                    addOccupancyRevenueCorrelationTable(document, occupancyRevenueCorrelation);
                } else {
                    addParagraph(document, "Brak danych o korelacji obłożenia z przychodami w tym okresie.");
                }
            }

            // Statystyki fakturowania
            if (financialData.containsKey("invoiceStatistics")) {
                addSectionTitle(document, "Statystyki fakturowania");
                Map<String, Object> invoiceStatistics = (Map<String, Object>) financialData.get("invoiceStatistics");

                if (invoiceStatistics != null && !invoiceStatistics.isEmpty()) {
                    addInvoiceStatisticsTable(document, invoiceStatistics);
                } else {
                    addParagraph(document, "Brak danych o fakturowaniu w tym okresie.");
                }
            }

            // Podsumowanie finansowe
            if (financialData.containsKey("financialSummary")) {
                addSectionTitle(document, "Podsumowanie finansowe");
                Map<String, Object> financialSummary = (Map<String, Object>) financialData.get("financialSummary");

                if (financialSummary != null && !financialSummary.isEmpty()) {
                    addFinancialSummaryTable(document, financialSummary);
                } else {
                    addParagraph(document, "Brak danych podsumowania finansowego w tym okresie.");
                }
            }

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Błąd podczas generowania raportu PDF finansowego", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    /**
     * Generuje raport PDF dotyczący pokojów.
     */
    public ByteArrayInputStream generateRoomsReport(Map<String, Object> reportData, LocalDate startDate, LocalDate endDate) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setInitialLeading(16); 
            document.open();

            // Tytuł raportu
            addTitle(document, "Raport stanu pokojów hotelowych");
            addSubtitle(document, "Okres: " + startDate.format(DATE_FORMATTER) + " - " + endDate.format(DATE_FORMATTER));

            // Status pokojów
            Map<String, Object> roomStatusData = (Map<String, Object>) reportData.get("roomStatus");

            if (roomStatusData.containsKey("roomStatus")) {
                addSectionTitle(document, "Status pokojów");
                List<Map<String, Object>> roomStatus = (List<Map<String, Object>>) roomStatusData.get("roomStatus");

                if (roomStatus != null && !roomStatus.isEmpty()) {
                    addRoomStatusTable(document, roomStatus);
                } else {
                    addParagraph(document, "Brak danych o statusie pokojów.");
                }
            }

            // Pokoje wymagające konserwacji
            if (roomStatusData.containsKey("roomsNeedingMaintenance")) {
                addSectionTitle(document, "Pokoje wymagające konserwacji");
                List<Map<String, Object>> roomsNeedingMaintenance =
                        (List<Map<String, Object>>) roomStatusData.get("roomsNeedingMaintenance");

                if (roomsNeedingMaintenance != null && !roomsNeedingMaintenance.isEmpty()) {
                    addRoomsNeedingMaintenanceTable(document, roomsNeedingMaintenance);
                } else {
                    addParagraph(document, "Brak pokojów wymagających konserwacji w tym okresie.");
                }
            }

            // Przychód na pokój
            if (roomStatusData.containsKey("revenuePerRoom")) {
                addSectionTitle(document, "Przychód na pokój");
                List<Map<String, Object>> revenuePerRoom = (List<Map<String, Object>>) roomStatusData.get("revenuePerRoom");

                if (revenuePerRoom != null && !revenuePerRoom.isEmpty()) {
                    addRevenuePerRoomTable(document, revenuePerRoom);
                } else {
                    addParagraph(document, "Brak danych o przychodach na pokój w tym okresie.");
                }
            }

            // Problemy konserwacyjne
            Map<String, Object> maintenanceIssuesData = (Map<String, Object>) reportData.get("maintenanceIssues");

            if (maintenanceIssuesData != null) {
                // Problemy według pokojów
                if (maintenanceIssuesData.containsKey("issuesByRoom")) {
                    addSectionTitle(document, "Problemy konserwacyjne według pokojów");
                    List<Map<String, Object>> issuesByRoom =
                            (List<Map<String, Object>>) maintenanceIssuesData.get("issuesByRoom");

                    if (issuesByRoom != null && !issuesByRoom.isEmpty()) {
                        addIssuesByRoomTable(document, issuesByRoom);
                    } else {
                        addParagraph(document, "Brak danych o problemach konserwacyjnych w pokojach.");
                    }
                }

                // Problemy według pięter
                if (maintenanceIssuesData.containsKey("issuesByFloor")) {
                    addSectionTitle(document, "Problemy konserwacyjne według pięter");
                    List<Map<String, Object>> issuesByFloor =
                            (List<Map<String, Object>>) maintenanceIssuesData.get("issuesByFloor");

                    if (issuesByFloor != null && !issuesByFloor.isEmpty()) {
                        addIssuesByFloorTable(document, issuesByFloor);
                    } else {
                        addParagraph(document, "Brak danych o problemach konserwacyjnych według pięter.");
                    }
                }
            }

            // Prognozy dostępności
            Map<String, Object> reservationsData = (Map<String, Object>) reportData.get("reservations");

            if (reservationsData != null && reservationsData.containsKey("roomAvailabilityForecast")) {
                addSectionTitle(document, "Prognoza dostępności pokojów");
                List<Map<String, Object>> roomAvailabilityForecast =
                        (List<Map<String, Object>>) reservationsData.get("roomAvailabilityForecast");

                if (roomAvailabilityForecast != null && !roomAvailabilityForecast.isEmpty()) {
                    addRoomAvailabilityForecastTable(document, roomAvailabilityForecast);
                } else {
                    addParagraph(document, "Brak danych prognozy dostępności pokojów.");
                }
            }

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Błąd podczas generowania raportu PDF dla pokojów", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    /**
     * Generuje kompletny raport PDF zawierający wszystkie dane.
     */
    public ByteArrayInputStream generateCompleteReport(Map<String, Object> reportData, String period,
                                                       LocalDate startDate, LocalDate endDate) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setInitialLeading(16); 
            document.open();

            // Tytuł główny
            addTitle(document, "Raport kompleksowy hotelu");
            addSubtitle(document, "Okres: " + startDate.format(DATE_FORMATTER) + " - " + endDate.format(DATE_FORMATTER));

            // Sekcja 1: Personel
            addChapterTitle(document, "1. Raport personelu");
            Map<String, Object> staffReport = new HashMap<>();
            staffReport.put("staffPerformance", reportData.get("staffPerformance"));
            staffReport.put("housekeepingEfficiency", reportData.get("housekeepingEfficiency"));

            // Dodaj skrócone wersje tabel personelu
            addStaffSummary(document, staffReport);

            // Sekcja 2: Finanse
            addChapterTitle(document, "2. Raport finansowy");
            Map<String, Object> financialReport = new HashMap<>();
            financialReport.put("financial", reportData.get("financial"));

            // Dodaj skrócone wersje tabel finansowych
            addFinancialSummary(document, financialReport);

            // Sekcja 3: Pokoje
            addChapterTitle(document, "3. Raport pokojów");
            Map<String, Object> roomsReport = new HashMap<>();
            roomsReport.put("roomStatus", reportData.get("roomStatus"));
            roomsReport.put("maintenanceIssues", reportData.get("maintenanceIssues"));
            roomsReport.put("reservations", reportData.get("reservations"));

            // Dodaj skrócone wersje tabel pokojów
            addRoomsSummary(document, roomsReport);

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Błąd podczas generowania kompleksowego raportu PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    // Metody pomocnicze do generowania tabel i formatowania dokumentu

    private void addTitle(Document document, String title) throws DocumentException {
        try {
            BaseFont baseFont = createPolishFont();
            Font titleFont = new Font(baseFont, 18, Font.BOLD);
            Paragraph titleParagraph = new Paragraph(title, titleFont);
            titleParagraph.setAlignment(Element.ALIGN_CENTER);
            titleParagraph.setSpacingAfter(10);
            document.add(titleParagraph);
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia czcionki dla tytułu", e);
        }
    }

    // Podobnie modyfikujemy pozostałe metody
    private void addSubtitle(Document document, String subtitle) throws DocumentException {
        try {
            BaseFont baseFont = createPolishFont();
            Font subtitleFont = new Font(baseFont, 12, Font.NORMAL, BaseColor.DARK_GRAY);
            Paragraph subtitleParagraph = new Paragraph(subtitle, subtitleFont);
            subtitleParagraph.setAlignment(Element.ALIGN_CENTER);
            subtitleParagraph.setSpacingAfter(20);
            document.add(subtitleParagraph);
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia czcionki dla podtytułu", e);
        }
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        try {
            BaseFont baseFont = createPolishFont();
            Font sectionFont = new Font(baseFont, 14, Font.BOLD);
            Paragraph sectionParagraph = new Paragraph(title, sectionFont);
            sectionParagraph.setSpacingBefore(15);
            sectionParagraph.setSpacingAfter(10);
            document.add(sectionParagraph);
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia czcionki dla tytułu sekcji", e);
        }
    }

    private void addChapterTitle(Document document, String title) throws DocumentException {
        try {
            BaseFont baseFont = createPolishFont();
            Font chapterFont = new Font(baseFont, 16, Font.BOLD);
            Paragraph chapterParagraph = new Paragraph(title, chapterFont);
            chapterParagraph.setSpacingBefore(20);
            chapterParagraph.setSpacingAfter(10);
            document.add(chapterParagraph);
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia czcionki dla tytułu rozdziału", e);
        }
    }

    private void addParagraph(Document document, String text) throws DocumentException {
        try {
            BaseFont baseFont = createPolishFont();
            Font paragraphFont = new Font(baseFont, 10, Font.NORMAL);
            Paragraph paragraph = new Paragraph(text, paragraphFont);
            document.add(paragraph);
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia akapitu", e);
        }
    }

    // Implementacje metod do generowania konkretnych tabel

    private void addStaffPerformanceTable(Document document, List<Map<String, Object>> tasksByEmployee) throws DocumentException {
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {
                "Pracownik", "Rola", "Zadania sprzątania", "Zadania konserwacji", "Razem zadań", "Wskaźnik sukcesu (%)"
        });

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> employee : tasksByEmployee) {
                PdfPCell nameCell = new PdfPCell(new Phrase(String.valueOf(employee.get("employee_name")), cellFont));
                PdfPCell roleCell = new PdfPCell(new Phrase(String.valueOf(employee.get("role_name")), cellFont));
                PdfPCell housekeepingCell = new PdfPCell(new Phrase(String.valueOf(employee.get("housekeeping_tasks")), cellFont));
                PdfPCell maintenanceCell = new PdfPCell(new Phrase(String.valueOf(employee.get("maintenance_tasks")), cellFont));
                PdfPCell totalCell = new PdfPCell(new Phrase(String.valueOf(employee.get("total_tasks")), cellFont));
                PdfPCell successRateCell = new PdfPCell(new Phrase(String.valueOf(employee.get("success_rate")), cellFont));

                table.addCell(nameCell);
                table.addCell(roleCell);
                table.addCell(housekeepingCell);
                table.addCell(maintenanceCell);
                table.addCell(totalCell);
                table.addCell(successRateCell);
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli wydajności pracowników", e);
        }

        document.add(table);
    }

    private void addHousekeepingEfficiencyTable(Document document, List<Map<String, Object>> taskCompletionRate) throws DocumentException {
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {
                "Pracownik", "Przydzielone", "Ukończone", "Oczekujące", "W trakcie", "Odrzucone", "Wskaźnik (%)"}
        );

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> record : taskCompletionRate) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("employee_name")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("total_assigned")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("completed")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("pending")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("in_progress")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("declined")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(record.get("completion_rate")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli efektywności obsługi pokojów", e);
        }

        document.add(table);
    }

    private void addDeclinedTasksTable(Document document, List<Map<String, Object>> declinedTasks) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {"Pokój", "Opis zadania", "Data zlecenia", "Pracownik"});

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> task : declinedTasks) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(task.get("room_number")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(task.get("description")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(formatDate(String.valueOf(task.get("request_date")))), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(task.get("employee_name")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli odrzuconych zadań", e);
        }

        document.add(table);
    }

    private void addRevenueByPeriodTable(Document document, List<Map<String, Object>> revenueByPeriod) throws DocumentException {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {"Okres", "Liczba rezerwacji", "Całkowity przychód"});

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> revenue : revenueByPeriod) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(revenue.get("period")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(revenue.get("reservation_count")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(formatCurrency(revenue.get("total_revenue")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli przychodów w okresie", e);
        }

        document.add(table);
    }

    private void addOccupancyRevenueCorrelationTable(Document document, List<Map<String, Object>> correlationData) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {
                "Okres", "Liczba rezerwacji", "Liczba nocy", "Przychód", "Wykorzystanie pokojów (%)"
        });

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> data : correlationData) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(data.get("period")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(data.get("reservation_count")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(data.get("total_nights")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(formatCurrency(data.get("total_revenue")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(data.get("room_usage_percentage")) + "%", cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli korelacji obłożenia z przychodami", e);
        }

        document.add(table);
    }

    private void addInvoiceStatisticsTable(Document document, Map<String, Object> invoiceStatistics) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);
            Font headerFont = new Font(baseFont, 10, Font.BOLD);

            // Dodajemy pary klucz-wartość
            table.addCell(new PdfPCell(new Phrase("Liczba faktur", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(invoiceStatistics.get("total_invoices")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Liczba rezerwacji z fakturami", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(invoiceStatistics.get("total_reservations_with_invoices")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Liczba zakończonych rezerwacji", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(invoiceStatistics.get("total_completed_reservations")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Pokrycie fakturami (%)", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(invoiceStatistics.get("invoice_coverage_percentage")) + "%", cellFont)));

            table.addCell(new PdfPCell(new Phrase("Faktury firmowe", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(invoiceStatistics.get("company_invoices")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Faktury indywidualne", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(invoiceStatistics.get("individual_invoices")), cellFont)));
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli statystyk fakturowania", e);
        }

        document.add(table);
    }

    private void addFinancialSummaryTable(Document document, Map<String, Object> financialSummary) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);
            Font headerFont = new Font(baseFont, 10, Font.BOLD);

            // Dodajemy pary klucz-wartość
            table.addCell(new PdfPCell(new Phrase("Liczba ukończonych rezerwacji", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(financialSummary.get("total_completed_reservations")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Liczba sprzedanych nocy", headerFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(financialSummary.get("total_nights_sold")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Całkowity przychód", headerFont)));
            table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("total_revenue")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Najwyższa stawka za pokój", headerFont)));
            table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("highest_room_rate")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Najniższa stawka za pokój", headerFont)));
            table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("lowest_room_rate")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Średnia stawka za pokój", headerFont)));
            table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("avg_room_rate")), cellFont)));

            table.addCell(new PdfPCell(new Phrase("Średnia stawka dzienna", headerFont)));
            table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("avg_daily_rate")), cellFont)));
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli podsumowania finansowego", e);
        }

        document.add(table);
    }

    private void addRoomStatusTable(Document document, List<Map<String, Object>> roomStatus) throws DocumentException {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {"Status", "Liczba pokojów", "Procent (%)"});

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> status : roomStatus) {
                table.addCell(new PdfPCell(new Phrase(formatRoomStatus(String.valueOf(status.get("status"))), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(status.get("count")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(status.get("percentage")) + "%", cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli statusu pokojów", e);
        }

        document.add(table);
    }

    private void addRoomsNeedingMaintenanceTable(Document document, List<Map<String, Object>> rooms) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {"Pokój", "Piętro", "Problem", "Data zgłoszenia", "Przypisany pracownik"});

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> room : rooms) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("room_number")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("floor")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("maintenance_issue")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(formatDate(String.valueOf(room.get("request_date")))), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("assignee")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli pokojów wymagających konserwacji", e);
        }

        document.add(table);
    }

    private void addRevenuePerRoomTable(Document document, List<Map<String, Object>> revenuePerRoom) throws DocumentException {
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {
                "Pokój", "Piętro", "Łóżka", "Cena za noc", "Dni zajęte", "Całkowity przychód"
        });

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> room : revenuePerRoom) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("room_number")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("floor")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("bed_count")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(formatCurrency(room.get("price_per_night")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("days_occupied")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(formatCurrency(room.get("total_revenue")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli przychodów na pokój", e);
        }

        document.add(table);
    }

    private void addIssuesByRoomTable(Document document, List<Map<String, Object>> issuesByRoom) throws DocumentException {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {"Pokój", "Piętro", "Liczba problemów"});

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> room : issuesByRoom) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("room_number")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("floor")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("issue_count")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli problemów według pokojów", e);
        }

        document.add(table);
    }

    private void addIssuesByFloorTable(Document document, List<Map<String, Object>> issuesByFloor) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {"Piętro", "Liczba problemów", "Liczba pokojów", "Problemy/pokój"});

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (Map<String, Object> floor : issuesByFloor) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(floor.get("floor")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(floor.get("issue_count")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(floor.get("room_count")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(floor.get("issues_per_room")), cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli problemów według pięter", e);
        }

        document.add(table);
    }

    private void addRoomAvailabilityForecastTable(Document document, List<Map<String, Object>> forecast) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);

        // Nagłówki tabeli
        addTableHeader(table, new String[] {
                "Data", "Liczba pokojów", "Dostępne pokoje", "Zajęte pokoje", "Obłożenie (%)"
        });

        // Ograniczamy do 10 najbliższych dni, aby raport był czytelny
        int rowsToShow = Math.min(forecast.size(), 10);

        // Wiersze tabeli
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            for (int i = 0; i < rowsToShow; i++) {
                Map<String, Object> day = forecast.get(i);
                table.addCell(new PdfPCell(new Phrase(String.valueOf(formatDate(String.valueOf(day.get("date")))), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(day.get("total_rooms")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(day.get("available_rooms")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(day.get("occupied_rooms")), cellFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(day.get("occupancy_rate")) + "%", cellFont)));
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas tworzenia tabeli prognozy dostępności pokojów", e);
        }

        document.add(table);

        if (forecast.size() > 10) {
            try {
                BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                Font noteFont = new Font(baseFont, 10, Font.ITALIC);
                Paragraph note = new Paragraph("* Pokazano tylko 10 najbliższych dni. Pełny raport dostępny w formacie JSON.", noteFont);
                note.setAlignment(Element.ALIGN_CENTER);
                note.setSpacingBefore(5);
                document.add(note);
            } catch (Exception e) {
                throw new DocumentException("Błąd podczas dodawania notatki o ograniczeniu wyników", e);
            }
        }
    }

    // Metody pomocnicze do skróconych podsumowań w raporcie kompleksowym

    private void addStaffSummary(Document document, Map<String, Object> staffReport) throws DocumentException {
        Map<String, Object> staffPerformanceData = (Map<String, Object>) staffReport.get("staffPerformance");

        if (staffPerformanceData != null && staffPerformanceData.containsKey("tasksByEmployee")) {
            List<Map<String, Object>> tasksByEmployee = (List<Map<String, Object>>) staffPerformanceData.get("tasksByEmployee");

            if (tasksByEmployee != null && !tasksByEmployee.isEmpty()) {
                addSectionTitle(document, "1.1. Top 5 pracowników według liczby zadań");

                // Sortujemy i bierzemy top 5
                tasksByEmployee.sort((a, b) -> {
                    Integer totalA = (Integer) a.get("total_tasks");
                    Integer totalB = (Integer) b.get("total_tasks");
                    return totalB.compareTo(totalA);
                });

                int rowsToShow = Math.min(tasksByEmployee.size(), 5);
                List<Map<String, Object>> top5 = tasksByEmployee.subList(0, rowsToShow);

                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                addTableHeader(table, new String[] {"Pracownik", "Rola", "Zadania", "Wskaźnik sukcesu (%)"});

                try {
                    BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                    Font cellFont = new Font(baseFont, 10, Font.NORMAL);

                    for (Map<String, Object> employee : top5) {
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(employee.get("employee_name")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(employee.get("role_name")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(employee.get("total_tasks")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(employee.get("success_rate")), cellFont)));
                    }
                } catch (Exception e) {
                    throw new DocumentException("Błąd podczas tworzenia tabeli top 5 pracowników", e);
                }

                document.add(table);
            }
        }
    }

    private void addFinancialSummary(Document document, Map<String, Object> financialReport) throws DocumentException {
        Map<String, Object> financialData = (Map<String, Object>) financialReport.get("financial");

        if (financialData != null && financialData.containsKey("financialSummary")) {
            Map<String, Object> financialSummary = (Map<String, Object>) financialData.get("financialSummary");

            if (financialSummary != null && !financialSummary.isEmpty()) {
                addSectionTitle(document, "2.1. Podsumowanie finansowe");

                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);

                try {
                    BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                    Font cellFont = new Font(baseFont, 10, Font.NORMAL);
                    Font headerFont = new Font(baseFont, 10, Font.BOLD);

                    table.addCell(new PdfPCell(new Phrase("Całkowity przychód", headerFont)));
                    table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("total_revenue")), cellFont)));

                    table.addCell(new PdfPCell(new Phrase("Liczba sprzedanych nocy", headerFont)));
                    table.addCell(new PdfPCell(new Phrase(String.valueOf(financialSummary.get("total_nights_sold")), cellFont)));

                    table.addCell(new PdfPCell(new Phrase("Średnia stawka dzienna", headerFont)));
                    table.addCell(new PdfPCell(new Phrase(formatCurrency(financialSummary.get("avg_daily_rate")), cellFont)));
                } catch (Exception e) {
                    throw new DocumentException("Błąd podczas tworzenia tabeli podsumowania finansowego", e);
                }

                document.add(table);
            }
        }

        if (financialData != null && financialData.containsKey("revenueByPeriod")) {
            List<Map<String, Object>> revenueByPeriod = (List<Map<String, Object>>) financialData.get("revenueByPeriod");

            if (revenueByPeriod != null && !revenueByPeriod.isEmpty()) {
                addSectionTitle(document, "2.2. Przychody w okresie");

                // Bierzemy maksymalnie 5 ostatnich okresów
                int rowsToShow = Math.min(revenueByPeriod.size(), 5);
                List<Map<String, Object>> recentPeriods = revenueByPeriod.subList(
                        revenueByPeriod.size() - rowsToShow, revenueByPeriod.size());

                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                addTableHeader(table, new String[] {"Okres", "Liczba rezerwacji", "Przychód"});

                try {
                    BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                    Font cellFont = new Font(baseFont, 10, Font.NORMAL);

                    for (Map<String, Object> period : recentPeriods) {
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(period.get("period")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(period.get("reservation_count")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(formatCurrency(period.get("total_revenue")), cellFont)));
                    }
                } catch (Exception e) {
                    throw new DocumentException("Błąd podczas tworzenia tabeli przychodów w okresie", e);
                }

                document.add(table);
            }
        }
    }

    private void addRoomsSummary(Document document, Map<String, Object> roomsReport) throws DocumentException {
        Map<String, Object> roomStatusData = (Map<String, Object>) roomsReport.get("roomStatus");

        if (roomStatusData != null && roomStatusData.containsKey("roomStatus")) {
            addSectionTitle(document, "3.1. Status pokojów");
            List<Map<String, Object>> roomStatus = (List<Map<String, Object>>) roomStatusData.get("roomStatus");

            if (roomStatus != null && !roomStatus.isEmpty()) {
                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                addTableHeader(table, new String[] {"Status", "Liczba pokojów", "Procent (%)"});

                try {
                    BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                    Font cellFont = new Font(baseFont, 10, Font.NORMAL);

                    for (Map<String, Object> status : roomStatus) {
                        table.addCell(new PdfPCell(new Phrase(formatRoomStatus(String.valueOf(status.get("status"))), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(status.get("count")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(status.get("percentage")) + "%", cellFont)));
                    }
                } catch (Exception e) {
                    throw new DocumentException("Błąd podczas tworzenia tabeli statusu pokojów", e);
                }

                document.add(table);
            }
        }

        if (roomStatusData != null && roomStatusData.containsKey("roomsNeedingMaintenance")) {
            List<Map<String, Object>> roomsNeedingMaintenance =
                    (List<Map<String, Object>>) roomStatusData.get("roomsNeedingMaintenance");

            if (roomsNeedingMaintenance != null && !roomsNeedingMaintenance.isEmpty()) {
                addSectionTitle(document, "3.2. Pokoje wymagające konserwacji");

                // Ograniczamy do 5 najbardziej pilnych przypadków
                int rowsToShow = Math.min(roomsNeedingMaintenance.size(), 5);
                List<Map<String, Object>> urgentRooms = roomsNeedingMaintenance.subList(0, rowsToShow);

                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                addTableHeader(table, new String[] {"Pokój", "Problem", "Data zgłoszenia"});

                try {
                    BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                    Font cellFont = new Font(baseFont, 10, Font.NORMAL);

                    for (Map<String, Object> room : urgentRooms) {
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("room_number")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(room.get("maintenance_issue")), cellFont)));
                        table.addCell(new PdfPCell(new Phrase(String.valueOf(formatDate(String.valueOf(room.get("request_date")))), cellFont)));
                    }
                } catch (Exception e) {
                    throw new DocumentException("Błąd podczas tworzenia tabeli pokojów wymagających konserwacji", e);
                }

                document.add(table);

                if (roomsNeedingMaintenance.size() > 5) {
                    try {
                        BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
                        Font noteFont = new Font(baseFont, 10, Font.ITALIC);
                        Paragraph note = new Paragraph("* Pokazano tylko 5 najbardziej pilnych zgłoszeń. Pełny raport dostępny w sekcji pokojów.", noteFont);
                        note.setAlignment(Element.ALIGN_CENTER);
                        note.setSpacingBefore(5);
                        document.add(note);
                    } catch (Exception e) {
                        throw new DocumentException("Błąd podczas dodawania notatki o ograniczeniu wyników", e);
                    }
                }
            }
        }
    }

    // Metody pomocnicze do formatowania

    private void addTableHeader(PdfPTable table, String[] headers) {
        try {
            BaseFont baseFont = createPolishFont();
            Font headerFont = new Font(baseFont, 10, Font.BOLD, BaseColor.WHITE);
            BaseColor headerBackground = new BaseColor(66, 139, 202); // Niebieski

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(headerBackground);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }
        } catch (Exception e) {
            // Logowanie błędu
            e.printStackTrace();
        }
    }

    private String formatCurrency(Object value) {
        if (value == null) {
            return "0.00 PLN";
        }
        return String.format("%.2f PLN", Double.parseDouble(value.toString()));
    }

    private Phrase formatDate(String dateString) throws DocumentException {
        try {
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.NOT_EMBEDDED);
            Font cellFont = new Font(baseFont, 10, Font.NORMAL);

            if (dateString == null || dateString.isEmpty() || dateString.equals("null")) {
                return new Phrase("-", cellFont);
            }

            try {
                // Zakładamy, że data ma format ISO (yyyy-MM-dd) lub zawiera timestamp
                if (dateString.contains("T")) {
                    // Format z timestampem
                    LocalDate date = LocalDate.parse(dateString.split("T")[0]);
                    return new Phrase(date.format(DATE_FORMATTER), cellFont);
                } else {
                    // Format bez timestampa
                    LocalDate date = LocalDate.parse(dateString);
                    return new Phrase(date.format(DATE_FORMATTER), cellFont);
                }
            } catch (Exception e) {
                return new Phrase(dateString, cellFont); // W razie błędu zwracamy oryginalny string
            }
        } catch (Exception e) {
            throw new DocumentException("Błąd podczas formatowania daty", e);
        }
    }

    private String formatRoomStatus(String status) {
        if (status == null) {
            return "-";
        }

        switch (status) {
            case "AVAILABLE":
                return "Dostępny";
            case "OCCUPIED":
                return "Zajęty";
            case "CLEANING":
                return "Sprzątanie";
            case "MAINTENANCE":
                return "Konserwacja";
            case "OUT_OF_SERVICE":
                return "Wyłączony z użytku";
            default:
                return status;
        }
    }

    private String getPolishPeriodName(String period) {
        if (period == null) {
            return "tygodniowe";
        }

        switch (period.toLowerCase()) {
            case "week":
                return "tygodniowe";
            case "month":
                return "miesięczne";
            case "quarter":
                return "kwartalne";
            default:
                return "dzienne";
        }
    }
}