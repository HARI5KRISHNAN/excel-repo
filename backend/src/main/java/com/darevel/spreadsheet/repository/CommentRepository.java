package com.darevel.spreadsheet.repository;

import com.darevel.spreadsheet.model.Comment;
import com.darevel.spreadsheet.model.Sheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findBySheet(Sheet sheet);
    List<Comment> findBySheetAndCellRowAndCellCol(Sheet sheet, Integer cellRow, Integer cellCol);
    List<Comment> findBySheetAndResolved(Sheet sheet, Boolean resolved);
    List<Comment> findBySheetOrderByCreatedAtDesc(Sheet sheet);
}
