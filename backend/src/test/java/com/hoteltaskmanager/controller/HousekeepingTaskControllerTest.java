package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.HousekeepingStatus;
import com.hoteltaskmanager.model.HousekeepingTask;
import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.repository.HousekeepingTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
 * Testy jednostkowe dla {@link HousekeepingTaskController}.
 * <p>
 * Zakres testów:
 * <ul>
 *     <li>Pobieranie wszystkich zadań sprzątania</li>
 *     <li>Pobieranie zadania po ID</li>
 *     <li>Tworzenie nowego zadania</li>
 *     <li>Aktualizacja zadania</li>
 *     <li>Usuwanie zadania</li>
 *     <li>Filtrowanie zadań po statusie</li>
 *     <li>Filtrowanie zadań po pracowniku</li>
 * </ul>
 */
@WithMockUser(username = "test@example.com", roles = "MANAGER")
@ExtendWith(MockitoExtension.class)
class HousekeepingTaskControllerTest {

    private MockMvc mockMvc;

    @Mock
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @InjectMocks
    private HousekeepingTaskController housekeepingTaskController;

    private HousekeepingTask testTask;
    private Employee employee;
    private Room room;

    @BeforeEach
    void setUp() {
        // Inicjalizacja obiektów testowych
        employee = new Employee();
        employee.setId(1L);
        employee.setEmail("housekeeper@example.com");
        employee.setFirstName("Anna");
        employee.setLastName("Nowak");

        room = new Room();
        room.setId(1L);
        room.setRoomNumber("201");

        testTask = new HousekeepingTask();
        testTask.setId(1L);
        testTask.setEmployee(employee);
        testTask.setRoom(room);
        testTask.setRequestDate(LocalDateTime.now());
        testTask.setStatus(HousekeepingStatus.PENDING);
        testTask.setDescription("Standardowe sprzątanie pokoju");

        // Konfiguracja MockMvc
        mockMvc = MockMvcBuilders
                .standaloneSetup(housekeepingTaskController)
                .build();
    }

    // ---------------- READ ----------------

    /**
     * Test pobierania wszystkich zadań sprzątania.
     */
    @Test
    void shouldReturnAllTasks() throws Exception {
        when(housekeepingTaskRepository.findAll()).thenReturn(List.of(testTask));

        mockMvc.perform(get("/api/housekeeping-tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].description").value("Standardowe sprzątanie pokoju"));
    }

    /**
     * Test pobierania zadania po ID.
     */
    @Test
    void shouldReturnTaskById() throws Exception {
        when(housekeepingTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        mockMvc.perform(get("/api/housekeeping-tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.description").value("Standardowe sprzątanie pokoju"));
    }

    /**
     * Test pobierania nieistniejącego zadania.
     */
    @Test
    void shouldReturnNotFoundForNonExistentTask() throws Exception {
        when(housekeepingTaskRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/housekeeping-tasks/99"))
                .andExpect(status().isNotFound());
    }

    // ---------------- CREATE ----------------

    /**
     * Test tworzenia nowego zadania sprzątania.
     */
    @Test
    void shouldCreateTask() throws Exception {
        when(housekeepingTaskRepository.save(any(HousekeepingTask.class))).thenReturn(testTask);

        String payload = """
            {
              "employee": {"id": 1},
              "room": {"id": 1},
              "status": "PENDING",
              "description": "Standardowe sprzątanie pokoju",
              "requestDate": "2025-05-01T10:00:00"
            }
        """;

        mockMvc.perform(post("/api/housekeeping-tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.description").value("Standardowe sprzątanie pokoju"));
    }

    // ---------------- UPDATE ----------------

    /**
     * Test aktualizacji zadania sprzątania.
     */
    @Test
    void shouldUpdateTask() throws Exception {
        HousekeepingTask updatedTask = new HousekeepingTask();
        updatedTask.setId(1L);
        updatedTask.setEmployee(employee);
        updatedTask.setRoom(room);
        updatedTask.setStatus(HousekeepingStatus.COMPLETED);
        updatedTask.setDescription("Standardowe sprzątanie pokoju - zakończone");
        updatedTask.setRequestDate(testTask.getRequestDate());
        updatedTask.setCompletionDate(LocalDateTime.now());

        when(housekeepingTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(housekeepingTaskRepository.save(any(HousekeepingTask.class))).thenReturn(updatedTask);

        String payload = """
            {
              "employee": {"id": 1},
              "room": {"id": 1},
              "status": "COMPLETED",
              "description": "Standardowe sprzątanie pokoju - zakończone",
              "requestDate": "2025-05-01T10:00:00",
              "completionDate": "2025-05-01T11:30:00"
            }
        """;

        mockMvc.perform(put("/api/housekeeping-tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.description").value("Standardowe sprzątanie pokoju - zakończone"));
    }

    /**
     * Test aktualizacji nieistniejącego zadania.
     */
    @Test
    void shouldReturnNotFoundWhenUpdatingNonExistentTask() throws Exception {
        when(housekeepingTaskRepository.findById(99L)).thenReturn(Optional.empty());

        String payload = """
            {
              "employee": {"id": 1},
              "room": {"id": 1},
              "status": "COMPLETED",
              "description": "Standardowe sprzątanie pokoju - zakończone"
            }
        """;

        mockMvc.perform(put("/api/housekeeping-tasks/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound());
    }

    // ---------------- DELETE ----------------

    /**
     * Test usuwania zadania sprzątania.
     */
    @Test
    void shouldDeleteTask() throws Exception {
        when(housekeepingTaskRepository.existsById(1L)).thenReturn(true);
        doNothing().when(housekeepingTaskRepository).deleteById(1L);

        mockMvc.perform(delete("/api/housekeeping-tasks/1"))
                .andExpect(status().isNoContent());
    }

    /**
     * Test usuwania nieistniejącego zadania.
     */
    @Test
    void shouldReturnNotFoundWhenDeletingNonExistentTask() throws Exception {
        when(housekeepingTaskRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/housekeeping-tasks/99"))
                .andExpect(status().isNotFound());
    }

    // ---------------- FILTERS ----------------

    /**
     * Test filtrowania zadań po statusie.
     */
    @Test
    void shouldReturnTasksByStatus() throws Exception {
        when(housekeepingTaskRepository.findByStatus(HousekeepingStatus.PENDING))
                .thenReturn(List.of(testTask));

        mockMvc.perform(get("/api/housekeeping-tasks/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    /**
     * Test filtrowania zadań po pracowniku.
     */
    @Test
    void shouldReturnTasksByEmployee() throws Exception {
        when(housekeepingTaskRepository.findByEmployeeId(1L)).thenReturn(List.of(testTask));

        mockMvc.perform(get("/api/housekeeping-tasks/employee/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].employee.id").value(1));
    }
}