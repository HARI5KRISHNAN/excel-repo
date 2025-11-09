package com.darevel.spreadsheet.controller;

import com.darevel.spreadsheet.dto.MessageResponse;
import com.darevel.spreadsheet.dto.SheetRequest;
import com.darevel.spreadsheet.dto.SheetResponse;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import com.darevel.spreadsheet.repository.SheetRepository;
import com.darevel.spreadsheet.repository.UserRepository;
import com.darevel.spreadsheet.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/sheets")
public class SheetController {

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

    private SheetResponse convertToResponse(Sheet sheet) {
        return new SheetResponse(
                sheet.getId(),
                sheet.getName(),
                sheet.getData(),
                sheet.getMerges(),
                sheet.getLastSavedAt(),
                sheet.getCreatedAt(),
                sheet.getUpdatedAt()
        );
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveSheet(@Valid @RequestBody SheetRequest sheetRequest) {
        try {
            User currentUser = getCurrentUser();

            Sheet sheet = new Sheet();
            sheet.setName(sheetRequest.getName());
            sheet.setData(sheetRequest.getData());
            sheet.setMerges(sheetRequest.getMerges());
            sheet.setOwner(currentUser);
            sheet.setLastSavedAt(LocalDateTime.now());

            Sheet savedSheet = sheetRepository.save(sheet);

            return ResponseEntity.ok(convertToResponse(savedSheet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error saving sheet: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSheet(@PathVariable Long id, @Valid @RequestBody SheetRequest sheetRequest) {
        try {
            User currentUser = getCurrentUser();

            Sheet sheet = sheetRepository.findByIdAndOwner(id, currentUser)
                    .orElseThrow(() -> new RuntimeException("Sheet not found or access denied"));

            sheet.setName(sheetRequest.getName());
            sheet.setData(sheetRequest.getData());
            sheet.setMerges(sheetRequest.getMerges());
            sheet.setLastSavedAt(LocalDateTime.now());

            Sheet updatedSheet = sheetRepository.save(sheet);

            return ResponseEntity.ok(convertToResponse(updatedSheet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating sheet: " + e.getMessage()));
        }
    }

    @GetMapping("/load")
    public ResponseEntity<?> getAllSheets() {
        try {
            User currentUser = getCurrentUser();

            List<Sheet> sheets = sheetRepository.findByOwnerOrderByUpdatedAtDesc(currentUser);

            List<SheetResponse> responses = sheets.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error loading sheets: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSheet(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();

            Sheet sheet = sheetRepository.findByIdAndOwner(id, currentUser)
                    .orElseThrow(() -> new RuntimeException("Sheet not found or access denied"));

            return ResponseEntity.ok(convertToResponse(sheet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error loading sheet: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSheet(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();

            Sheet sheet = sheetRepository.findByIdAndOwner(id, currentUser)
                    .orElseThrow(() -> new RuntimeException("Sheet not found or access denied"));

            sheetRepository.delete(sheet);

            return ResponseEntity.ok(new MessageResponse("Sheet deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting sheet: " + e.getMessage()));
        }
    }
}
