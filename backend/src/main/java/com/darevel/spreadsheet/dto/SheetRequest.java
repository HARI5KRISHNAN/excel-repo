package com.darevel.spreadsheet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SheetRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String data;

    private String merges;
}
