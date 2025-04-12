package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
}
