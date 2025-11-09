package com.darevel.spreadsheet.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPresence {
    private String username;
    private String userId;
    private Integer cursorRow;
    private Integer cursorCol;
    private String color; // Hex color for cursor
}
