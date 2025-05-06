package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Report;
import com.hoteltaskmanager.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCreatedById(Long employeeId);
    List<Report> findByReportType(ReportType reportType);
}