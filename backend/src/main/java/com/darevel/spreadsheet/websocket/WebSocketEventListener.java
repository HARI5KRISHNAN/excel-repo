package com.darevel.spreadsheet.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class WebSocketEventListener {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    // Track active users per sheet
    private final Map<String, Map<String, UserPresence>> activeUsers = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("New WebSocket connection established");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String sheetId = (String) headerAccessor.getSessionAttributes().get("sheetId");
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (sheetId != null && username != null) {
            removeUser(sheetId, sessionId);
            // Notify others that user left
            messagingTemplate.convertAndSend("/topic/sheet/" + sheetId + "/presence",
                    new UserPresenceMessage("left", username, null));
            log.info("User {} left sheet {}", username, sheetId);
        }
    }

    public void addUser(String sheetId, String sessionId, UserPresence presence) {
        activeUsers.computeIfAbsent(sheetId, k -> new ConcurrentHashMap<>())
                .put(sessionId, presence);
    }

    public void removeUser(String sheetId, String sessionId) {
        Map<String, UserPresence> sheetUsers = activeUsers.get(sheetId);
        if (sheetUsers != null) {
            sheetUsers.remove(sessionId);
            if (sheetUsers.isEmpty()) {
                activeUsers.remove(sheetId);
            }
        }
    }

    public Map<String, UserPresence> getActiveUsers(String sheetId) {
        return activeUsers.getOrDefault(sheetId, new ConcurrentHashMap<>());
    }
}
