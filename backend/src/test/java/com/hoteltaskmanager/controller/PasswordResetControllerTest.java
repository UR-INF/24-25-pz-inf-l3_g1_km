package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.security.PasswordHasher;
import com.hoteltaskmanager.service.EmailService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy jednostkowe dla {@link PasswordResetController}.
 * <p>
 * Testowane scenariusze obejmują:
 * <ul>
 *     <li>Wysłanie prośby o reset hasła (reset-request).</li>
 *     <li>Resetowanie hasła na podstawie tokenu (reset).</li>
 * </ul>
 */
@SpringBootTest
@AutoConfigureMockMvc
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeRepository employeeRepository;

    @MockBean
    private EmailService emailService;

    @MockBean
    private PasswordHasher passwordHasher;

    /**
     * Test wysyłania linku do resetu hasła dla istniejącego użytkownika.
     */
    @Test
    void shouldRequestPasswordReset() throws Exception {
        Employee employee = new Employee();
        employee.setEmail("user@example.com");

        Mockito.when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee));
        Mockito.when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        String payload = """
            {
              "email": "user@example.com"
            }
        """;

        mockMvc.perform(post("/api/auth/password/reset-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Link do resetu hasła został wysłany."));
    }

    /**
     * Test wysyłania linku do resetu hasła dla nieistniejącego użytkownika.
     */
    @Test
    void shouldFailWhenUserNotFoundOnResetRequest() throws Exception {
        Mockito.when(employeeRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        String payload = """
            {
              "email": "unknown@example.com"
            }
        """;

        mockMvc.perform(post("/api/auth/password/reset-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Nie znaleziono użytkownika."));
    }

    /**
     * Test poprawnego ustawienia nowego hasła (token poprawny i ważny).
     */
    @Test
    void shouldResetPassword() throws Exception {
        Employee employee = new Employee();
        employee.setResetToken("validToken");
        employee.setResetTokenExpiry(LocalDateTime.now().plusHours(1));

        Mockito.when(employeeRepository.findAll()).thenReturn(List.of(employee));
        Mockito.when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
        Mockito.when(passwordHasher.hashPassword("newPassword")).thenReturn("hashedPassword");

        String payload = """
            {
              "token": "validToken",
              "newPassword": "newPassword"
            }
        """;

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Hasło zostało zaktualizowane."));
    }

    /**
     * Test ustawienia hasła z nieprawidłowym tokenem.
     */
    @Test
    void shouldFailResetWhenTokenInvalid() throws Exception {
        Mockito.when(employeeRepository.findAll()).thenReturn(List.of());

        String payload = """
            {
              "token": "invalidToken",
              "newPassword": "newPassword"
            }
        """;

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Nieprawidłowy token."));
    }

    /**
     * Test ustawienia hasła z wygasłym tokenem.
     */
    @Test
    void shouldFailResetWhenTokenExpired() throws Exception {
        Employee employee = new Employee();
        employee.setResetToken("expiredToken");
        employee.setResetTokenExpiry(LocalDateTime.now().minusHours(1));

        Mockito.when(employeeRepository.findAll()).thenReturn(List.of(employee));

        String payload = """
            {
              "token": "expiredToken",
              "newPassword": "newPassword"
            }
        """;

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Token wygasł. Wygeneruj nowy link do resetu hasła."));
    }

    /**
     * Test ustawienia nowego hasła zbyt krótkiego.
     */
    @Test
    void shouldFailResetWhenPasswordTooShort() throws Exception {
        Employee employee = new Employee();
        employee.setResetToken("validToken");
        employee.setResetTokenExpiry(LocalDateTime.now().plusHours(1));

        Mockito.when(employeeRepository.findAll()).thenReturn(List.of(employee));

        String payload = """
            {
              "token": "validToken",
              "newPassword": "123"
            }
        """;

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Hasło musi mieć minimum 6 znaków."));
    }
}
