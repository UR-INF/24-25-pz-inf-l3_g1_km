package com.hoteltaskmanager.util;

import java.util.HashMap;
import java.util.Map;

public class RoleName {

    // Mapa tłumaczeń ról na język polski
    private static final Map<String, String> ROLE_MAP = new HashMap<>();
    static {
        ROLE_MAP.put("RECEPTIONIST", "Recepcjonista");
        ROLE_MAP.put("HOUSEKEEPER", "Pokojówka");
        ROLE_MAP.put("MAINTENANCE", "Konserwator");
        ROLE_MAP.put("MANAGER", "Menedżer");
    }

    /**
     * Funkcja zwracająca polski odpowiednik nazwy roli.
     *
     * @param roleName Nazwa roli jako String
     * @return Polski odpowiednik nazwy roli lub "Nieznana rola"
     */
    public static String getRoleNameInPolish(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "Nieznana rola";
        }
        return ROLE_MAP.getOrDefault(roleName.toUpperCase(), "Nieznana rola");
    }
}
