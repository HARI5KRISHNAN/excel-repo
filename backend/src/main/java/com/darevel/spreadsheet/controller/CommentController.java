package com.darevel.spreadsheet.controller;

import com.darevel.spreadsheet.dto.MessageResponse;
import com.darevel.spreadsheet.model.Comment;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import com.darevel.spreadsheet.repository.CommentRepository;
import com.darevel.spreadsheet.repository.SheetRepository;
import com.darevel.spreadsheet.repository.UserRepository;
import com.darevel.spreadsheet.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/sheets/{sheetId}/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private SheetRepository sheetRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getComments(@PathVariable Long sheetId) {
        try {
            Sheet sheet = sheetRepository.findById(sheetId)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            List<Comment> comments = commentRepository.findBySheetOrderByCreatedAtDesc(sheet);
            List<Map<String, Object>> response = comments.stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("row", c.getCellRow());
                map.put("col", c.getCellCol());
                map.put("content", c.getContent());
                map.put("author", c.getAuthor().getUsername());
                map.put("resolved", c.getResolved());
                map.put("createdAt", c.getCreatedAt());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addComment(
            @PathVariable Long sheetId,
            @RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            Sheet sheet = sheetRepository.findById(sheetId)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            Comment comment = new Comment();
            comment.setSheet(sheet);
            comment.setAuthor(currentUser);
            comment.setCellRow((Integer) request.get("row"));
            comment.setCellCol((Integer) request.get("col"));
            comment.setContent((String) request.get("content"));
            comment.setResolved(false);

            Comment saved = commentRepository.save(comment);

            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("row", saved.getCellRow());
            response.put("col", saved.getCellCol());
            response.put("content", saved.getContent());
            response.put("author", saved.getAuthor().getUsername());
            response.put("resolved", saved.getResolved());
            response.put("createdAt", saved.getCreatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{commentId}/resolve")
    public ResponseEntity<?> resolveComment(
            @PathVariable Long sheetId,
            @PathVariable Long commentId) {
        try {
            User currentUser = getCurrentUser();
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            comment.setResolved(true);
            comment.setResolvedBy(currentUser);
            comment.setResolvedAt(java.time.LocalDateTime.now());

            commentRepository.save(comment);

            return ResponseEntity.ok(new MessageResponse("Comment resolved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long sheetId,
            @PathVariable Long commentId) {
        try {
            User currentUser = getCurrentUser();
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            // Only author can delete
            if (!comment.getAuthor().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(new MessageResponse("Only author can delete"));
            }

            commentRepository.deleteById(commentId);

            return ResponseEntity.ok(new MessageResponse("Comment deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
