package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.security.PasswordHasher;
import com.hoteltaskmanager.config.JwtConfig;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla logowania w {@link LoginController}.
 * <p>
 * Testy obejmują scenariusze:
 * <ul>
 *     <li>Poprawne logowanie (email + hasło).</li>
 *     <li>Niepoprawne hasło.</li>
 *     <li>Nieistniejący użytkownik.</li>
 * </ul>
 */

@SpringBootTest
@AutoConfigureMockMvc
class LoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeRepository employeeRepository;

    @MockBean
    private PasswordHasher passwordHasher;

    @MockBean
    private JwtConfig jwtConfig;

    /**
     * Test poprawnego logowania — użytkownik istnieje i hasło jest poprawne.
     * <p>Oczekiwany rezultat: HTTP 200 OK + success=true + token.</p>
     */
    @Test
    void shouldLoginSuccessfully() throws Exception {
        Employee employee = new Employee();
        employee.setEmail("user@example.com");
        employee.setPassword("hashedPassword");

        Mockito.when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee));
        Mockito.when(passwordHasher.matchPassword("validPassword", "hashedPassword")).thenReturn(true);
        Mockito.when(jwtConfig.generateToken("user@example.com")).thenReturn("validToken");

        String payload = """
            {
              "email": "user@example.com",
              "password": "validPassword"
            }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").value("validToken"));
    }

    /**
     * Test logowania z niepoprawnym hasłem.
     * <p>Oczekiwany rezultat: HTTP 200 OK + success=false + komunikat o nieprawidłowych danych logowania.</p>
     */
    @Test
    void shouldFailLoginWhenPasswordIsIncorrect() throws Exception {
        Employee employee = new Employee();
        employee.setEmail("user@example.com");
        employee.setPassword("hashedPassword");

        Mockito.when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee));
        Mockito.when(passwordHasher.matchPassword("wrongPassword", "hashedPassword")).thenReturn(false);

        String payload = """
            {
              "email": "user@example.com",
              "password": "wrongPassword"
            }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Nieprawidłowe dane logowania."));
    }

    /**
     * Test logowania z nieistniejącym użytkownikiem.
     * <p>Oczekiwany rezultat: HTTP 200 OK + success=false + komunikat o braku użytkownika.</p>
     */
    @Test
    void shouldFailLoginWhenUserNotFound() throws Exception {
        Mockito.when(employeeRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        String payload = """
            {
              "email": "notfound@example.com",
              "password": "somePassword"
            }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Nie znaleziono użytkownika."));
    }
}
