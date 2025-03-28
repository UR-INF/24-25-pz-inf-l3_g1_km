package com.hoteltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Reprezentuje rolę pracownika, np. manager, pokojówka, serwisant.
 * Każda rola jest przechowywana jako enum w polu `name`.
 */
@Data
@Entity
@Table(name = "roles")
public class Role {

    /**
     * Unikalny identyfikator roli.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nazwa roli w formie enuma (np. MANAGER, HOUSEKEEPER).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleName name;
}
