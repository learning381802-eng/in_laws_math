# 🚀 Quick Setup Guide for In Laws Math

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

**Required packages to install:**
```bash
npm install @supabase/supabase-js next-auth @auth/supabase-adapter katex @types/katex socket.io socket.io-client uuid @types/uuid --legacy-peer-deps
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to initialize

### 2.2 Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase-schema.sql`
4. Paste and click **Run**
5. Verify all tables are created: `users`, `problems`, `user_problems`, `messages`

### 2.3 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Generate secret with: openssl rand -base64 32
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test Features

### ✅ Math Rendering
1. Visit `/blog/intro-to-problem-solving`
2. Verify LaTeX equations render correctly
3. Check both inline `$...$` and block `$$...$$` math

### ✅ Interactive Problems
1. Scroll to the problem component in the post
2. Click "Show Hint" - should reveal hints one at a time
3. Click "Reveal Solution"
4. Try "Mark as Solved" (requires sign-in)

### ✅ Authentication
1. Click "Sign In" in the header
2. Create a new account at `/auth/signup`
3. Verify email (if enabled in Supabase)
4. Sign in and check profile page

### ✅ Profile & Gamification
1. Visit `/profile` (must be signed in)
2. Verify stats display
3. Solve a problem and check points update

### ✅ Leaderboard
1. Visit `/leaderboard`
2. Verify user rankings display
3. Check podium for top 3

### ✅ Hidden Chat
1. Go to homepage
2. Click on "**everyone**" in the title
3. Should route to `/chat`
4. Sign in if prompted
5. Select a user and send a message

### ✅ Smart Filtering
1. Visit `/blog`
2. Try difficulty filters (🟢 Easy, 🟡 Medium, 🔴 Hard)
3. Use search bar
4. Click tags in sidebar

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install --legacy-peer-deps
```

### Supabase connection errors
- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Ensure database schema was run successfully

### Socket.io connection fails
- Check that `/api/socket` route exists
- Verify WebSocket is not blocked by firewall
- Try refreshing the page

### Math not rendering
- Ensure KaTeX CSS is imported
- Check `contentlayer.config.ts` has math plugins
- Rebuild: `npm run build`

### Authentication issues
- Verify `NEXTAUTH_SECRET` is set
- Check Supabase RLS policies
- Clear browser cookies and try again

## 📱 Testing the Chat Feature

The chat is **hidden** and can only be accessed by:
1. Going to the homepage
2. Clicking on "**everyone**" in "In Laws Math: Math for everyone"

This is intentional - there are no visible links to the chat!

## 🎯 Next Steps

1. **Create more problems**: Add `<Problem />` components to your MDX posts
2. **Customize styling**: Edit `css/tailwind.css` for custom animations
3. **Add content**: Create blog posts in `data/blog/`
4. **Deploy**: Push to Vercel/Netlify with environment variables

## 📞 Support

If you encounter issues:
1. Check the console for errors
2. Verify all environment variables
3. Review Supabase logs
4. Check `FEATURES.md` for detailed documentation

---

**Ready to start solving? Visit [http://localhost:3000](http://localhost:3000)! 🧮✨**
