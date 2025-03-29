package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.Room;
import com.hoteltaskmanager.model.RoomStatus;
import com.hoteltaskmanager.repository.RoomRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * Komponent odpowiedzialny za inicjalizację danych pokoi hotelowych.
 * Dodaje przykładowe pokoje jako dostępne, inne statusy będą nadawane dynamicznie.
 */
@Component
public class RoomSeeder {

    private final RoomRepository roomRepository;

    /**
     * Konstruktor z wstrzyknięciem repozytorium pokoi.
     *
     * @param roomRepository repozytorium pokoi
     */
    public RoomSeeder(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    /**
     * Dodaje przykładowe pokoje do bazy danych,
     * tylko jeśli tabela 'rooms' jest pusta.
     */
    public void seed() {
        if (roomRepository.count() == 0) {
            List<Room> rooms = Arrays.asList(
                    createRoom("101", 1, 2, new BigDecimal("250.00")),
                    createRoom("102", 1, 1, new BigDecimal("200.00")),
                    createRoom("201", 2, 3, new BigDecimal("350.00")),
                    createRoom("202", 2, 2, new BigDecimal("300.00")),
                    createRoom("203", 2, 1, new BigDecimal("280.00")),
                    createRoom("204", 2, 2, new BigDecimal("310.00")),
                    createRoom("301", 3, 3, new BigDecimal("400.00")),
                    createRoom("302", 3, 1, new BigDecimal("220.00")),
                    createRoom("303", 3, 2, new BigDecimal("290.00")),
                    createRoom("304", 3, 2, new BigDecimal("305.00")),
                    createRoom("401", 4, 1, new BigDecimal("210.00")),
                    createRoom("402", 4, 3, new BigDecimal("370.00")),
                    createRoom("403", 4, 2, new BigDecimal("330.00"))
            );
            roomRepository.saveAll(rooms);
            System.out.println("🛏️ Dodano przykładowe pokoje do bazy danych.");
        }
    }

    /**
     * Pomocnicza metoda do utworzenia pokoju ze statusem AVAILABLE.
     *
     * @param roomNumber   numer pokoju (np. "101")
     * @param floor        piętro, na którym znajduje się pokój
     * @param bedCount     liczba łóżek w pokoju
     * @param price        cena za noc
     * @return obiekt pokoju gotowy do zapisania
     */
    private Room createRoom(String roomNumber, int floor, int bedCount, BigDecimal price) {
        Room room = new Room();
        room.setRoomNumber(roomNumber);
        room.setFloor(floor);
        room.setBedCount(bedCount);
        room.setPricePerNight(price);
        room.setStatus(RoomStatus.AVAILABLE); // Ustawiamy dostępność jako domyślną
        return room;
    }
}
