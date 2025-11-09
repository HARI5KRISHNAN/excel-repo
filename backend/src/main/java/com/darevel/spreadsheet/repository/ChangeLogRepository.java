package com.darevel.spreadsheet.repository;

import com.darevel.spreadsheet.model.ChangeLog;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {
    List<ChangeLog> findBySheetOrderByTimestampDesc(Sheet sheet);
    Page<ChangeLog> findBySheet(Sheet sheet, Pageable pageable);
    List<ChangeLog> findBySheetAndUser(Sheet sheet, User user);
    List<ChangeLog> findBySheetAndTimestampAfter(Sheet sheet, LocalDateTime after);
}
