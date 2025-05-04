package com.hoteltaskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoteltaskmanager.model.Reservation;
import com.hoteltaskmanager.model.ReservationRoom;
import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.ReservationRoomRepository;
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

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla {@link ReservationRoomController}.
 * <p>
 * Zakres testów:
 * <ul>
 *     <li>Dodawanie pokoi do rezerwacji</li>
 *     <li>Aktualizacja przypisania pokoi</li>
 *     <li>Usuwanie pokoi z rezerwacji</li>
 *     <li>Odczyt przypisanych pokoi</li>
 * </ul>
 */
@WithMockUser(username = "test@example.com", roles = "USER")
@SpringBootTest
@AutoConfigureMockMvc
class ReservationRoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationRepository reservationRepository;

    @MockBean
    private ReservationRoomRepository reservationRoomRepository;

    @MockBean
    private RoomStatusManagerService roomStatusManagerService;

    @Autowired
    private ObjectMapper objectMapper;

    private Reservation reservation;
    private ReservationRoom reservationRoom;
    private Room room;

    /**
     * Przygotowanie danych testowych przed każdym testem.
     */
    @BeforeEach
    void setUp() {
        reservation = new Reservation();
        reservation.setId(1L);

        room = new Room();
        room.setId(101L);

        reservationRoom = new ReservationRoom();
        reservationRoom.setId(10L);
        reservationRoom.setReservation(reservation);
        reservationRoom.setRoom(room);
        reservationRoom.setGuestCount(2);
    }

    // ---------------- CREATE ----------------

    /**
     * Test dodawania pokoju do rezerwacji.
     */
    @Test
    void shouldAddRoomToReservation() throws Exception {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRoomRepository.save(any())).thenAnswer(invocation -> {
            ReservationRoom rr = invocation.getArgument(0);
            rr.setId(11L);
            return rr;
        });

        ReservationRoom toSave = new ReservationRoom();
        toSave.setRoom(room);
        toSave.setGuestCount(2);

        mockMvc.perform(post("/api/reservations/1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toSave)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11L));

        verify(roomStatusManagerService, times(1)).refreshRoomStatuses();
    }

    /**
     * Test dodawania pokoju do rezerwacji bez pokoju.
     */
    @Test
    void shouldReturnBadRequestIfRoomIsMissingOnAdd() throws Exception {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        ReservationRoom toSave = new ReservationRoom();
        toSave.setGuestCount(2);

        mockMvc.perform(post("/api/reservations/1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toSave)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test dodawania pokoju do nieistniejącej rezerwacji.
     */
    @Test
    void shouldReturnNotFoundIfReservationDoesNotExistOnAdd() throws Exception {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/reservations/1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservationRoom)))
                .andExpect(status().isNotFound());
    }

    // ---------------- UPDATE ----------------

    /**
     * Test aktualizacji przypisania pokoju do rezerwacji.
     */
    @Test
    void shouldUpdateRoomAssignment() throws Exception {
        when(reservationRoomRepository.findById(10L)).thenReturn(Optional.of(reservationRoom));
        when(reservationRoomRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReservationRoom updated = new ReservationRoom();
        updated.setRoom(room);
        updated.setGuestCount(3);

        mockMvc.perform(put("/api/reservations/1/rooms/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestCount").value(3));

        verify(roomStatusManagerService, times(1)).refreshRoomStatuses();
    }

    /**
     * Test aktualizacji przypisania pokoju, gdy pokój nie istnieje.
     */
    @Test
    void shouldReturnNotFoundIfReservationRoomDoesNotExistOnUpdate() throws Exception {
        when(reservationRoomRepository.findById(10L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/reservations/1/rooms/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservationRoom)))
                .andExpect(status().isNotFound());
    }

    /**
     * Test aktualizacji przypisania pokoju z niezgodnym ID rezerwacji.
     */
    @Test
    void shouldReturnBadRequestIfReservationMismatchOnUpdate() throws Exception {
        Reservation wrongReservation = new Reservation();
        wrongReservation.setId(99L);
        reservationRoom.setReservation(wrongReservation);

        when(reservationRoomRepository.findById(10L)).thenReturn(Optional.of(reservationRoom));

        mockMvc.perform(put("/api/reservations/1/rooms/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservationRoom)))
                .andExpect(status().isBadRequest());
    }

    // ---------------- DELETE ----------------

    /**
     * Test usuwania przypisania pokoju do rezerwacji.
     */
    @Test
    void shouldDeleteRoomAssignment() throws Exception {
        when(reservationRoomRepository.findById(10L)).thenReturn(Optional.of(reservationRoom));

        mockMvc.perform(delete("/api/reservations/1/rooms/10"))
                .andExpect(status().isNoContent());

        verify(reservationRoomRepository, times(1)).deleteById(10L);
        verify(roomStatusManagerService, times(1)).refreshRoomStatuses();
    }

    /**
     * Test usuwania pokoju, gdy przypisanie nie istnieje.
     */
    @Test
    void shouldReturnNotFoundIfRoomAssignmentNotExistsOnDelete() throws Exception {
        when(reservationRoomRepository.findById(10L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/reservations/1/rooms/10"))
                .andExpect(status().isNotFound());
    }

    /**
     * Test usuwania pokoju z niezgodnym ID rezerwacji.
     */
    @Test
    void shouldReturnBadRequestIfReservationMismatchOnDelete() throws Exception {
        Reservation differentReservation = new Reservation();
        differentReservation.setId(99L);
        reservationRoom.setReservation(differentReservation);

        when(reservationRoomRepository.findById(10L)).thenReturn(Optional.of(reservationRoom));

        mockMvc.perform(delete("/api/reservations/1/rooms/10"))
                .andExpect(status().isBadRequest());
    }

    // ---------------- GET ----------------

    /**
     * Test pobierania przypisanych pokoi do rezerwacji.
     */
    @Test
    void shouldReturnReservationRooms() throws Exception {
        when(reservationRepository.existsById(1L)).thenReturn(true);
        when(reservationRoomRepository.findByReservationId(1L)).thenReturn(List.of(reservationRoom));

        mockMvc.perform(get("/api/reservations/1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L));
    }

    /**
     * Test pobierania przypisanych pokoi, gdy rezerwacja nie istnieje.
     */
    @Test
    void shouldReturnNotFoundIfReservationDoesNotExistOnGet() throws Exception {
        when(reservationRepository.existsById(1L)).thenReturn(false);

        mockMvc.perform(get("/api/reservations/1/rooms"))
                .andExpect(status().isNotFound());
    }

    /**
     * Test pobierania przypisanych pokoi dla nieistniejącej rezerwacji.
     */
    @Test
    void shouldReturnNotFoundIfReservationDoesNotExist() throws Exception {
        when(reservationRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(get("/api/reservations/999/rooms"))
                .andExpect(status().isNotFound());
    }
}
