# Architecture Overview

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AuthPage    │  │ChatDashboard │  │  Components  │      │
│  │  (Sign In/Up)│  │  (Main App)  │  │  (Chat/Msg)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONTEXT PROVIDERS                       │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │   AuthContext        │  │   ChatContext        │        │
│  │  - User state        │  │  - Chats state       │        │
│  │  - Session mgmt      │  │  - Messages state    │        │
│  │  - Online status     │  │  - Real-time subs    │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVICES                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Auth    │ │  Chat    │ │ Message  │ │ Storage  │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - PostgreSQL Database                                │  │
│  │  - Real-time Subscriptions                            │  │
│  │  - Authentication                                      │  │
│  │  - Storage                                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Authentication Flow
```
User Input → AuthPage → AuthContext → authService → Supabase Auth
                ↓
         Update User State
                ↓
         Redirect to Dashboard
```

### Messaging Flow
```
User Types → MessageInput → ChatContext → messageService → Supabase
                                                                ↓
                                                          INSERT message
                                                                ↓
                                                     Real-time broadcast
                                                                ↓
All Participants ← Real-time subscription ← Supabase Realtime
                ↓
         Update messages state
                ↓
         Re-render MessageArea
```

### Real-time Subscriptions
```
ChatContext subscribes to:
├── messages (INSERT, UPDATE, DELETE)
├── typing_indicators (INSERT, UPDATE, DELETE)
├── chat_participants (INSERT, UPDATE, DELETE)
└── users (UPDATE for online status)
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  - id (UUID, PK)                                             │
│  - username (unique)                                         │
│  - full_name, avatar_url, bio                               │
│  - is_online, last_seen                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         CHATS                                │
│  - id (UUID, PK)                                             │
│  - type (private, group, channel)                           │
│  - name, avatar_url, description                            │
│  - created_by → users.id                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│ CHAT_PARTICIPANTS    │  │     MESSAGES         │
│  - chat_id → chats   │  │  - chat_id → chats   │
│  - user_id → users   │  │  - sender_id → users │
│  - role, settings    │  │  - content, type     │
└──────────────────────┘  │  - file_url          │
                          │  - reply_to          │
                          └──────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌──────────────────┐          ┌──────────────────┐
        │ MESSAGE_REACTIONS│          │ MESSAGE_READ_    │
        │  - message_id    │          │   STATUS         │
        │  - user_id       │          │  - message_id    │
        │  - emoji         │          │  - user_id       │
        └──────────────────┘          │  - read_at       │
                                      └──────────────────┘
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY                        │
│                                                               │
│  Users can only:                                             │
│  ✓ View chats they're participants in                       │
│  ✓ Send messages to their chats                             │
│  ✓ Edit/delete their own messages                           │
│  ✓ View profiles of users in their chats                    │
│  ✓ Update their own profile                                 │
│  ✗ Access other users' private data                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
└── AuthProvider
    └── AppContent
        ├── AuthPage (if not authenticated)
        │   ├── Sign In Form
        │   └── Sign Up Form
        │
        └── ChatProvider (if authenticated)
            └── ChatDashboard
                ├── Sidebar
                │   ├── User Header
                │   ├── Search Bar
                │   └── ChatList
                │       └── ChatListItem (multiple)
                │
                └── Main Area
                    ├── Chat Header
                    ├── MessageArea
                    │   ├── MessageBubble (multiple)
                    │   └── TypingIndicator
                    └── MessageInput
```

## 🔄 State Management

### AuthContext State
```typescript
{
  user: User | null,
  session: Session | null,
  loading: boolean,
  signIn: (email, password) => Promise<void>,
  signUp: (...) => Promise<void>,
  signOut: () => Promise<void>,
  updateProfile: (updates) => Promise<void>
}
```

### ChatContext State
```typescript
{
  chats: ChatWithDetails[],
  activeChat: ChatWithDetails | null,
  messages: MessageWithDetails[],
  typingUsers: User[],
  loading: boolean,
  loadChats: () => Promise<void>,
  selectChat: (chatId) => Promise<void>,
  sendMessage: (content, replyToId?) => Promise<void>,
  loadMoreMessages: () => Promise<void>,
  setTyping: (isTyping) => Promise<void>
}
```

## 📡 Real-time Events

### Message Events
```
INSERT → New message received
UPDATE → Message edited
DELETE → Message deleted (soft delete)
```

### Typing Events
```
INSERT/UPDATE → User started typing
DELETE → User stopped typing
Auto-cleanup after 5 seconds
```

### Presence Events
```
UPDATE users.is_online → User online status changed
Heartbeat every 30 seconds
```

## 🎯 Key Features

### ✅ Implemented
- Real-time messaging
- Typing indicators
- Online status
- Read receipts
- Message reactions
- File sharing
- Reply to messages
- Edit/delete messages
- Private & group chats
- Message pagination

### 🔄 Coming Soon
- Voice messages
- Message forwarding
- Advanced search
- User profiles
- Settings page
- Push notifications

### 📅 Future
- Video/Voice calls
- Screen sharing
- End-to-end encryption
- Bots & automation

## 🚀 Performance Optimizations

- **React.memo** for message components
- **Debounced** typing indicators
- **Throttled** scroll handlers
- **Lazy loading** for images
- **Pagination** for messages
- **Optimistic updates** for better UX
- **Connection pooling** in Supabase
- **Indexed queries** for fast lookups

---

This architecture provides a solid foundation for a scalable, real-time messaging application!
