package com.hoteltaskmanager.service;

import com.hoteltaskmanager.model.Invoice;
import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.repository.InvoiceRepository;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

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

        generatePdfFile(invoice, reservation, pdfPath);

        invoice.setPdfFile(pdfPath);
        invoice = invoiceRepository.save(invoice);

        reservation.setInvoice(invoice);
        reservationRepository.save(reservation);

        return invoice;
    }

    /**
     * Tworzy plik PDF z fakturą na dysku.
     */
    private void generatePdfFile(Invoice invoice, Reservation reservation, String filePath) throws Exception {
        Document document = new Document();
        Files.createDirectories(Paths.get("invoices"));
        PdfWriter.getInstance(document, new FileOutputStream(filePath));
        document.open();

        document.add(new Paragraph("FAKTURA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20)));
        document.add(new Paragraph("Data wystawienia: " + invoice.getIssueDate()));
        document.add(new Paragraph("Numer PESEL gościa: " + reservation.getGuestPesel()));
        document.add(new Paragraph("Imię i nazwisko: " + reservation.getGuestFirstName() + " " + reservation.getGuestLastName()));
        document.add(new Paragraph("Telefon: " + reservation.getGuestPhone()));
        document.add(new Paragraph("Firma: " + invoice.getCompanyName()));
        document.add(new Paragraph("NIP: " + invoice.getCompanyNip()));
        document.add(new Paragraph("Adres firmy: " + invoice.getCompanyAddress()));

        document.add(new Paragraph("\nInformacje o pobycie:"));
        document.add(new Paragraph("Pobyt: " + reservation.getStartDate() + " - " + reservation.getEndDate()));
        document.add(new Paragraph("Status: " + reservation.getStatus()));
        document.add(new Paragraph("Catering: " + (reservation.isCatering() ? "Tak" : "Nie")));
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
     * Zwraca zawartość pliku PDF jako tablica bajtów.
     */
    public byte[] getInvoicePdf(String filePath) throws Exception {
        return Files.readAllBytes(Paths.get(filePath));
    }

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

    public boolean deleteInvoice(Long id) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isEmpty()) return false;

        Invoice invoice = invoiceOpt.get();

        // Usuń plik PDF z dysku, jeśli istnieje
        try {
            if (invoice.getPdfFile() != null) {
                Files.deleteIfExists(Paths.get(invoice.getPdfFile()));
            }
        } catch (Exception e) {
            System.err.println("Błąd podczas usuwania pliku faktury: " + e.getMessage());
        }

        invoiceRepository.deleteById(id);
        return true;
    }
}
