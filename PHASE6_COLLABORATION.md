# Phase 6: Real-time Collaboration

## Overview

Phase 6 implements Google Sheets-like real-time collaboration features including:
- ✅ WebSocket support with STOMP protocol
- ✅ Live cursor tracking
- ✅ User presence awareness
- ✅ Cell-level comments
- ✅ Change log tracking
- ✅ Permission management (Owner, Editor, Viewer)

## Backend Implementation (✅ Complete)

### New Dependencies Added

Added to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### Database Entities

1. **Permission** - Manages user access to sheets
   - Roles: OWNER, EDITOR, VIEWER
   - Tracks who granted permission
   - Unique constraint: one permission per user per sheet

2. **Comment** - Cell-level comments
   - Linked to specific cell (row, col)
   - Can be resolved/unresolved
   - Tracks author and resolver

3. **ChangeLog** - Tracks all sheet modifications
   - Records action type (CELL_EDIT, CELL_FORMAT, MERGE, etc.)
   - Stores old and new values
   - Timestamps all changes

### WebSocket Configuration

- **Endpoint**: `/ws` (with SockJS fallback)
- **Message Broker**: `/topic` for broadcasts, `/queue` for user-specific
- **STOMP Protocol**: For reliable message delivery

### WebSocket Message Types

1. **Join Sheet** (`/app/sheet/{sheetId}/join`)
   - User joins a sheet for collaboration
   - Receives list of active users
   - Gets assigned a random cursor color

2. **Cursor Updates** (`/app/sheet/{sheetId}/cursor`)
   - Broadcasts cursor position to all users
   - Shows who is editing where

3. **Cell Updates** (`/app/sheet/{sheetId}/cell`)
   - Real-time cell edits
   - Automatically logged to changelog

4. **Presence** (`/topic/sheet/{sheetId}/presence`)
   - User joined/left notifications
   - Active user list updates

### REST API Endpoints

**Permissions:**
- `GET /api/sheets/{sheetId}/permissions` - List all permissions
- `POST /api/sheets/{sheetId}/permissions` - Grant permission
- `DELETE /api/sheets/{sheetId}/permissions/{id}` - Revoke permission

**Comments:**
- `GET /api/sheets/{sheetId}/comments` - Get all comments
- `POST /api/sheets/{sheetId}/comments` - Add comment
- `PUT /api/sheets/{sheetId}/comments/{id}/resolve` - Resolve comment
- `DELETE /api/sheets/{sheetId}/comments/{id}` - Delete comment

**Change Log:**
- `GET /api/sheets/{sheetId}/changelog?page=0&size=50` - Get change history

## Frontend Implementation (🚧 In Progress)

### Dependencies to Install

```bash
npm install @stomp/stompjs sockjs-client
```

Added to `package.json`:
- `@stomp/stompjs` - STOMP client for WebSocket
- `sockjs-client` - SockJS client for fallback

### Services to Create

1. **websocketService.ts** - WebSocket connection management
2. **collaborationService.ts** - Real-time sync logic
3. **commentService.ts** - Comment API calls
4. **permissionService.ts** - Permission API calls

### Components to Create

1. **CollaborationContext.tsx** - Global collaboration state
2. **LiveCursors.tsx** - Show other users' cursors
3. **UserPresenceIndicator.tsx** - Show active users
4. **CommentPanel.tsx** - Comment sidebar
5. **CommentThread.tsx** - Comment display
6. **AddCommentButton.tsx** - Add comment to cell
7. **ChangeLogViewer.tsx** - View change history
8. **PermissionManager.tsx** - Share sheet modal
9. **ShareButton.tsx** - Trigger share modal

### UI Updates Needed

1. **App.tsx**
   - Add CollaborationContext provider
   - Initialize WebSocket connection
   - Handle incoming cell updates

2. **Spreadsheet.tsx**
   - Render LiveCursors overlay
   - Show comment indicators on cells
   - Display UserPresenceIndicator

3. **Cell.tsx**
   - Add comment button on hover
   - Highlight cells with comments
   - Show cursor when other user is editing

4. **Toolbar.tsx**
   - Add Share button
   - Add Comments toggle
   - Add Change Log button

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend                  │
│  ┌────────────────────────────────────┐ │
│  │  STOMP Client (SockJS)              │ │
│  │  - Connect to /ws                   │ │
│  │  - Subscribe to topics              │ │
│  │  - Send messages                    │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │ WebSocket + HTTP
               │
