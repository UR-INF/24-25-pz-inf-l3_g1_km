package com.hoteltaskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.model.RoomStatus;
import com.hoteltaskmanager.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla {@link RoomController}.
 * <p>
 * Testy obejmują wszystkie endpointy REST API związane z zarządzaniem pokojami hotelowymi:
 * <ul>
 *     <li>GET /api/rooms - Pobieranie wszystkich pokoi</li>
 *     <li>GET /api/rooms/{id} - Pobieranie pokoju po ID</li>
 *     <li>POST /api/rooms - Dodawanie nowego pokoju</li>
 *     <li>PUT /api/rooms/{id} - Aktualizacja danych pokoju</li>
 *     <li>DELETE /api/rooms/{id} - Usuwanie pokoju</li>
 *     <li>GET /api/rooms/status/{status} - Pobieranie pokoi wg statusu</li>
 *     <li>GET /api/rooms/exists/{number} - Sprawdzanie, czy pokój o danym numerze istnieje</li>
 * </ul>
 * <p>
 * Każdy test sprawdza poprawność działania oraz obsługę błędów dla danego endpointu.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = {"ADMIN"}) // do testu zeby ominac uprawnienia
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoomRepository roomRepository;

    private Room room1;
    private Room room2;
    private List<Room> allRooms;

    /**
     * Przygotowanie danych testowych przed każdym testem.
     * Tworzy dwa przykładowe pokoje z różnymi parametrami i statusami.
     */
    @BeforeEach
    void setUp() {
        room1 = new Room();
        room1.setId(1L);
        room1.setRoomNumber("101");
        room1.setFloor(1);
        room1.setBedCount(2);
        room1.setPricePerNight(BigDecimal.valueOf(100.0));
        room1.setStatus(RoomStatus.AVAILABLE);

        room2 = new Room();
        room2.setId(2L);
        room2.setRoomNumber("102");
        room2.setFloor(1);
        room2.setBedCount(1);
        room2.setPricePerNight(BigDecimal.valueOf(80.0));
        room2.setStatus(RoomStatus.OCCUPIED);

        allRooms = Arrays.asList(room1, room2);
    }

    /**
     * Test pobierania wszystkich pokoi.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms zwraca wszystkie pokoje,
     * kiedy w systemie istnieją jakieś pokoje.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + lista zawierająca wszystkie pokoje</p>
     */
    @Test
    void getAllRooms_shouldReturnAllRooms() throws Exception {
        when(roomRepository.findAll()).thenReturn(allRooms);

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].roomNumber", is("101")))
                .andExpect(jsonPath("$[0].status", is("AVAILABLE")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].roomNumber", is("102")))
                .andExpect(jsonPath("$[1].status", is("OCCUPIED")));

        verify(roomRepository, times(1)).findAll();
    }

    /**
     * Test pobierania wszystkich pokoi gdy brak pokoi w systemie.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms zwraca pustą listę,
     * kiedy w systemie nie ma żadnych pokoi.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + pusta lista</p>
     */
    @Test
    void getAllRooms_shouldReturnEmptyListWhenNoRoomsExist() throws Exception {
        when(roomRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(roomRepository, times(1)).findAll();
    }

    /**
     * Test pobierania pokoju po jego ID - przypadek gdy pokój istnieje.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms/{id} zwraca poprawne dane pokoju,
     * gdy pokój o podanym ID istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + dane pokoju</p>
     */
    @Test
    void getRoomById_shouldReturnRoomWhenExists() throws Exception {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room1));

        mockMvc.perform(get("/api/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.roomNumber", is("101")))
                .andExpect(jsonPath("$.bedCount", is(2)))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));

        verify(roomRepository, times(1)).findById(1L);
    }

    /**
     * Test pobierania pokoju po jego ID - przypadek gdy pokój nie istnieje.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms/{id} zwraca odpowiedni kod błędu,
     * gdy pokój o podanym ID nie istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 404 Not Found</p>
     */
    @Test
    void getRoomById_shouldReturnNotFoundWhenRoomDoesNotExist() throws Exception {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/rooms/99"))
                .andExpect(status().isNotFound());

        verify(roomRepository, times(1)).findById(99L);
    }

    /**
     * Test tworzenia nowego pokoju - przypadek gdy numer pokoju jest unikalny.
     * <p>
     * Sprawdza czy endpoint POST /api/rooms poprawnie dodaje nowy pokój,
     * gdy jego numer jest unikalny (nie istnieje już w systemie).
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + dane zapisanego pokoju</p>
     */
    @Test
    void createRoom_shouldCreateRoomWhenRoomNumberIsUnique() throws Exception {
        Room newRoom = new Room();
        newRoom.setRoomNumber("103");
        newRoom.setFloor(2);
        newRoom.setBedCount(3);
        newRoom.setPricePerNight(BigDecimal.valueOf(120.0));
        newRoom.setStatus(RoomStatus.AVAILABLE);

        when(roomRepository.existsByRoomNumber("103")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(newRoom);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.roomNumber", is("103")))
                .andExpect(jsonPath("$.floor", is(2)))
                .andExpect(jsonPath("$.bedCount", is(3)));

        verify(roomRepository, times(1)).existsByRoomNumber("103");
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    /**
     * Test tworzenia nowego pokoju - przypadek gdy numer pokoju już istnieje.
     * <p>
     * Sprawdza czy endpoint POST /api/rooms zwraca odpowiedni kod błędu,
     * gdy podany numer pokoju już istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 400 Bad Request</p>
     */
    @Test
    void createRoom_shouldReturnBadRequestWhenRoomNumberExists() throws Exception {
        Room newRoom = new Room();
        newRoom.setRoomNumber("101");
        newRoom.setFloor(1);
        newRoom.setBedCount(2);
        newRoom.setPricePerNight(BigDecimal.valueOf(100.0));
        newRoom.setStatus(RoomStatus.AVAILABLE);

        when(roomRepository.existsByRoomNumber("101")).thenReturn(true);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isBadRequest());

        verify(roomRepository, times(1)).existsByRoomNumber("101");
        verify(roomRepository, never()).save(any(Room.class));
    }

    /**
     * Test aktualizacji danych pokoju - przypadek gdy pokój istnieje.
     * <p>
     * Sprawdza czy endpoint PUT /api/rooms/{id} poprawnie aktualizuje dane pokoju,
     * gdy pokój o podanym ID istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + zaktualizowane dane pokoju</p>
     */
    @Test
    void updateRoom_shouldUpdateRoomWhenExists() throws Exception {
        Room updatedRoom = new Room();
        updatedRoom.setRoomNumber("101-Updated");
        updatedRoom.setFloor(3);
        updatedRoom.setBedCount(4);
        updatedRoom.setPricePerNight(BigDecimal.valueOf(150.0));
        updatedRoom.setStatus(RoomStatus.AVAILABLE);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room1));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/rooms/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedRoom)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.roomNumber", is("101-Updated")))
                .andExpect(jsonPath("$.floor", is(3)))
                .andExpect(jsonPath("$.bedCount", is(4)))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));

        verify(roomRepository, times(1)).findById(1L);
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    /**
     * Test aktualizacji danych pokoju - przypadek gdy pokój nie istnieje.
     * <p>
     * Sprawdza czy endpoint PUT /api/rooms/{id} zwraca odpowiedni kod błędu,
     * gdy pokój o podanym ID nie istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 404 Not Found</p>
     */
    @Test
    void updateRoom_shouldReturnNotFoundWhenRoomDoesNotExist() throws Exception {
        Room updatedRoom = new Room();
        updatedRoom.setRoomNumber("999");
        updatedRoom.setFloor(9);
        updatedRoom.setBedCount(9);
        updatedRoom.setPricePerNight(BigDecimal.valueOf(999.0));
        updatedRoom.setStatus(RoomStatus.AVAILABLE);

        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/rooms/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedRoom)))
                .andExpect(status().isNotFound());

        verify(roomRepository, times(1)).findById(99L);
        verify(roomRepository, never()).save(any(Room.class));
    }

    /**
     * Test usuwania pokoju - przypadek gdy pokój istnieje.
     * <p>
     * Sprawdza czy endpoint DELETE /api/rooms/{id} poprawnie usuwa pokój,
     * gdy pokój o podanym ID istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 204 No Content</p>
     */
    @Test
    void deleteRoom_shouldDeleteRoomWhenExists() throws Exception {
        when(roomRepository.existsById(1L)).thenReturn(true);
        doNothing().when(roomRepository).deleteById(1L);

        mockMvc.perform(delete("/api/rooms/1"))
                .andExpect(status().isNoContent());

        verify(roomRepository, times(1)).existsById(1L);
        verify(roomRepository, times(1)).deleteById(1L);
    }

    /**
     * Test usuwania pokoju - przypadek gdy pokój nie istnieje.
     * <p>
     * Sprawdza czy endpoint DELETE /api/rooms/{id} zwraca odpowiedni kod błędu,
     * gdy pokój o podanym ID nie istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 404 Not Found</p>
     */
    @Test
    void deleteRoom_shouldReturnNotFoundWhenRoomDoesNotExist() throws Exception {
        when(roomRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/rooms/99"))
                .andExpect(status().isNotFound());

        verify(roomRepository, times(1)).existsById(99L);
        verify(roomRepository, never()).deleteById(any());
    }

    /**
     * Test pobierania pokoi według statusu.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms/status/{status} zwraca listę pokoi
     * mających określony status.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + lista pokoi o danym statusie</p>
     */
    @Test
    void getRoomsByStatus_shouldReturnRoomsWithSpecifiedStatus() throws Exception {
        List<Room> availableRooms = Collections.singletonList(room1);
        when(roomRepository.findByStatus(RoomStatus.AVAILABLE)).thenReturn(availableRooms);

        mockMvc.perform(get("/api/rooms/status/AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].status", is("AVAILABLE")));

        verify(roomRepository, times(1)).findByStatus(RoomStatus.AVAILABLE);
    }

    /**
     * Test pobierania pokoi według statusu - przypadek gdy brak pokoi o danym statusie.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms/status/{status} zwraca pustą listę,
     * gdy nie ma pokoi o określonym statusie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + pusta lista</p>
     */
    @Test
    void getRoomsByStatus_shouldReturnEmptyListWhenNoRoomsWithStatus() throws Exception {
        when(roomRepository.findByStatus(RoomStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/rooms/status/AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(roomRepository, times(1)).findByStatus(RoomStatus.AVAILABLE);
    }

    /**
     * Test sprawdzania istnienia pokoju o danym numerze - przypadek gdy pokój istnieje.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms/exists/{number} zwraca wartość true,
     * gdy pokój o podanym numerze istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + true</p>
     */
    @Test
    void roomExists_shouldReturnTrueWhenRoomExists() throws Exception {
        when(roomRepository.existsByRoomNumber("101")).thenReturn(true);

        mockMvc.perform(get("/api/rooms/exists/101"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        verify(roomRepository, times(1)).existsByRoomNumber("101");
    }

    /**
     * Test sprawdzania istnienia pokoju o danym numerze - przypadek gdy pokój nie istnieje.
     * <p>
     * Sprawdza czy endpoint GET /api/rooms/exists/{number} zwraca wartość false,
     * gdy pokój o podanym numerze nie istnieje w systemie.
     * </p>
     * <p>Oczekiwany rezultat: HTTP 200 OK + false</p>
     */
    @Test
    void roomExists_shouldReturnFalseWhenRoomDoesNotExist() throws Exception {
        when(roomRepository.existsByRoomNumber("999")).thenReturn(false);

        mockMvc.perform(get("/api/rooms/exists/999"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));

        verify(roomRepository, times(1)).existsByRoomNumber("999");
    }
}