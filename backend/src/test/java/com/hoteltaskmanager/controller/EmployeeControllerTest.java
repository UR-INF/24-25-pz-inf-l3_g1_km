package com.hoteltaskmanager.controller;

import com.hoteltaskmanager.config.JwtConfig;
import com.hoteltaskmanager.model.Employee;
import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import com.hoteltaskmanager.repository.EmployeeRepository;
import com.hoteltaskmanager.repository.HousekeepingTaskRepository;
import com.hoteltaskmanager.repository.MaintenanceRequestRepository;
import com.hoteltaskmanager.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Kompleksowe testy jednostkowe dla {@link EmployeeController}.
 * <p>
 * Zakres testów:
 * <ul>
 *     <li>Tworzenie nowych pracowników</li>
 *     <li>Aktualizacja danych pracowników</li>
 *     <li>Zmiana hasła i emaila</li>
 *     <li>Odczyt danych (GET, wyszukiwanie, /me)</li>
 *     <li>Usuwanie pracowników</li>
 * </ul>
 */
@WithMockUser(username = "test@example.com", roles = "USER")
@SpringBootTest
@AutoConfigureMockMvc
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeRepository employeeRepository;

    @MockBean
    private RoleRepository roleRepository;

    @MockBean
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @MockBean
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @MockBean
    private JwtConfig jwtConfig;

    /**
     * Ustawienie mockowanego użytkownika, symulującego aktualnie zalogowanego.
     */
    @BeforeEach
    void setupLoggedUser() {
        Employee mockUser = new Employee();
        mockUser.setEmail("test@example.com");
        Role role = new Role();
        role.setName(RoleName.MANAGER);
        mockUser.setRole(role);

        when(employeeRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
    }

    // ---------------- CREATE ----------------

    /**
     * Test tworzenia nowego pracownika.
     */
    @Test
    void shouldCreateEmployee() throws Exception {
        Role role = new Role();
        role.setName(RoleName.MANAGER);

        when(roleRepository.findByName(RoleName.MANAGER)).thenReturn(Optional.of(role));
        when(employeeRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
            {
              "email": "test@example.com",
              "password": "pass",
              "firstName": "John",
              "lastName": "Doe",
              "phoneNumber": "123456789",
              "roleName": "MANAGER"
            }
        """;

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    /**
     * Test tworzenia pracownika z nieistniejącą rolą.
     */
    @Test
    void shouldReturnBadRequestWhenCreateInvalidRole() throws Exception {
        when(roleRepository.findByName(RoleName.MANAGER)).thenReturn(Optional.empty());

        String payload = """
            {
              "email": "test@example.com",
              "password": "pass",
              "firstName": "John",
              "lastName": "Doe",
              "phoneNumber": "123456789",
              "roleName": "MANAGER"
            }
        """;

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    // ---------------- UPDATE ----------------

    /**
     * Test aktualizacji pracownika.
     */
    @Test
    void shouldUpdateEmployee() throws Exception {
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setEmail("existing@example.com");

        Role role = new Role();
        role.setName(RoleName.MANAGER);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(roleRepository.findByName(RoleName.MANAGER)).thenReturn(Optional.of(role));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
            {
              "email": "updated@example.com",
              "firstName": "Updated",
              "lastName": "User",
              "phoneNumber": "987654321",
              "role": { "name": "MANAGER" }
            }
        """;

        mockMvc.perform(put("/api/employees/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    // ---------------- PASSWORD ----------------

    /**
     * Test zmiany hasła.
     */
    @Test
    void shouldChangePassword() throws Exception {
        Employee employee = new Employee();
        employee.setId(1L);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        String payload = """
            {
              "password": "newpassword123"
            }
        """;

        mockMvc.perform(put("/api/employees/1/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Hasło zostało pomyślnie zmienione."));
    }

    /**
     * Test zmiany hasła dla nieistniejącego pracownika.
     */
    @Test
    void shouldReturnNotFoundWhenUserNotFoundOnChangePassword() throws Exception {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        String payload = """
            {
              "password": "newpassword123"
            }
        """;

        mockMvc.perform(put("/api/employees/99/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound());
    }

    /**
     * Test zmiany e-maila na niepoprawny.
     */
    @Test
    void shouldFailOnInvalidEmailFormat() throws Exception {
        String payload = """
            {
              "email": "invalid-email"
            }
        """;

        mockMvc.perform(put("/api/employees/1/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test zmiany e-maila na zajęty adres.
     */
    @Test
    void shouldFailWhenEmailAlreadyExists() throws Exception {
        Employee existingEmployee = new Employee();
        existingEmployee.setId(2L);
        existingEmployee.setEmail("existing@example.com");

        Employee currentEmployee = new Employee();
        currentEmployee.setId(1L);
        currentEmployee.setEmail("current@example.com");

        when(employeeRepository.findByEmail("current@example.com")).thenReturn(Optional.of(currentEmployee));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(currentEmployee));
        when(employeeRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingEmployee));

        String payload = """
            {
              "email": "existing@example.com"
            }
        """;

        mockMvc.perform(put("/api/employees/1/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    // ---------------- READ ----------------

    /**
     * Test pobierania listy pracowników.
     */
    @Test
    void shouldReturnAllEmployees() throws Exception {
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setEmail("test@example.com");

        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    /**
     * Test pobierania pracownika po ID.
     */
    @Test
    void shouldReturnEmployeeById() throws Exception {
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setEmail("test@example.com");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        mockMvc.perform(get("/api/employees/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    /**
     * Test pobierania aktualnie zalogowanego użytkownika.
     */
    @Test
    void shouldReturnCurrentLoggedUser() throws Exception {
        mockMvc.perform(get("/api/employees/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    /**
     * Test wyszukiwania pracownika po emailu.
     */
    @Test
    void shouldReturnEmployeeByEmail() throws Exception {
        Employee employee = new Employee();
        employee.setEmail("search@example.com");

        when(employeeRepository.findByEmail("search@example.com")).thenReturn(Optional.of(employee));

        mockMvc.perform(get("/api/employees/search?email=search@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("search@example.com"));
    }

    // ---------------- DELETE ----------------

    /**
     * Test poprawnego usunięcia pracownika.
     */
    @Test
    void shouldDeleteEmployee() throws Exception {
        Employee employee = new Employee();
        employee.setId(1L);
        Role role = new Role();
        role.setName(RoleName.MANAGER);
        employee.setRole(role);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        doNothing().when(employeeRepository).deleteById(1L);

        mockMvc.perform(delete("/api/employees/1"))
                .andExpect(status().isNoContent());
    }

    /**
     * Test usuwania nieistniejącego pracownika.
     */
    @Test
    void shouldReturnNotFoundWhenEmployeeDoesNotExist() throws Exception {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/employees/99"))
                .andExpect(status().isNotFound());
    }
}