┌──────────────▼──────────────────────────┐
│      Spring Boot Backend                │
│  ┌────────────────────────────────────┐ │
│  │  WebSocket Config                  │ │
│  │  - STOMP endpoint: /ws             │ │
│  │  - Message broker: /topic, /queue  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  CollaborationController           │ │
│  │  - Handle join, cursor, cell msgs  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  REST Controllers                  │ │
│  │  - Permissions, Comments, ChangeLo│ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────┐
│         H2 Database                     │
│  - permissions table                    │
│  - comments table                       │
│  - change_logs table                    │
└─────────────────────────────────────────┘
```

## Message Flow

### User Joins Sheet

```
Frontend → /app/sheet/123/join
Backend → Assigns color, adds to active users
Backend → /queue/sheet/123/users (to joiner only)
Backend → /topic/sheet/123/presence (to all)
```

### User Moves Cursor

```
Frontend → /app/sheet/123/cursor {row: 5, col: 3}
Backend → /topic/sheet/123/cursors (to all except sender)
```

### User Edits Cell

```
Frontend → /app/sheet/123/cell {row: 2, col: 1, value: "hello"}
Backend → Saves to ChangeLog
Backend → /topic/sheet/123/cells (to all)
Frontend (others) → Update cell in UI
```

### User Adds Comment

```
Frontend → POST /api/sheets/123/comments
Backend → Saves to database
Frontend → Fetch updated comments
Frontend → Show comment indicator
```

## Testing Collaboration

### 1. Start Backend

```bash
cd backend
mvn spring-boot:run
```

### 2. Start Frontend (Multiple Windows)

Open 2-3 browser windows:
```
http://localhost:3003
```

### 3. Login with Different Users

- Window 1: Login as user1
- Window 2: Login as user2
- Window 3: Login as user3

### 4. Open Same Sheet

All users load the same sheet ID

### 5. Test Features

- **Live Cursors**: Move cursor, see it in other windows
- **Real-time Edits**: Edit a cell, see update immediately
- **Comments**: Add comment, see in other windows
- **Change Log**: View who edited what
- **Permissions**: Share sheet with specific users

## Security

- ✅ JWT authentication for WebSocket connections
- ✅ Permission checks before broadcasting
- ✅ Only sheet collaborators receive updates
- ✅ Comment authors can delete their own comments
- ✅ Only owners can manage permissions

## Performance Considerations

- Uses in-memory message broker (simple broker)
- For production, consider Redis or RabbitMQ
- Cursor updates throttled client-side
- Change log pagination (50 entries per page)

## Next Steps

1. ✅ Backend WebSocket setup complete
2. ⬜ Frontend WebSocket client
3. ⬜ Live cursor rendering
4. ⬜ Comment UI components
5. ⬜ Change log viewer
6. ⬜ Permission management UI
7. ⬜ End-to-end testing

## Production Deployment

### For Production, Add:

1. **Redis for Scaling**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

2. **Configure Message Broker**
```java
config.enableStompBrokerRelay("/topic", "/queue")
    .setRelayHost("localhost")
    .setRelayPort(61613);
```

3. **Add Rate Limiting**
- Limit cursor updates to 10/second
- Limit cell edits based on permission
- Throttle presence broadcasts

4. **Monitor Connections**
- Track active WebSocket sessions
- Log connection/disconnection events
- Alert on unusual patterns

## Troubleshooting

**WebSocket won't connect:**
- Check CORS configuration includes your frontend origin
- Verify `/ws` endpoint is accessible
- Check browser console for connection errors

**Messages not received:**
- Verify subscription to correct topic
- Check authentication is working
- Look for errors in Spring Boot logs

**Cursors not showing:**
- Ensure users joined the same sheet ID
- Check cursor color assignment
- Verify presence messages are being sent

**Comments not saving:**
- Check user has EDITOR or VIEWER permission
- Verify sheet ID is correct
- Check database logs for errors

## Demo Video Script

1. Open two browser windows side-by-side
2. Login as different users
3. Open the same sheet
4. Show active user indicators
5. Move cursor in one window, see in other
6. Edit cell in one window, see in other
7. Add comment to a cell
8. View comment in second window
9. Resolve comment
10. View change log
11. Share sheet with another user
12. Test different permission levels

---

**Status**: Backend Complete ✅ | Frontend In Progress 🚧

Next: Complete frontend WebSocket integration
