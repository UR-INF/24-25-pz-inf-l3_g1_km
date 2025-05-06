package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.MaintenanceRequest;
import com.hoteltaskmanager.model.MaintenanceStatus;
import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.repository.MaintenanceRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla {@link MaintenanceRequestController}.
 * <p>
 * Zakres testów:
 * <ul>
 *     <li>Pobieranie wszystkich zgłoszeń</li>
 *     <li>Pobieranie zgłoszenia po ID</li>
 *     <li>Tworzenie nowego zgłoszenia</li>
 *     <li>Aktualizacja zgłoszenia</li>
 *     <li>Usuwanie zgłoszenia</li>
 *     <li>Filtrowanie zgłoszeń po statusie</li>
 *     <li>Filtrowanie zgłoszeń po pokoju</li>
 *     <li>Filtrowanie zgłoszeń po pracowniku</li>
 * </ul>
 */
@WithMockUser(username = "test@example.com", roles = "MANAGER")
@ExtendWith(MockitoExtension.class)
class MaintenanceRequestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @InjectMocks
    private MaintenanceRequestController maintenanceRequestController;

    private MaintenanceRequest testRequest;
    private Employee requester;
    private Employee assignee;
    private Room room;

    @BeforeEach
    void setUp() {
        // Inicjalizacja obiektów testowych
        requester = new Employee();
        requester.setId(1L);
        requester.setEmail("requester@example.com");

        assignee = new Employee();
        assignee.setId(2L);
        assignee.setEmail("assignee@example.com");

        room = new Room();
        room.setId(1L);
        room.setRoomNumber("101");

        testRequest = new MaintenanceRequest();
        testRequest.setId(1L);
        testRequest.setRequester(requester);
        testRequest.setAssignee(assignee);
        testRequest.setRoom(room);
        testRequest.setRequestDate(LocalDateTime.now());
        testRequest.setStatus(MaintenanceStatus.PENDING);
        testRequest.setDescription("Naprawa kranu w łazience");

        // Konfiguracja MockMvc
        mockMvc = MockMvcBuilders
                .standaloneSetup(maintenanceRequestController)
                .build();
    }

    // ---------------- READ ----------------

    /**
     * Test pobierania wszystkich zgłoszeń serwisowych.
     */
    @Test
    void shouldReturnAllRequests() throws Exception {
        when(maintenanceRequestRepository.findAll()).thenReturn(List.of(testRequest));

        mockMvc.perform(get("/api/maintenance-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].description").value("Naprawa kranu w łazience"));
    }

    /**
     * Test pobierania zgłoszenia po ID.
     */
    @Test
    void shouldReturnRequestById() throws Exception {
        when(maintenanceRequestRepository.findById(1L)).thenReturn(Optional.of(testRequest));

        mockMvc.perform(get("/api/maintenance-requests/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.description").value("Naprawa kranu w łazience"));
    }

    /**
     * Test pobierania nieistniejącego zgłoszenia.
     */
    @Test
    void shouldReturnNotFoundForNonExistentRequest() throws Exception {
        when(maintenanceRequestRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/maintenance-requests/99"))
                .andExpect(status().isNotFound());
    }

    // ---------------- CREATE ----------------

    /**
     * Test tworzenia nowego zgłoszenia serwisowego.
     */
    @Test
    void shouldCreateRequest() throws Exception {
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenReturn(testRequest);

        String payload = """
            {
              "requester": {"id": 1},
              "assignee": {"id": 2},
              "room": {"id": 1},
              "status": "PENDING",
              "description": "Naprawa kranu w łazience",
              "requestDate": "2025-05-01T10:00:00"
            }
        """;

        mockMvc.perform(post("/api/maintenance-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.description").value("Naprawa kranu w łazience"));
    }

    // ---------------- UPDATE ----------------

    /**
     * Test aktualizacji zgłoszenia serwisowego.
     */
    @Test
    void shouldUpdateRequest() throws Exception {
        MaintenanceRequest updatedRequest = new MaintenanceRequest();
        updatedRequest.setId(1L);
        updatedRequest.setRequester(requester);
        updatedRequest.setAssignee(assignee);
        updatedRequest.setRoom(room);
        updatedRequest.setStatus(MaintenanceStatus.COMPLETED);
        updatedRequest.setDescription("Naprawa kranu w łazience - zakończone");
        updatedRequest.setServiceSummary("Wymieniono uszczelkę w kranie");
        updatedRequest.setRequestDate(testRequest.getRequestDate());
        updatedRequest.setCompletionDate(LocalDateTime.now());

        when(maintenanceRequestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenReturn(updatedRequest);

        String payload = """
            {
              "requester": {"id": 1},
              "assignee": {"id": 2},
              "room": {"id": 1},
              "status": "COMPLETED",
              "description": "Naprawa kranu w łazience - zakończone",
              "serviceSummary": "Wymieniono uszczelkę w kranie",
              "requestDate": "2025-05-01T10:00:00",
              "completionDate": "2025-05-02T14:30:00"
            }
        """;

        mockMvc.perform(put("/api/maintenance-requests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.serviceSummary").value("Wymieniono uszczelkę w kranie"));
    }

    /**
     * Test aktualizacji nieistniejącego zgłoszenia.
     */
    @Test
    void shouldReturnNotFoundWhenUpdatingNonExistentRequest() throws Exception {
        when(maintenanceRequestRepository.findById(99L)).thenReturn(Optional.empty());

        String payload = """
            {
              "requester": {"id": 1},
              "assignee": {"id": 2},
              "room": {"id": 1},
              "status": "COMPLETED",
              "description": "Naprawa kranu w łazience - zakończone"
            }
        """;

        mockMvc.perform(put("/api/maintenance-requests/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound());
    }

    // ---------------- DELETE ----------------

    /**
     * Test usuwania zgłoszenia serwisowego.
     */
    @Test
    void shouldDeleteRequest() throws Exception {
        when(maintenanceRequestRepository.existsById(1L)).thenReturn(true);
        doNothing().when(maintenanceRequestRepository).deleteById(1L);

        mockMvc.perform(delete("/api/maintenance-requests/1"))
                .andExpect(status().isNoContent());
    }

    /**
     * Test usuwania nieistniejącego zgłoszenia.
     */
    @Test
    void shouldReturnNotFoundWhenDeletingNonExistentRequest() throws Exception {
        when(maintenanceRequestRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/maintenance-requests/99"))
                .andExpect(status().isNotFound());
    }

    // ---------------- FILTERS ----------------

    /**
     * Test filtrowania zgłoszeń po statusie.
     */
    @Test
    void shouldReturnRequestsByStatus() throws Exception {
        when(maintenanceRequestRepository.findByStatus(MaintenanceStatus.PENDING))
                .thenReturn(List.of(testRequest));

        mockMvc.perform(get("/api/maintenance-requests/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    /**
     * Test filtrowania zgłoszeń po pokoju.
     */
    @Test
    void shouldReturnRequestsByRoom() throws Exception {
        when(maintenanceRequestRepository.findByRoomId(1L)).thenReturn(List.of(testRequest));

        mockMvc.perform(get("/api/maintenance-requests/room/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].room.id").value(1));
    }

    /**
     * Test filtrowania zgłoszeń po konserwatorze.
     */
    @Test
    void shouldReturnRequestsByAssignee() throws Exception {
        when(maintenanceRequestRepository.findByAssigneeId(2L)).thenReturn(List.of(testRequest));

        mockMvc.perform(get("/api/maintenance-requests/assignee/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].assignee.id").value(2));
    }
}