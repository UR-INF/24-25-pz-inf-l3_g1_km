package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Invoice;
import com.hoteltaskmanager.service.InvoiceService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API dla zarządzania fakturami.
 *
 * Dostępne endpointy:
 *
 * GET    /api/invoices                          - Pobierz wszystkie faktury
 * GET    /api/invoices/{id}                     - Pobierz fakturę po ID
 * GET    /api/invoices/reservation/{id}         - Pobierz fakturę przypisaną do rezerwacji
 * GET    /api/invoices/{id}/pdf                 - Pobierz plik PDF faktury
 * POST   /api/invoices/reservation/{id}         - Wygeneruj fakturę dla rezerwacji
 * DELETE /api/invoices/{id}                     - Usuń fakturę po ID
 */
@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    /**
     * POST /api/invoices/reservation/{reservationId}
     * Tworzy nową fakturę dla danej rezerwacji.
     */
    @PostMapping("/reservation/{reservationId}")
    public ResponseEntity<Invoice> generateForReservation(
            @PathVariable Long reservationId,
            @RequestParam String nip,
            @RequestParam String companyName,
            @RequestParam String companyAddress
    ) {
        try {
            Invoice invoice = invoiceService.generateInvoice(reservationId, nip, companyName, companyAddress);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/invoices
     * Pobierz listę wszystkich faktur
     */
    @GetMapping
    public List<Invoice> getAll() {
        return invoiceService.getAllInvoices();
    }

    /**
     * GET /api/invoices/{id}
     * Pobierz fakturę po jej identyfikatorze
     */
    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/invoices/reservation/{reservationId}
     * Pobierz fakturę przypisaną do danej rezerwacji
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<Invoice> getByReservationId(@PathVariable Long reservationId) {
        return invoiceService.getInvoiceByReservationId(reservationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/invoices/{id}/pdf
     * Pobierz plik PDF faktury
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long id) {
        Resource pdfResource = invoiceService.getInvoicePdf(id);
        if (pdfResource == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + pdfResource.getFilename())
                .body(pdfResource);
    }

    /**
     * DELETE /api/invoices/{id}
     * Usuń fakturę z systemu
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = invoiceService.deleteInvoice(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
