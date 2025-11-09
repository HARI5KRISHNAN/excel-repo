package com.darevel.spreadsheet.websocket;

import com.darevel.spreadsheet.model.ChangeLog;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.model.User;
import com.darevel.spreadsheet.repository.ChangeLogRepository;
import com.darevel.spreadsheet.repository.SheetRepository;
import com.darevel.spreadsheet.repository.UserRepository;
import com.darevel.spreadsheet.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Controller
@Slf4j
public class CollaborationController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private WebSocketEventListener eventListener;

    @Autowired
    private ChangeLogRepository changeLogRepository;

    @Autowired
    private SheetRepository sheetRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String[] CURSOR_COLORS = {
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
        "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B195", "#C06C84"
    };

    @MessageMapping("/sheet/{sheetId}/join")
    public void joinSheet(@DestinationVariable String sheetId,
                         @Payload Map<String, String> message,
                         SimpMessageHeaderAccessor headerAccessor,
                         Authentication authentication) {

        if (authentication == null) {
            log.warn("Unauthenticated user attempted to join sheet");
            return;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String username = userDetails.getUsername();
        String sessionId = headerAccessor.getSessionId();

        // Store session info
        headerAccessor.getSessionAttributes().put("sheetId", sheetId);
        headerAccessor.getSessionAttributes().put("username", username);

        // Assign a random color to the user
        Random random = new Random();
        String color = CURSOR_COLORS[random.nextInt(CURSOR_COLORS.length)];

        UserPresence presence = new UserPresence(
            username,
            userDetails.getId().toString(),
            0,
            0,
            color
        );

        eventListener.addUser(sheetId, sessionId, presence);

        // Send current active users to the joining user
        Map<String, UserPresence> activeUsers = eventListener.getActiveUsers(sheetId);
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/sheet/" + sheetId + "/users",
            activeUsers
        );

        // Notify others about new user
        UserPresenceMessage presenceMessage = new UserPresenceMessage(
            "joined",
            username,
            presence
        );
        messagingTemplate.convertAndSend("/topic/sheet/" + sheetId + "/presence", presenceMessage);

        log.info("User {} joined sheet {}", username, sheetId);
    }

    @MessageMapping("/sheet/{sheetId}/cursor")
    public void updateCursor(@DestinationVariable String sheetId,
                            @Payload Map<String, Object> cursor,
                            SimpMessageHeaderAccessor headerAccessor,
                            Authentication authentication) {

        if (authentication == null) return;

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String username = userDetails.getUsername();
        String sessionId = headerAccessor.getSessionId();

        Map<String, UserPresence> activeUsers = eventListener.getActiveUsers(sheetId);
        UserPresence presence = activeUsers.get(sessionId);

        if (presence != null) {
            presence.setCursorRow((Integer) cursor.get("row"));
            presence.setCursorCol((Integer) cursor.get("col"));

            UserPresenceMessage message = new UserPresenceMessage(
                "cursor_move",
                username,
                presence
            );

            messagingTemplate.convertAndSend("/topic/sheet/" + sheetId + "/cursors", message);
        }
    }

    @MessageMapping("/sheet/{sheetId}/cell")
    public void updateCell(@DestinationVariable String sheetId,
                          @Payload CellUpdateMessage message,
                          Authentication authentication) {

        if (authentication == null) return;

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        message.setUsername(userDetails.getUsername());
        message.setTimestamp(System.currentTimeMillis());

        // Broadcast cell update to all users in the sheet
        messagingTemplate.convertAndSend("/topic/sheet/" + sheetId + "/cells", message);

        // Log the change
        try {
            Sheet sheet = sheetRepository.findById(message.getSheetId()).orElse(null);
            User user = userRepository.findById(userDetails.getId()).orElse(null);

            if (sheet != null && user != null) {
                ChangeLog changeLog = new ChangeLog();
                changeLog.setSheet(sheet);
                changeLog.setUser(user);
                changeLog.setAction("CELL_EDIT");
                changeLog.setCellRow(message.getRow());
                changeLog.setCellCol(message.getCol());
                changeLog.setNewValue(message.getValue());
                changeLog.setDetails(message.getFormula() != null ?
                    "{\"formula\":\"" + message.getFormula() + "\"}" : null);
                changeLogRepository.save(changeLog);
            }
        } catch (Exception e) {
            log.error("Failed to log cell change", e);
        }

        log.debug("Cell update in sheet {}: ({},{}) = {}",
            sheetId, message.getRow(), message.getCol(), message.getValue());
    }
}
