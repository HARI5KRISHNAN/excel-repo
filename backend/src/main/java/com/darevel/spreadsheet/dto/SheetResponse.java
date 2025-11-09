package com.darevel.spreadsheet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SheetResponse {
    private Long id;
    private String name;
    private String data;
    private String merges;
    private LocalDateTime lastSavedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
