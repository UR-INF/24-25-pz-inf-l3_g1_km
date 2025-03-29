package com.hoteltaskmanager.seed;

import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import com.hoteltaskmanager.repository.RoleRepository;
import org.springframework.stereotype.Component;

/**
 * Komponent odpowiedzialny za inicjalizację tabeli ról.
 * Dodaje wszystkie wartości z enum RoleName do bazy danych,
 * jeśli tabela jest pusta.
 */
@Component
public class RoleSeeder {

    private final RoleRepository roleRepository;

    /**
     * Konstruktor z wstrzyknięciem repozytorium ról.
     *
     * @param roleRepository repozytorium encji Role
     */
    public RoleSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * Dodaje do bazy wszystkie dostępne typy ról z enum RoleName,
     * tylko jeśli tabela ról jest pusta.
     */
    public void seed() {
        if (roleRepository.count() == 0) {
            for (RoleName name : RoleName.values()) {
                Role role = new Role();
                role.setName(name);
                roleRepository.save(role);
                System.out.println("🛡️ Dodano rolę: " + name);
            }
        }
    }
}
