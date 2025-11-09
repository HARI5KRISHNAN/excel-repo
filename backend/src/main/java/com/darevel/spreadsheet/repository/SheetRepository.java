package com.darevel.spreadsheet.repository;

import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SheetRepository extends JpaRepository<Sheet, Long> {
    List<Sheet> findByOwner(User owner);
    List<Sheet> findByOwnerOrderByUpdatedAtDesc(User owner);
    Optional<Sheet> findByIdAndOwner(Long id, User owner);
    Optional<Sheet> findByShareToken(String shareToken);
}
