package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Invoice;
import com.hoteltaskmanager.service.InvoiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla {@link InvoiceController}.
 * <p>
 * Zakres testów:
 * <ul>
 *     <li>Generowanie faktury dla rezerwacji</li>
 *     <li>Odczyt wszystkich faktur</li>
 *     <li>Odczyt faktury po ID</li>
 *     <li>Odczyt faktury po ID rezerwacji</li>
 *     <li>Pobieranie faktury w formacie PDF</li>
 *     <li>Usuwanie faktury</li>
 *     <li>Aktualizacja danych faktury</li>
 * </ul>
 */
@WithMockUser(username = "test@example.com", roles = "MANAGER")
@SpringBootTest
@AutoConfigureMockMvc
class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InvoiceService invoiceService;

    private Invoice sampleInvoice;

    /**
     * Przygotowanie próbnej faktury przed każdym testem.
     */
    @BeforeEach
    void setUp() {
        sampleInvoice = new Invoice();
        sampleInvoice.setId(1L);
        sampleInvoice.setIssueDate(LocalDate.now());
        sampleInvoice.setCompanyNip("1234567890");
        sampleInvoice.setCompanyName("Test Company");
        sampleInvoice.setCompanyStreet("Test Street");
        sampleInvoice.setCompanyBuildingNo("11A");
        sampleInvoice.setCompanyPostalCode("00-123");
        sampleInvoice.setCompanyCity("Test City");
        sampleInvoice.setCompanyCountry("Testland");
        sampleInvoice.setPdfFile("invoice-1.pdf");
    }
    // ---------------- CREATE ----------------

    /**
     * Test generowania faktury dla rezerwacji.
     */
    @Test
    void shouldGenerateInvoiceForReservation() throws Exception {
        sampleInvoice.setId(1L);
        sampleInvoice.setCompanyNip("1234567890");
        sampleInvoice.setCompanyName("Test Company");
        sampleInvoice.setCompanyStreet("Test Street");
        sampleInvoice.setCompanyBuildingNo("22B");
        sampleInvoice.setCompanyPostalCode("01-234");
        sampleInvoice.setCompanyCity("Test City");
        sampleInvoice.setCompanyCountry("Testland");
        sampleInvoice.setIssueDate(LocalDate.now());
        sampleInvoice.setPdfFile("invoice-101.pdf");

        when(invoiceService.generateInvoice(
                eq(101L),
                eq("1234567890"),
                eq("Test Company"),
                eq("Test Street"),
                eq("22B"),
                eq("01-234"),
                eq("Test City"),
                eq("Testland")
        )).thenReturn(sampleInvoice);

        mockMvc.perform(post("/api/invoices/reservation/101")
                        .param("nip", "1234567890")
                        .param("companyName", "Test Company")
                        .param("companyStreet", "Test Street")
                        .param("companyBuildingNo", "22B")
                        .param("companyPostalCode", "01-234")
                        .param("companyCity", "Test City")
                        .param("companyCountry", "Testland"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.companyNip").value("1234567890"))
                .andExpect(jsonPath("$.companyName").value("Test Company"))
                .andExpect(jsonPath("$.companyStreet").value("Test Street"))
                .andExpect(jsonPath("$.companyBuildingNo").value("22B"))
                .andExpect(jsonPath("$.companyPostalCode").value("01-234"))
                .andExpect(jsonPath("$.companyCity").value("Test City"))
                .andExpect(jsonPath("$.companyCountry").value("Testland"));
    }

    // ---------------- READ ----------------

    /**
     * Test odczytu wszystkich faktur.
     */
    @Test
    void shouldReturnAllInvoices() throws Exception {
        when(invoiceService.getAllInvoices()).thenReturn(List.of(sampleInvoice));

        mockMvc.perform(get("/api/invoices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    /**
     * Test odczytu faktury po ID.
     */
    @Test
    void shouldReturnInvoiceById() throws Exception {
        when(invoiceService.getInvoiceById(1L)).thenReturn(Optional.of(sampleInvoice));

        mockMvc.perform(get("/api/invoices/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    /**
     * Test odczytu faktury po ID rezerwacji.
     */
    @Test
    void shouldReturnInvoiceByReservationId() throws Exception {
        when(invoiceService.getInvoiceByReservationId(101L)).thenReturn(Optional.of(sampleInvoice));

        mockMvc.perform(get("/api/invoices/reservation/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    /**
     * Test pobierania faktury w formacie PDF.
     */
    @Test
    void shouldDownloadInvoicePdf() throws Exception {
        Resource pdfResource = new FileSystemResource("src/test/resources/invoice.pdf");
        when(invoiceService.getInvoicePdf(1L)).thenReturn(pdfResource);

        mockMvc.perform(get("/api/invoices/1/pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + pdfResource.getFilename()))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    // ---------------- DELETE ----------------

    /**
     * Test usuwania faktury.
     */
    @Test
    void shouldDeleteInvoice() throws Exception {
        when(invoiceService.deleteInvoice(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/invoices/1"))
                .andExpect(status().isNoContent());
    }

    // ---------------- UPDATE ----------------

    /**
     * Test aktualizacji danych faktury.
     */
    @Test
    void shouldUpdateInvoice() throws Exception {
        Invoice updatedInvoice = new Invoice();
        updatedInvoice.setId(1L);
        updatedInvoice.setCompanyNip("0987654321");
        updatedInvoice.setCompanyName("Updated Company");
        updatedInvoice.setCompanyStreet("Updated Street");
        updatedInvoice.setCompanyBuildingNo("12A");
        updatedInvoice.setCompanyPostalCode("00-001");
        updatedInvoice.setCompanyCity("Updated City");
        updatedInvoice.setCompanyCountry("Poland");
        updatedInvoice.setIssueDate(LocalDate.now());
        updatedInvoice.setPdfFile("invoice_1.pdf");

        when(invoiceService.updateInvoice(eq(1L), eq(101L), any(Invoice.class)))
                .thenReturn(Optional.of(updatedInvoice));

        String payload = """
                {
                  "companyNip": "0987654321",
                  "companyName": "Updated Company",
                  "companyStreet": "Updated Street",
                  "companyBuildingNo": "12A",
                  "companyPostalCode": "00-001",
                  "companyCity": "Updated City",
                  "companyCountry": "Poland"
                }
                """;

        mockMvc.perform(put("/api/invoices/1")
                        .param("reservationId", "101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyNip").value("0987654321"))
                .andExpect(jsonPath("$.companyName").value("Updated Company"))
                .andExpect(jsonPath("$.companyStreet").value("Updated Street"))
                .andExpect(jsonPath("$.companyBuildingNo").value("12A"))
                .andExpect(jsonPath("$.companyPostalCode").value("00-001"))
                .andExpect(jsonPath("$.companyCity").value("Updated City"))
                .andExpect(jsonPath("$.companyCountry").value("Poland"));
    }
}
