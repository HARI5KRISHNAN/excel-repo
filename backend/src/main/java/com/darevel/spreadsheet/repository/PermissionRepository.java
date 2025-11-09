package com.darevel.spreadsheet.repository;

import com.darevel.spreadsheet.model.Permission;
import com.darevel.spreadsheet.model.PermissionRole;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findBySheet(Sheet sheet);
    List<Permission> findByUser(User user);
    Optional<Permission> findBySheetAndUser(Sheet sheet, User user);
    boolean existsBySheetAndUser(Sheet sheet, User user);
    List<Permission> findBySheetAndRole(Sheet sheet, PermissionRole role);
    void deleteBySheetAndUser(Sheet sheet, User user);
}
