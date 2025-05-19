package com.hoteltaskmanager.util;

import java.util.HashMap;
import java.util.Map;

/**
 * Klasa pomocnicza do tłumaczenia nazw ról pracowników na język polski.
 */
public class RoleName {

    private static final Map<String, String> ROLE_MAP = new HashMap<>();

    static {
        ROLE_MAP.put("RECEPTIONIST", "Recepcjonista");
        ROLE_MAP.put("HOUSEKEEPER", "Pokojówka");
        ROLE_MAP.put("MAINTENANCE", "Konserwator");
        ROLE_MAP.put("MANAGER", "Menedżer");
    }

    /**
     * Zwraca polski odpowiednik podanej nazwy roli.
     * Jeśli rola jest nieznana lub nie została podana, zwraca "Nieznana rola".
     *
     * @param roleName Nazwa roli w języku angielskim (np. "MANAGER", "HOUSEKEEPER")
     * @return Polski odpowiednik roli lub "Nieznana rola", jeśli brak tłumaczenia
     */
    public static String getRoleNameInPolish(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "Nieznana rola";
        }
        return ROLE_MAP.getOrDefault(roleName.toUpperCase(), "Nieznana rola");
    }
}
