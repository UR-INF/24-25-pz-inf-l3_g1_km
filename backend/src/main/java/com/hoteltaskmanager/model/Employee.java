package com.hoteltaskmanager.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Reprezentuje pracownika hotelu.
 * Każdy pracownik posiada przypisaną rolę, dane kontaktowe oraz dane logowania.
 */
@Data
@Entity
@Table(name = "employee")
public class Employee {

    /**
     * Unikalny identyfikator pracownika (generowany automatycznie).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Imię pracownika.
     */
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    /**
     * Nazwisko pracownika.
     */
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    /**
     * Adres e-mail pracownika (unikalny, wykorzystywany np. do logowania).
     */
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    /**
     * Hasło pracownika (przechowywane jako zahaszowany ciąg znaków).
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false)
    private String password;

    /**
     * Numer telefonu kontaktowego.
     */
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    /**
     * Rola pracownika (np. MANAGER, HOUSEKEEPER).
     * Relacja wiele-do-jednego z tabelą `roles`.
     */
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    /**
     * Awatar pracownika.
     */
    @Column(name = "avatar_filename")
    private String avatarFilename;

    /**
     * Zwraca pełny URL do avatara pracownika.
     * Jeśli pracownik ma przypisany plik (avatarFilename), zwracany jest jego link.
     * W przeciwnym razie zwracany jest link do domyślnego avatara.
     */
    @Transient
    public String getAvatarUrl() {
        String baseUrl = "http://localhost:8080/avatars/";
        if (this.avatarFilename != null && !this.avatarFilename.isEmpty()) {
            return baseUrl + this.avatarFilename;
        } else {
            return baseUrl + "default.png";
        }
    }

    /**
     * Token wykorzystywany do resetowania hasła.
     * Generowany losowo i przypisany tymczasowo do użytkownika.
     */
    @Column(name = "reset_token", length = 36)
    private String resetToken;

    /**
     * Data i godzina wygaśnięcia tokenu do resetowania hasła.
     * Token staje się nieważny po upływie 24 godzin od wygenerowania.
     */
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    /**
     * Kolumna do obslugiwania powiadomień na pulpicie.
     */
    @Column(name = "notifications_enabled")
    private Boolean notificationsEnabled = false;

}
