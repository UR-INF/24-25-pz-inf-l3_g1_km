package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

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
    @JsonIgnore
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
}
