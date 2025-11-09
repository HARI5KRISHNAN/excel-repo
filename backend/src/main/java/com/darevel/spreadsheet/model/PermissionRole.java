package com.darevel.spreadsheet.model;

public enum PermissionRole {
    OWNER,      // Full access, can delete sheet, manage permissions
    EDITOR,     // Can edit and comment
    VIEWER      // Read-only access, can comment
}
