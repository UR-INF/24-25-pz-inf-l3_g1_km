package com.hoteltaskmanager.repository;

import com.hoteltaskmanager.model.Role;
import com.hoteltaskmanager.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Znajduje rolę po nazwie (enum).
     * Np. RoleName.MANAGER
     */
    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);
}
