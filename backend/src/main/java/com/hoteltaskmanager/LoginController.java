package com.hoteltaskmanager;

import com.hoteltaskmanager.model.Employee;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private EntityManager entityManager;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        System.out.println("Attempting login for email: " + email);

        boolean isValid = checkLogin(email, password);

        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            response.put("success", true);
            System.out.println("Login successful for email: " + email);
        } else {
            response.put("success", false);
            System.out.println("Login failed for email: " + email);
        }

        return response;
    }

    private boolean checkLogin(String email, String password) {
        System.out.println("Querying database for employee with email: " + email);

        Query query = entityManager.createQuery("SELECT e FROM Employee e WHERE e.email = :email", Employee.class);
        query.setParameter("email", email);

        Employee employee = null;
        try {
            employee = (Employee) query.getSingleResult();
            System.out.println("Employee found: " + employee);
        } catch (Exception e) {
            System.err.println("Error while querying employee for email: " + email);
            e.printStackTrace();
        }

        if (employee != null) {
            System.out.println("Checking password for employee with email: " + email);
            if (password.equals(employee.getPassword())) {
                System.out.println("Password match successful for email: " + email);
                return true;
            } else {
                System.out.println("Password mismatch for email: " + email);
            }
        } else {
            System.out.println("Employee not found for email: " + email);
        }

        return false;
    }
}
