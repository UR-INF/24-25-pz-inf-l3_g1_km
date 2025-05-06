package com.hoteltaskmanager.service;

import com.hoteltaskmanager.model.*;
import com.hoteltaskmanager.repository.MaintenanceRequestRepository;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla {@link RoomStatusManagerService}.
 * <p>
 * Testy sprawdzają poprawność mechanizmu aktualizacji statusów pokoi
 * na podstawie aktywnych rezerwacji oraz zgłoszeń usterek.
 * <p>
 * Testowane scenariusze:
 * <ul>
 *     <li>Pokój bez rezerwacji i zgłoszeń usterek -> status AVAILABLE</li>
 *     <li>Pokój z aktywną rezerwacją -> status OCCUPIED</li>
 *     <li>Pokój ze zgłoszeniem usterki -> status OUT_OF_SERVICE</li>
 *     <li>Pokój z aktywną rezerwacją i zgłoszeniem usterki -> status OUT_OF_SERVICE (priorytet ma usterka)</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class RoomStatusManagerServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @InjectMocks
    private RoomStatusManagerService roomStatusManagerService;

    private Room room1;
    private Room room2;
    private Room room3;
    private Room room4;
    private Reservation activeReservation;
    private Reservation cancelledReservation;
    private MaintenanceRequest pendingMaintenance;
    private MaintenanceRequest completedMaintenance;
    private List<Room> allRooms;

    /**
     * Przygotowanie danych testowych przed każdym testem.
     * <p>
     * Tworzy pokoje, rezerwacje i zgłoszenia usterek z różnymi statusami,
     * które będą używane w testach.
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
        room2.setBedCount(2);
        room2.setPricePerNight(BigDecimal.valueOf(100.0));
        room2.setStatus(RoomStatus.AVAILABLE);

        room3 = new Room();
        room3.setId(3L);
        room3.setRoomNumber("103");
        room3.setFloor(1);
        room3.setBedCount(2);
        room3.setPricePerNight(BigDecimal.valueOf(100.0));
        room3.setStatus(RoomStatus.AVAILABLE);

        room4 = new Room();
        room4.setId(4L);
        room4.setRoomNumber("104");
        room4.setFloor(1);
        room4.setBedCount(2);
        room4.setPricePerNight(BigDecimal.valueOf(100.0));
        room4.setStatus(RoomStatus.AVAILABLE);

        allRooms = Arrays.asList(room1, room2, room3, room4);

        activeReservation = new Reservation();
        activeReservation.setId(1L);
        activeReservation.setStatus(ReservationStatus.ACTIVE);

        cancelledReservation = new Reservation();
        cancelledReservation.setId(2L);
        cancelledReservation.setStatus(ReservationStatus.CANCELLED);

        ReservationRoom reservationRoom2 = new ReservationRoom();
        reservationRoom2.setRoom(room2);
        reservationRoom2.setReservation(activeReservation);

        ReservationRoom reservationRoom4 = new ReservationRoom();
        reservationRoom4.setRoom(room4);
        reservationRoom4.setReservation(activeReservation);

        activeReservation.setReservationRooms(Arrays.asList(reservationRoom2, reservationRoom4));

        pendingMaintenance = new MaintenanceRequest();
        pendingMaintenance.setId(1L);
        pendingMaintenance.setRoom(room3);
        pendingMaintenance.setStatus(MaintenanceStatus.IN_PROGRESS);

        MaintenanceRequest pendingMaintenance2 = new MaintenanceRequest();
        pendingMaintenance2.setId(2L);
        pendingMaintenance2.setRoom(room4);
        pendingMaintenance2.setStatus(MaintenanceStatus.PENDING);

        completedMaintenance = new MaintenanceRequest();
        completedMaintenance.setId(3L);
        completedMaintenance.setRoom(room1);
        completedMaintenance.setStatus(MaintenanceStatus.COMPLETED);
    }

    /**
     * Test aktualizacji statusów pokoi.
     * <p>
     * Sprawdza czy serwis poprawnie aktualizuje statusy pokoi na podstawie
     * ich przypisań do rezerwacji i zgłoszeń usterek.
     */
    @Test
    void refreshRoomStatuses_shouldUpdateAllRoomsWithCorrectStatus() {
        String roomStatusesPayload = """
            {
              "rooms": [
                {
                  "id": 1,
                  "roomNumber": "101",
                  "status": "AVAILABLE"
                },
                {
                  "id": 2,
                  "roomNumber": "102",
                  "status": "OCCUPIED"
                },
                {
                  "id": 3,
                  "roomNumber": "103",
                  "status": "OUT_OF_SERVICE"
                },
                {
                  "id": 4,
                  "roomNumber": "104",
                  "status": "OUT_OF_SERVICE"
                }
              ]
            }
        """;

        when(roomRepository.findAll()).thenReturn(allRooms);
        when(reservationRepository.findAll()).thenReturn(Arrays.asList(activeReservation, cancelledReservation));
        when(maintenanceRequestRepository.findByRoomId(1L)).thenReturn(Collections.singletonList(completedMaintenance));
        when(maintenanceRequestRepository.findByRoomId(2L)).thenReturn(Collections.emptyList());
        when(maintenanceRequestRepository.findByRoomId(3L)).thenReturn(Collections.singletonList(pendingMaintenance));
        when(maintenanceRequestRepository.findByRoomId(4L)).thenReturn(Collections.singletonList(pendingMaintenance));

        roomStatusManagerService.refreshRoomStatuses();

        verify(roomRepository, times(1)).save(argThat(room ->
                room.getId().equals(1L) && room.getStatus() == RoomStatus.AVAILABLE));

        verify(roomRepository, times(1)).save(argThat(room ->
                room.getId().equals(2L) && room.getStatus() == RoomStatus.OCCUPIED));

        verify(roomRepository, times(1)).save(argThat(room ->
                room.getId().equals(3L) && room.getStatus() == RoomStatus.OUT_OF_SERVICE));

        verify(roomRepository, times(1)).save(argThat(room ->
                room.getId().equals(4L) && room.getStatus() == RoomStatus.OUT_OF_SERVICE));
    }

    /**
     * Test aktualizacji statusu pokoju bez rezerwacji i zgłoszeń usterek.
     * <p>
     * Sprawdza czy serwis poprawnie ustawia status AVAILABLE dla pokoju,
     * który nie ma aktywnych rezerwacji ani oczekujących zgłoszeń usterek.
     */
    @Test
    void refreshRoomStatuses_shouldSetRoomToAvailable_whenNoReservationsOrMaintenance() {
        String roomPayload = """
            {
              "id": 1,
              "roomNumber": "101",
              "floor": 1,
              "bedCount": 2,
              "pricePerNight": 100.0,
              "status": "AVAILABLE"
            }
        """;

        when(roomRepository.findAll()).thenReturn(Collections.singletonList(room1));
        when(reservationRepository.findAll()).thenReturn(Collections.emptyList());
        when(maintenanceRequestRepository.findByRoomId(1L)).thenReturn(Collections.singletonList(completedMaintenance));

        roomStatusManagerService.refreshRoomStatuses();

        verify(roomRepository).save(argThat(room ->
                room.getId().equals(1L) && room.getStatus() == RoomStatus.AVAILABLE));
    }

    /**
     * Test aktualizacji statusu pokoju z aktywną rezerwacją.
     * <p>
     * Sprawdza czy serwis poprawnie ustawia status OCCUPIED dla pokoju,
     * który ma aktywną rezerwację, ale nie ma oczekujących zgłoszeń usterek.
     */
    @Test
    void refreshRoomStatuses_shouldSetRoomToOccupied_whenActiveReservation() {
        String reservationPayload = """
            {
              "id": 1,
              "status": "ACTIVE",
              "reservationRooms": [
                {
                  "room": {
                    "id": 2,
                    "roomNumber": "102",
                    "status": "AVAILABLE"
                  }
                }
              ]
            }
        """;

        when(roomRepository.findAll()).thenReturn(Collections.singletonList(room2));
        when(reservationRepository.findAll()).thenReturn(Collections.singletonList(activeReservation));
        when(maintenanceRequestRepository.findByRoomId(2L)).thenReturn(Collections.emptyList());

        roomStatusManagerService.refreshRoomStatuses();

        verify(roomRepository).save(argThat(room ->
                room.getId().equals(2L) && room.getStatus() == RoomStatus.OCCUPIED));
    }

    /**
     * Test aktualizacji statusu pokoju z oczekującym zgłoszeniem usterki.
     * <p>
     * Sprawdza czy serwis poprawnie ustawia status OUT_OF_SERVICE dla pokoju,
     * który ma oczekujące zgłoszenie usterki, ale nie ma aktywnych rezerwacji.
     */
    @Test
    void refreshRoomStatuses_shouldSetRoomToOutOfService_whenPendingMaintenance() {
        String maintenancePayload = """
            {
              "id": 1,
              "room": {
                "id": 3,
                "roomNumber": "103"
              },
              "issue": "Zepsuty kran",
              "status": "IN_PROGRESS",
              "requestDate": "2025-05-02T10:30:00"
            }
        """;

        when(roomRepository.findAll()).thenReturn(Collections.singletonList(room3));
        when(reservationRepository.findAll()).thenReturn(Collections.emptyList());
        when(maintenanceRequestRepository.findByRoomId(3L)).thenReturn(Collections.singletonList(pendingMaintenance));

        roomStatusManagerService.refreshRoomStatuses();

        verify(roomRepository).save(argThat(room ->
                room.getId().equals(3L) && room.getStatus() == RoomStatus.OUT_OF_SERVICE));
    }

    /**
     * Test aktualizacji statusu pokoju z aktywną rezerwacją i oczekującym zgłoszeniem usterki.
     * <p>
     * Sprawdza czy serwis poprawnie ustawia status OUT_OF_SERVICE dla pokoju,
     * który ma zarówno aktywną rezerwację jak i oczekujące zgłoszenie usterki
     * (zgłoszenie usterki ma priorytet).
     */
    @Test
    void refreshRoomStatuses_shouldSetRoomToOutOfService_whenActiveReservationAndPendingMaintenance() {
        when(roomRepository.findAll()).thenReturn(Collections.singletonList(room4));
        when(reservationRepository.findAll()).thenReturn(Collections.singletonList(activeReservation));
        when(maintenanceRequestRepository.findByRoomId(4L)).thenReturn(Collections.singletonList(pendingMaintenance));

        roomStatusManagerService.refreshRoomStatuses();

        verify(roomRepository).save(argThat(room ->
                room.getId().equals(4L) && room.getStatus() == RoomStatus.OUT_OF_SERVICE));
    }
}