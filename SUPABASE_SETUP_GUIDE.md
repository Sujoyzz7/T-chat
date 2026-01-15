# 🚨 SUPABASE SETUP REQUIRED

## The "Database error saving new user" Error

This error occurs because **Supabase is not configured yet**. Follow these steps:

---

## ✅ Step-by-Step Setup

### 1️⃣ Create Supabase Account & Project

1. Go to **[https://supabase.com](https://supabase.com)**
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or email
4. Click **"New Project"**
5. Fill in:
   - **Name**: `telegram-chat` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup to complete

---

### 2️⃣ Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` in your project folder
4. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: **"Success. No rows returned"**

This creates all the tables, policies, functions, and triggers.

---

### 3️⃣ Create Storage Buckets

1. Go to **Storage** in the left sidebar
2. Click **"Create a new bucket"**
3. Create first bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **YES** (check this!)
   - Click **"Create bucket"**
4. Create second bucket:
   - **Name**: `chat-media`
   - **Public bucket**: ❌ **NO** (leave unchecked)
   - Click **"Create bucket"**

---

### 4️⃣ Get Your API Credentials

1. Go to **Settings** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

4. **Copy both values** - you'll need them next!

---

### 5️⃣ Update Your `.env` File

1. Open the `.env` file in your project root (e:\vs\Tchat\.env)
2. Replace the placeholder values:

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

3. **Save the file** (Ctrl+S)

---

### 6️⃣ Restart Your Dev Server

1. **Stop the current server**: Press `Ctrl+C` in the terminal
2. **Start it again**:
   ```bash
   npm run dev
   ```

---

## ✅ Verify Setup

After completing all steps, try to sign up again. You should now be able to:

1. ✅ Create an account
2. ✅ Receive a verification email
3. ✅ Sign in after verification
4. ✅ See the chat dashboard

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after editing `.env`

### "Row Level Security policy violation"
- Make sure you ran the **complete** `supabase-schema.sql` file
- Check SQL Editor for any errors when running the schema
- Verify all tables were created in **Table Editor**

### "Storage bucket not found"
- Create both buckets: `avatars` (public) and `chat-media` (private)
- Check exact spelling - names must match exactly

### Still getting database errors?
- Go to Supabase **Logs** → **Postgres Logs** to see detailed errors
- Check that your project is not paused (free tier pauses after inactivity)
- Verify your database password is correct

---

## 📋 Quick Checklist

Before trying to sign up, verify:

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Both storage buckets created (`avatars` public, `chat-media` private)
- [ ] `.env` file has correct URL and anon key
- [ ] Dev server restarted after updating `.env`
- [ ] No errors in browser console (F12)

---

## 🎯 What the Schema Creates

When you run `supabase-schema.sql`, it creates:

- **8 tables**: users, chats, chat_participants, messages, message_reactions, message_read_status, typing_indicators, contacts
- **RLS policies**: Security rules so users can only see their own data
- **Functions**: Helper functions like `create_or_get_private_chat`
- **Triggers**: Auto-create user profile when signing up
- **Indexes**: For fast queries

---

## 🆘 Need More Help?

1. Check the browser console (F12) for detailed error messages
2. Check Supabase **Logs** for backend errors
3. Review `SETUP.md` for detailed instructions
4. Make sure you're using the **free tier** (no credit card needed)

---

**Once setup is complete, the app will work perfectly! 🚀**
