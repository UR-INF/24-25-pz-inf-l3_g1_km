package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * Reprezentuje fakturę powiązaną z rezerwacją, zawiera dane firmy.
 */
@Data
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Data wystawienia faktury.
     */
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    /**
     * Ścieżka lub nazwa pliku faktury PDF.
     */
    @Column(name = "pdf_file")
    private String pdfFile;

    /**
     * NIP firmy (jeśli faktura jest na firmę).
     */
    @Column(name = "company_nip", length = 20)
    private String companyNip;

    /**
     * Nazwa firmy.
     */
    @Column(name = "company_name", length = 100)
    private String companyName;

    /**
     * Adres firmy.
     */
//    @Column(name = "company_address")
//    private String companyAddress;

    @Column(name = "company_street", length = 100)
    private String companyStreet;

    @Column(name = "company_building_no", length = 20)
    private String companyBuildingNo;

    @Column(name = "company_postal_code", length = 20)
    private String companyPostalCode;

    @Column(name = "company_city", length = 100)
    private String companyCity;

    @Column(name = "company_country", length = 100)
    private String companyCountry;
}
