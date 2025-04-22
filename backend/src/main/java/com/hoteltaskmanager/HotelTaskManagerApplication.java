package com.hoteltaskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Główna klasa uruchamiająca aplikację Hotel Task Manager.
 * Odpowiada za start całej aplikacji Spring Boot.
 */
@SpringBootApplication
@EnableScheduling
public class HotelTaskManagerApplication {

    /**
     * Metoda główna, która uruchamia aplikację Spring Boot.
     * @param args Argumenty przekazane podczas uruchomienia.
     */
    public static void main(String[] args) {
        SpringApplication.run(HotelTaskManagerApplication.class, args);
    }
}