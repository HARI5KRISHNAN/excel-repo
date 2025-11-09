package com.darevel.spreadsheet.controller;

import com.darevel.spreadsheet.dto.MessageResponse;
import com.darevel.spreadsheet.model.Permission;
import com.darevel.spreadsheet.model.PermissionRole;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import com.darevel.spreadsheet.repository.PermissionRepository;
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
@RequestMapping("/sheets/{sheetId}/permissions")
public class PermissionController {

    @Autowired
    private PermissionRepository permissionRepository;

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

    private boolean hasOwnerPermission(Sheet sheet, User user) {
        if (sheet.getOwner().getId().equals(user.getId())) {
            return true;
        }
        return permissionRepository.findBySheetAndUser(sheet, user)
                .map(p -> p.getRole() == PermissionRole.OWNER)
                .orElse(false);
    }

    @GetMapping
    public ResponseEntity<?> getPermissions(@PathVariable Long sheetId) {
        try {
            User currentUser = getCurrentUser();
            Sheet sheet = sheetRepository.findById(sheetId)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            // Check if user has access
            if (!hasOwnerPermission(sheet, currentUser)) {
                return ResponseEntity.status(403).body(new MessageResponse("Access denied"));
            }

            List<Permission> permissions = permissionRepository.findBySheet(sheet);
            List<Map<String, Object>> response = permissions.stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("username", p.getUser().getUsername());
                map.put("email", p.getUser().getEmail());
                map.put("role", p.getRole().toString());
                map.put("grantedAt", p.getGrantedAt());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> grantPermission(
            @PathVariable Long sheetId,
            @RequestBody Map<String, String> request) {
        try {
            User currentUser = getCurrentUser();
            Sheet sheet = sheetRepository.findById(sheetId)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            if (!hasOwnerPermission(sheet, currentUser)) {
                return ResponseEntity.status(403).body(new MessageResponse("Only owners can grant permissions"));
            }

            String username = request.get("username");
            String roleStr = request.get("role");

            User targetUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            PermissionRole role = PermissionRole.valueOf(roleStr);

            // Check if permission already exists
            Permission permission = permissionRepository.findBySheetAndUser(sheet, targetUser)
                    .orElse(new Permission());

            permission.setSheet(sheet);
            permission.setUser(targetUser);
            permission.setRole(role);
            permission.setGrantedBy(currentUser);

            permissionRepository.save(permission);

            return ResponseEntity.ok(new MessageResponse("Permission granted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{permissionId}")
    public ResponseEntity<?> revokePermission(
            @PathVariable Long sheetId,
            @PathVariable Long permissionId) {
        try {
            User currentUser = getCurrentUser();
            Sheet sheet = sheetRepository.findById(sheetId)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            if (!hasOwnerPermission(sheet, currentUser)) {
                return ResponseEntity.status(403).body(new MessageResponse("Only owners can revoke permissions"));
            }

            permissionRepository.deleteById(permissionId);

            return ResponseEntity.ok(new MessageResponse("Permission revoked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
