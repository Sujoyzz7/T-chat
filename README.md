# T Chat - Telegram-Style Messaging App

A modern, real-time messaging application built with React, TypeScript, Supabase, and Tailwind CSS. This project implements a complete Telegram-style chat experience with real-time messaging, typing indicators, read receipts, and more.

## 🚀 Features

### Phase 1 (MVP) - Implemented
- ✅ **User Authentication** - Sign up, sign in, and session management
- ✅ **Real-time Messaging** - Instant message delivery using Supabase Realtime
- ✅ **Private & Group Chats** - Support for one-on-one and group conversations
- ✅ **Typing Indicators** - See when others are typing
- ✅ **Online Status** - Real-time presence tracking
- ✅ **Message Read Receipts** - Track message delivery and read status
- ✅ **File Sharing** - Upload and share images, videos, audio, and files
- ✅ **Message Reactions** - React to messages with emojis
- ✅ **Reply to Messages** - Quote and reply to specific messages
- ✅ **Message Editing** - Edit sent messages
- ✅ **Message Deletion** - Delete messages
- ✅ **Beautiful UI** - Telegram-inspired dark theme with smooth animations

### Phase 2 (Coming Soon)
- 🔄 Voice messages
- 🔄 Message forwarding
- 🔄 Advanced search
- 🔄 User profiles and settings

### Phase 3 (Future)
- 📅 Video/Voice calls (WebRTC)
- 📅 Screen sharing
- 📅 Polls in groups
- 📅 Bots and automation

### Phase 4 (Future)
- 📅 End-to-end encryption
- 📅 Secret chats
- 📅 Self-destructing messages

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite
- **Date Formatting**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Tchat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor
4. This will create all necessary tables, indexes, RLS policies, and functions

### 4. Create Storage Buckets

In your Supabase dashboard, go to **Storage** and create two buckets:

1. **avatars** (Public bucket)
   - Used for user and group avatars
   - Enable public access

2. **chat-media** (Private bucket)
   - Used for chat media (images, videos, files, etc.)
   - Keep private with RLS policies

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these in your Supabase project settings under **API**.

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── AuthPage.tsx          # Authentication UI
│   ├── chat/
│   │   ├── ChatList.tsx          # List of user's chats
│   │   ├── MessageArea.tsx       # Message display area
│   │   ├── MessageBubble.tsx     # Individual message component
│   │   └── MessageInput.tsx      # Message input with typing indicators
│   └── dashboard/
│       └── ChatDashboard.tsx     # Main chat interface
├── contexts/
│   ├── AuthContext.tsx           # Authentication state management
│   └── ChatContext.tsx           # Chat and message state with real-time
├── services/
│   ├── authService.ts            # Authentication API calls
│   ├── chatService.ts            # Chat management API calls
│   ├── messageService.ts         # Message operations API calls
│   └── storageService.ts         # File upload/download
├── types/
│   └── database.types.ts         # TypeScript type definitions
├── lib/
│   └── supabase.ts               # Supabase client configuration
├── App.tsx                       # Main app component
├── main.tsx                      # React entry point
└── index.css                     # Global styles and Tailwind config
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User profiles and online status
- **chats** - Chat metadata (private, group, channel)
- **chat_participants** - Chat membership and settings
- **messages** - Message content and metadata
- **message_reactions** - Emoji reactions to messages
- **message_read_status** - Read receipts
- **typing_indicators** - Real-time typing status
- **contacts** - User contacts and blocked users

See `supabase-schema.sql` for the complete schema with RLS policies.

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access chats they're participants in
- Messages are protected by chat membership
- File uploads are validated and stored securely
- Authentication handled by Supabase Auth

## 🎨 Design Philosophy

The UI is inspired by Telegram's clean, modern design:

- **Dark theme** with carefully chosen colors
- **Smooth animations** for better UX
- **Responsive layout** for all screen sizes
- **Intuitive navigation** and interactions
- **Performance-focused** with optimized rendering

## 📱 Real-time Features

The app uses Supabase Realtime for:

- **New messages** - Instant delivery
- **Typing indicators** - See who's typing
- **Online status** - Real-time presence
- **Read receipts** - Message read status
- **Chat updates** - New chats and changes

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🧪 Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Consistent naming conventions
- Component-based architecture

### Best Practices

- Use React hooks for state management
- Implement error boundaries
- Optimize re-renders with React.memo
- Clean up subscriptions and timers
- Validate user input

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, Supabase, and Tailwind CSS**
