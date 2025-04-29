package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.MaintenanceRequest;
import com.hoteltaskmanager.model.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    /**
     * Znajduje zgłoszenia dla danego pokoju.
     */
    List<MaintenanceRequest> findByRoomId(Long roomId);

    /**
     * Znajduje zgłoszenia według statusu.
     */
    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);

    /**
     * Znajduje zgłoszenia przypisane danemu pracownikowi.
     */
    List<MaintenanceRequest> findByAssigneeId(Long assigneeId);

    /**
     * Znajduje zgłoszenia jakie zgłosił dany pracownik.
     */
    List<MaintenanceRequest> findByRequesterId(Long requesterId);
}
