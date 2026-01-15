# Quick Setup Guide

## Step-by-Step Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details

2. **Run the Database Schema**
   - Open your Supabase project
   - Go to **SQL Editor**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and run it in the SQL Editor
   - This creates all tables, policies, functions, and triggers

3. **Create Storage Buckets**
   - Go to **Storage** in Supabase dashboard
   - Create bucket: `avatars` (make it public)
   - Create bucket: `chat-media` (keep it private)

4. **Get Your API Credentials**
   - Go to **Settings** → **API**
   - Copy your `Project URL`
   - Copy your `anon/public` key

### 3. Configure Environment Variables

1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 5. Create Your First Account

1. Click "Sign Up"
2. Enter your details:
   - Username (required)
   - Full Name (optional)
   - Email
   - Password
3. Check your email for verification link
4. Click the link to verify your account
5. Sign in with your credentials

### 6. Test the App

1. Open the app in two different browsers (or incognito mode)
2. Create two different accounts
3. Start a chat between them
4. Test real-time messaging!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created the `.env` file
- Check that the variable names are correct (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
- Restart the dev server after creating/editing `.env`

### "Row Level Security policy violation"
- Make sure you ran the complete `supabase-schema.sql` file
- Check that RLS policies were created successfully
- Verify you're signed in with a valid account

### Messages not appearing in real-time
- Check your internet connection
- Verify Supabase Realtime is enabled in your project
- Check browser console for errors

### File uploads not working
- Make sure you created the storage buckets
- Verify bucket names are exactly: `avatars` and `chat-media`
- Check that `avatars` bucket is public

## Next Steps

- Customize the theme colors in `tailwind.config.js`
- Add more features from the blueprint
- Deploy to production (Vercel, Netlify, etc.)
- Set up custom domain
- Enable email templates in Supabase

## Need Help?

- Check the main README.md for detailed documentation
- Review the Supabase documentation
- Open an issue on GitHub
