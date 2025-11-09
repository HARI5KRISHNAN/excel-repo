package com.darevel.spreadsheet.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPresenceMessage {
    private String action; // joined, left, cursor_move
    private String username;
    private UserPresence presence;
}
