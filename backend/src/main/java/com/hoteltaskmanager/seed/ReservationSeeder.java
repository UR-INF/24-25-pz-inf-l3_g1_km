package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.*;
import com.hoteltaskmanager.repository.ReservationRepository;
import com.hoteltaskmanager.repository.ReservationRoomRepository;
import com.hoteltaskmanager.repository.RoomRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Komponent odpowiedzialny za inicjalizację danych rezerwacji.
 * Dodaje przykładowe rezerwacje i przypisane pokoje, jeśli nie istnieją dane.
 */
@Component
public class ReservationSeeder {

    private final ReservationRepository reservationRepository;
    private final ReservationRoomRepository reservationRoomRepository;
    private final RoomRepository roomRepository;

    /**
     * Konstruktor z wstrzyknięciem repozytoriów rezerwacji i pokoi.
     *
     * @param reservationRepository       repozytorium rezerwacji
     * @param reservationRoomRepository   repozytorium przypisań pokoi do rezerwacji
     * @param roomRepository              repozytorium pokoi
     */
    public ReservationSeeder(ReservationRepository reservationRepository,
                             ReservationRoomRepository reservationRoomRepository,
                             RoomRepository roomRepository) {
        this.reservationRepository = reservationRepository;
        this.reservationRoomRepository = reservationRoomRepository;
        this.roomRepository = roomRepository;
    }

    /**
     * Dodaje przykładowe rezerwacje do bazy danych,
     * tylko jeśli tabela 'reservations' jest pusta.
     */
    public void seed() {
        if (reservationRepository.count() == 0) {
            List<Room> availableRooms = roomRepository.findByStatus(RoomStatus.AVAILABLE);

            if (availableRooms.size() < 7) {
                System.out.println("❗ Za mało dostępnych pokoi do utworzenia przykładowych rezerwacji.");
                return;
            }

            // Lista przykładowych rezerwacji
            Reservation r1 = createReservation("Karolina", "Maj", "88010156789", "508999777", ReservationStatus.ACTIVE,
                    LocalDate.now().plusDays(2), LocalDate.now().plusDays(5),
                    "Pokój blisko windy i łóżeczko dziecięce", true);

            Reservation r2 = createReservation("Marek", "Kowal", "81051233333", "600300200", ReservationStatus.COMPLETED,
                    LocalDate.now().plusDays(1), LocalDate.now().plusDays(4),
                    "Alergia - poduszki bez pierza", false);

            Reservation r3 = createReservation("Julia", "Lewandowska", "92092398765", "507000111", ReservationStatus.ACTIVE,
                    LocalDate.now().plusDays(7), LocalDate.now().plusDays(14),
                    "Pokój z balkonem i widokiem", true);

            Reservation r4 = createReservation("Tomasz", "Nowak", "90011122233", "505505505", ReservationStatus.CANCELLED,
                    LocalDate.now().minusDays(3), LocalDate.now().minusDays(1),
                    "Odwołano rezerwacje", false);

            Reservation r5 = createReservation("Agnieszka", "Bielska", "85101010101", "512345678", ReservationStatus.COMPLETED,
                    LocalDate.now().minusDays(10), LocalDate.now().minusDays(5),
                    "Standardowa rezerwacja", true);

            Reservation r6 = createReservation("Kamil", "Rogalski", "95010145678", "504123321", ReservationStatus.ACTIVE,
                    LocalDate.now().plusDays(1), LocalDate.now().plusDays(2),
                    "Zamówienie bez wymagań", false);

            Reservation r7 = createReservation("Ewa", "Sosna", "87050578901", "501202303", ReservationStatus.ACTIVE,
                    LocalDate.now().plusDays(4), LocalDate.now().plusDays(8),
                    "Prośba o cichą lokalizację", true);

            // Zapisz wszystkie rezerwacje
            reservationRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7));

            // Przypisz pokoje do każdej rezerwacji i ustaw status jako zajęty
            List<Reservation> reservations = List.of(r1, r2, r3, r4, r5, r6, r7);
            for (int i = 0; i < reservations.size(); i++) {
                Room room = availableRooms.get(i);
                Reservation reservation = reservations.get(i);

                // Ustaw status pokoju na zajęty
                room.setStatus(RoomStatus.OCCUPIED);
                roomRepository.save(room);

                // Stwórz powiązanie pokoju z rezerwacją
                ReservationRoom rr = new ReservationRoom();
                rr.setReservation(reservation);
                rr.setRoom(room);
                rr.setGuestCount(2);
                reservationRoomRepository.save(rr);
            }

            System.out.println("📚 Dodano 7 przykładowych rezerwacji z przypisanymi pokojami.");
        }
    }

    /**
     * Pomocnicza metoda do utworzenia obiektu rezerwacji.
     */
    private Reservation createReservation(String firstName, String lastName, String pesel, String phone,
                                          ReservationStatus status, LocalDate start, LocalDate end,
                                          String specialRequests, boolean catering) {
        Reservation res = new Reservation();
        res.setGuestFirstName(firstName);
        res.setGuestLastName(lastName);
        res.setGuestPesel(pesel);
        res.setGuestPhone(phone);
        res.setStatus(status);
        res.setStartDate(start);
        res.setEndDate(end);
        res.setSpecialRequests(specialRequests);
        res.setModifiedAt(LocalDateTime.now());
        res.setCatering(catering);
        return res;
    }
}
