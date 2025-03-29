package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.HousekeepingTask;
import com.hoteltaskmanager.model.HousekeepingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {

    /**
     * Znajduje zadania według statusu.
     */
    List<HousekeepingTask> findByStatus(HousekeepingStatus status);

    /**
     * Znajduje zadania przypisane do pracownika o podanym ID.
     */
    List<HousekeepingTask> findByEmployeeId(Long employeeId);
}
