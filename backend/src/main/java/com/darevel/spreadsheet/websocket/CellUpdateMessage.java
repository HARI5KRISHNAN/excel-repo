package com.darevel.spreadsheet.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CellUpdateMessage {
    private Long sheetId;
    private Integer row;
    private Integer col;
    private String value;
    private String formula;
    private String username;
    private Long timestamp;
}
