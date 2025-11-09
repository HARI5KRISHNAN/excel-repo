package com.darevel.spreadsheet.controller;

import com.darevel.spreadsheet.dto.MessageResponse;
import com.darevel.spreadsheet.model.ChangeLog;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.repository.ChangeLogRepository;
import com.darevel.spreadsheet.repository.SheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/sheets/{sheetId}/changelog")
public class ChangeLogController {

    @Autowired
    private ChangeLogRepository changeLogRepository;

    @Autowired
    private SheetRepository sheetRepository;

    @GetMapping
    public ResponseEntity<?> getChangeLogs(
            @PathVariable Long sheetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Sheet sheet = sheetRepository.findById(sheetId)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            Pageable pageable = PageRequest.of(page, size);
            Page<ChangeLog> changeLogs = changeLogRepository.findBySheet(sheet, pageable);

            List<Map<String, Object>> response = changeLogs.getContent().stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("action", c.getAction());
                map.put("row", c.getCellRow());
                map.put("col", c.getCellCol());
                map.put("oldValue", c.getOldValue());
                map.put("newValue", c.getNewValue());
                map.put("username", c.getUser().getUsername());
                map.put("timestamp", c.getTimestamp());
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("logs", response);
            result.put("totalPages", changeLogs.getTotalPages());
            result.put("totalElements", changeLogs.getTotalElements());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
