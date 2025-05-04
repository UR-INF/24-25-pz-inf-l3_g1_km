package com.hoteltaskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoteltaskmanager.model.Invoice;
import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.model.ReservationStatus;
import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.ReservationRoomRepository;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.service.InvoiceService;
import com.hoteltaskmanager.service.RoomStatusManagerService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla {@link ReservationController}.
 * <p>
 * Zakres testów:
 * <ul>
 *     <li>Tworzenie, aktualizacja i usuwanie rezerwacji</li>
 *     <li>Pobieranie rezerwacji po ID, statusie i dacie</li>
 * </ul>
 */
@WithMockUser(username = "test@example.com", roles = "USER")
@SpringBootTest
@AutoConfigureMockMvc
class ReservationControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ReservationRepository reservationRepository;
    @MockBean private ReservationRoomRepository reservationRoomRepository;
    @MockBean private InvoiceService invoiceService;
    @MockBean private RoomStatusManagerService roomStatusManagerService;
    @MockBean private EmployeeRepository employeeRepository;

    /**
     * Ustawienie mockowanego użytkownika.
     */
    @BeforeEach
    void setupLoggedUser() {
        Employee mockUser = new Employee();
        mockUser.setEmail("test@example.com");
        Role role = new Role();
        role.setName(RoleName.MANAGER);
        mockUser.setRole(role);

        when(employeeRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
    }

    // ---------------- CREATE ----------------

    /**
     * Test tworzenia rezerwacji.
     */
    @Test
    void shouldCreateReservation() throws Exception {
        Reservation reservation = new Reservation();
        reservation.setGuestFirstName("Mike");

        when(reservationRepository.save(any())).thenReturn(reservation);

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestFirstName").value("Mike"));

        verify(roomStatusManagerService).refreshRoomStatuses();
    }

    // ---------------- UPDATE ----------------

    /**
     * Test aktualizacji istniejącej rezerwacji.
     */
    @Test
    void shouldUpdateReservation() throws Exception {
        Reservation existing = new Reservation();
        existing.setId(1L);
        existing.setGuestFirstName("Old");

        Reservation updated = new Reservation();
        updated.setGuestFirstName("New");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(put("/api/reservations/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestFirstName").value("New"));

        verify(roomStatusManagerService).refreshRoomStatuses();
    }

    /**
     * Test aktualizacji nieistniejącej rezerwacji.
     */
    @Test
    void shouldReturnNotFoundWhenUpdatingNonexistentReservation() throws Exception {
        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        Reservation updated = new Reservation();
        updated.setGuestFirstName("Ghost");

        mockMvc.perform(put("/api/reservations/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isNotFound());
    }

    // ---------------- DELETE ----------------

    /**
     * Test usuwania rezerwacji bez faktury.
     */
    @Test
    void shouldDeleteReservationWithoutInvoice() throws Exception {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setInvoice(null);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        mockMvc.perform(delete("/api/reservations/1"))
                .andExpect(status().isNoContent());

        verify(reservationRepository).deleteById(1L);
        verify(roomStatusManagerService).refreshRoomStatuses();
    }

    /**
     * Test usuwania rezerwacji z powiązaną fakturą.
     */
    @Test
    void shouldDeleteReservationWithInvoice() throws Exception {
        Invoice invoice = new Invoice();
        invoice.setId(5L);
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setInvoice(invoice);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        mockMvc.perform(delete("/api/reservations/1"))
                .andExpect(status().isNoContent());

        verify(invoiceService).deleteInvoice(5L);
        verify(reservationRepository).deleteById(1L);
        verify(roomStatusManagerService).refreshRoomStatuses();
    }

    /**
     * Test usuwania nieistniejącej rezerwacji.
     */
    @Test
    void shouldReturnNotFoundWhenDeletingNonexistentReservation() throws Exception {
        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/reservations/999"))
                .andExpect(status().isNotFound());
    }

    // ---------------- READ ----------------

    /**
     * Test pobierania wszystkich rezerwacji.
     */
    @Test
    void shouldReturnAllReservations() throws Exception {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setGuestFirstName("John");

        when(reservationRepository.findAll()).thenReturn(List.of(reservation));

        mockMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].guestFirstName").value("John"));
    }

    /**
     * Test pobierania rezerwacji po ID.
     */
    @Test
    void shouldReturnReservationById() throws Exception {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setGuestFirstName("Anna");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        mockMvc.perform(get("/api/reservations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestFirstName").value("Anna"));
    }

    /**
     * Test błędu 404 dla nieistniejącej rezerwacji.
     */
    @Test
    void shouldReturnNotFoundWhenReservationNotExists() throws Exception {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/reservations/1"))
                .andExpect(status().isNotFound());
    }

    /**
     * Test pobierania rezerwacji po statusie.
     */
    @Test
    void shouldReturnReservationsByStatus() throws Exception {
        Reservation reservation = new Reservation();
        reservation.setStatus(ReservationStatus.ACTIVE);

        when(reservationRepository.findByStatus(ReservationStatus.ACTIVE)).thenReturn(List.of(reservation));

        mockMvc.perform(get("/api/reservations/status/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    /**
     * Test pobierania rezerwacji po dacie rozpoczęcia.
     */
    @Test
    void shouldReturnReservationsAfterDate() throws Exception {
        Reservation reservation = new Reservation();
        reservation.setStartDate(LocalDate.of(2025, 1, 1));

        when(reservationRepository.findByStartDateAfter(LocalDate.of(2024, 12, 1)))
                .thenReturn(List.of(reservation));

        mockMvc.perform(get("/api/reservations/after/2024-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].startDate").value("2025-01-01"));
    }
}
