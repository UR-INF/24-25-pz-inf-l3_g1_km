package com.hoteltaskmanager.service;

import com.hoteltaskmanager.model.Invoice;
import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.model.ReservationRoom;
import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.repository.InvoiceRepository;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Serwis odpowiedzialny za generowanie i zarządzanie fakturami.
 */
@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ReservationRepository reservationRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, ReservationRepository reservationRepository) {
        this.invoiceRepository = invoiceRepository;
        this.reservationRepository = reservationRepository;
    }

    /**
     * Generuje fakturę na podstawie ID rezerwacji i danych firmy.
     */
    public Invoice generateInvoice(Long reservationId, String nip, String companyName, String companyAddress) throws Exception {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Rezerwacja nie istnieje"));

        Invoice invoice = new Invoice();
        invoice.setIssueDate(LocalDate.now());
        invoice.setCompanyNip(nip);
        invoice.setCompanyName(companyName);
        invoice.setCompanyAddress(companyAddress);

        String fileName = "invoice-" + UUID.randomUUID() + ".pdf";
        String pdfPath = "invoices/" + fileName;

        List<ReservationRoom> reservationRooms = reservation.getReservationRooms();
        generatePdfFile(invoice, reservation, reservationRooms, pdfPath);

        invoice.setPdfFile(pdfPath);
        invoice = invoiceRepository.save(invoice);

        reservation.setInvoice(invoice);
        reservationRepository.save(reservation);

        return invoice;
    }

    /**
     * Tworzy plik PDF z fakturą na dysku.
     */
    private void generatePdfFile(Invoice invoice, Reservation reservation, List<ReservationRoom> reservationRooms, String filePath) throws Exception {
        Document document = new Document();
        Files.createDirectories(Paths.get("invoices"));
        PdfWriter.getInstance(document, new FileOutputStream(filePath));
        document.open();

        BaseFont baseFont = BaseFont.createFont("src/main/resources/fonts/LexendPeta-VariableFont_wght.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        Font normalFont = new Font(baseFont, 12);
        Font boldFont = new Font(baseFont, 12, Font.BOLD);
        Font titleFont = new Font(baseFont, 18, Font.BOLD);

        Paragraph title = new Paragraph("FAKTURA", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        PdfPTable parties = new PdfPTable(2);
        parties.setWidthPercentage(100);
        parties.setSpacingBefore(10f);

        PdfPCell cell1 = new PdfPCell();
        cell1.setBorder(Rectangle.NO_BORDER);
        cell1.addElement(new Paragraph("Sprzedawca:", boldFont));
        cell1.addElement(new Paragraph("Hotel Example Sp. z o.o.", normalFont));
        cell1.addElement(new Paragraph("ul. Rejtana 12", normalFont));
        cell1.addElement(new Paragraph("31-555 Rzeszów", normalFont));
        cell1.addElement(new Paragraph("NIP: 123-456-78-90", normalFont));

        PdfPCell cell2 = new PdfPCell();
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.addElement(new Paragraph("Nabywca:", boldFont));
        cell2.addElement(new Paragraph(invoice.getCompanyName(), normalFont));
        cell2.addElement(new Paragraph(invoice.getCompanyAddress(), normalFont));
        cell2.addElement(new Paragraph("NIP: " + invoice.getCompanyNip(), normalFont));

        parties.addCell(cell1);
        parties.addCell(cell2);
        document.add(parties);

        document.add(new Paragraph("\nData wystawienia: " + invoice.getIssueDate(), normalFont));
        document.add(new Paragraph("Gość: " + reservation.getGuestFirstName() + " " + reservation.getGuestLastName(), normalFont));
        document.add(new Paragraph("PESEL: " + reservation.getGuestPesel(), normalFont));
        document.add(new Paragraph("Telefon: " + reservation.getGuestPhone(), normalFont));

        document.add(new Paragraph("\n"));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new int[]{2, 1, 1, 2, 2, 2, 2});

        table.addCell(new PdfPCell(new Phrase("Pokój", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Dni", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Osoby", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Cena za dzień", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Netto", boldFont)));
        table.addCell(new PdfPCell(new Phrase("VAT 8%", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Brutto", boldFont)));


        long days = ChronoUnit.DAYS.between(reservation.getStartDate(), reservation.getEndDate());

        double totalBrutto = 0;
        double totalNetto = 0;
        double totalVat = 0;

        for (ReservationRoom rr : reservationRooms) {
            Room room = rr.getRoom();
            int guests = rr.getGuestCount();
            BigDecimal pricePerNight = room.getPricePerNight();

            int maxGuests = room.getBedCount();
            BigDecimal pricePerGuest = pricePerNight.divide(BigDecimal.valueOf(maxGuests), 2, RoundingMode.HALF_UP);
            BigDecimal brutto = pricePerGuest.multiply(BigDecimal.valueOf(guests)).multiply(BigDecimal.valueOf(days));

            BigDecimal netto = brutto.divide(BigDecimal.valueOf(1.08), 2, RoundingMode.HALF_UP);
            BigDecimal vat = brutto.subtract(netto);

            table.addCell(new PdfPCell(new Phrase("Pokój " + room.getRoomNumber(), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(days), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(guests), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", pricePerGuest), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", netto), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", vat), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", brutto), normalFont)));

            totalNetto += netto.doubleValue();
            totalVat += vat.doubleValue();
            totalBrutto += brutto.doubleValue();
        }


        PdfPCell sumLabel = new PdfPCell(new Phrase("Razem", boldFont));
        sumLabel.setColspan(4);
        sumLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(sumLabel);
        table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", totalNetto), boldFont)));
        table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", totalVat), boldFont)));
        table.addCell(new PdfPCell(new Phrase(String.format("%.2f zł", totalBrutto), boldFont)));


        document.add(table);

        document.add(new Paragraph("\nForma płatności: Gotówka", normalFont));
        document.add(new Paragraph("Dziękujemy za skorzystanie z naszych usług!", normalFont));

        document.close();
    }

    /**
     * Pobiera wszystkie faktury z bazy danych.
     */
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    /**
     * Pobiera fakturę po jej ID.
     */
    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    /**
     * Pobiera fakturę powiązaną z konkretną rezerwacją.
     */
    public Optional<Invoice> getInvoiceByReservationId(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .map(Reservation::getInvoice);
    }

    /**
     * Zwraca zawartość pliku PDF jako zasób (Resource).
     */
    public Resource getInvoicePdf(Long id) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isEmpty()) return null;

        Invoice invoice = invoiceOpt.get();
        try {
            byte[] fileContent = Files.readAllBytes(Paths.get(invoice.getPdfFile()));
            return new ByteArrayResource(fileContent) {
                @Override
                public String getFilename() {
                    return Paths.get(invoice.getPdfFile()).getFileName().toString();
                }
            };
        } catch (Exception e) {
            System.err.println("Nie udało się odczytać pliku PDF: " + e.getMessage());
            return null;
        }
    }

    /**
     * Usuwa fakturę i powiązany plik PDF.
     */
    public boolean deleteInvoice(Long id) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isEmpty()) return false;

        Invoice invoice = invoiceOpt.get();
        deletePdfFile(invoice.getPdfFile());

        invoiceRepository.deleteById(id);
        return true;
    }

    /**
     * Aktualizuje dane istniejącej faktury i generuje nowy plik PDF.
     */
    public Optional<Invoice> updateInvoice(Long id, Long reservationId, Invoice updatedInvoice) {
        return invoiceRepository.findById(id).map(existingInvoice -> {

            // Usuń stary plik faktury
            deletePdfFile(existingInvoice.getPdfFile());

            // Aktualizacja danych faktury
            existingInvoice.setIssueDate(updatedInvoice.getIssueDate());
            existingInvoice.setCompanyNip(updatedInvoice.getCompanyNip());
            existingInvoice.setCompanyName(updatedInvoice.getCompanyName());
            existingInvoice.setCompanyAddress(updatedInvoice.getCompanyAddress());

            // Pobierz powiązaną rezerwację
            Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Rezerwacja nie istnieje"));

            // Wygeneruj nowy PDF
            String newFileName = "invoice-" + UUID.randomUUID() + ".pdf";
            String newPdfPath = "invoices/" + newFileName;

            try {
                List<ReservationRoom> reservationRooms = reservation.getReservationRooms();
                generatePdfFile(existingInvoice, reservation, reservationRooms, newPdfPath);
            } catch (Exception e) {
                throw new RuntimeException("Błąd podczas generowania nowego pliku PDF", e);
            }

            existingInvoice.setPdfFile(newPdfPath);

            return invoiceRepository.save(existingInvoice);
        });
    }

    /**
     * Usuwa plik PDF faktury z dysku, jeśli istnieje.
     */
    private void deletePdfFile(String filePath) {
        if (filePath != null) {
            try {
                Files.deleteIfExists(Paths.get(filePath));
            } catch (Exception e) {
                System.err.println("Błąd podczas usuwania pliku PDF: " + e.getMessage());
            }
        }
    }
}
