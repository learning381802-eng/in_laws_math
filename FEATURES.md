# In Laws Math - Interactive Math Platform

A hybrid mathematics blog platform with interactive problems, gamification, and a hidden chat system. Built with Next.js 15, Tailwind CSS v4, Supabase, and Socket.io.

## 🚀 Features

### 1. **Math Rendering with KaTeX**
- Inline math: `$...$`
- Block math: `$$...$$`
- Beautiful rendering of LaTeX equations
- Support for complex mathematical notation

### 2. **Interactive Problems**
- Reusable `<Problem />` component for MDX posts
- Features:
  - "Try it yourself" mode
  - Progressive hints (one at a time)
  - Solution reveal
  - Mark as solved functionality
  - Points tracking
- Difficulty levels: Easy, Medium, Hard
- Tag-based organization

### 3. **User Authentication**
- Email/password authentication via Supabase
- Secure session management with NextAuth
- User profiles with statistics
- Protected routes

### 4. **Gamification System**
- Points system:
  - Easy problems: +10 points
  - Medium problems: +20 points
  - Hard problems: +50 points
- Streak tracking (daily activity)
- Global leaderboard
- Achievement tracking

### 5. **Hidden Chat System**
- **Secret Access**: Click on the word "**everyone**" in the homepage title
- Google Chat-style interface
- Real-time messaging via Socket.io
- User presence indicators
- Typing indicators
- Message history

### 6. **Smart Filtering**
- Filter by difficulty (Easy, Medium, Hard)
- Filter by tags
- Search functionality
- Recommended problems section
- Clean, intuitive UI

### 7. **User Profile**
- Problems solved counter
- Current streak
- Total points
- Recent activity history
- Quick links to leaderboard and blog

### 8. **Leaderboard**
- Top 50 users by points
- Podium display for top 3
- Detailed statistics table
- Real-time updates

## 📁 Project Structure

```
in_laws_math-main/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── messages/       # Messages API
│   │   ├── users/          # Users API
│   │   └── socket/         # Socket.io handler
│   ├── auth/
│   │   ├── signin/         # Sign in page
│   │   └── signup/         # Sign up page
│   ├── blog/               # Blog listing
│   ├── chat/               # Hidden chat page
│   ├── leaderboard/        # Leaderboard page
│   ├── profile/            # User profile
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── Header.tsx          # Enhanced with user status
│   ├── Math.tsx            # KaTeX rendering components
│   ├── Problem.tsx         # Interactive problem component
│   └── SessionProvider.tsx # NextAuth provider
├── lib/
│   ├── auth.ts             # Auth utilities
│   ├── database-types.ts   # TypeScript types
│   ├── supabase.ts         # Supabase client
│   └── hooks/
│       └── useSocket.ts    # Socket.io hook
├── layouts/
│   └── ListLayoutWithTags.tsx  # Enhanced blog layout
├── data/
│   ├── blog/
│   │   └── intro-to-problem-solving.mdx  # Sample post
│   └── siteMetadata.js     # Site configuration
├── css/
│   └── tailwind.css        # Enhanced with animations
├── supabase-schema.sql     # Database schema
└── .env.example            # Environment variables
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Yarn or npm
- Supabase account
- Git

### 1. Clone and Install

```bash
cd in_laws_math-main
npm install --legacy-peer-deps
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Get your credentials from Settings → API

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Usage

### Creating Math Blog Posts

Use the `<Problem />` component in your MDX files:

```mdx
---
title: 'My Math Post'
date: '2026-03-27'
tags: ['math', 'easy', 'algebra']
---

# Introduction

Here's some inline math: $E = mc^2$

And block math:

$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

<Problem
  question="What is 2 + 2?"
  solution="The answer is 4."
  hints={["Count on your fingers", "Use a calculator"]}
  difficulty="easy"
  tags={["arithmetic"]}
/>
```

### Accessing the Chat

1. Go to the homepage
2. Look for the title: "In Laws Math: Math for everyone"
3. Click on the word "**everyone**"
4. You'll be taken to the hidden chat page

### Earning Points

1. Sign up for an account
2. Browse problems in the Blog section
3. Click "Reveal Solution" on any problem
4. Click "Mark as Solved" to earn points
5. Check your progress on the Profile page
6. Compare with others on the Leaderboard

## 🎨 Customization

### Changing Point Values

Edit `components/Problem.tsx`:

```typescript
const difficultyPoints = {
  easy: 10,    // Change these values
  medium: 20,
  hard: 50,
}
```

### Modifying Difficulty Colors

Edit the `difficultyColors` object in `components/Problem.tsx`.

### Adding New Features

The codebase is modular and extensible:
- Add new components to `components/`
- Create API routes in `app/api/`
- Update database schema in `supabase-schema.sql`

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use Row Level Security (RLS) policies in Supabase
- Validate all user inputs
- Keep dependencies updated

## 📊 Database Schema

### Tables

- **users**: User profiles with stats
- **problems**: Interactive problems
- **user_problems**: User progress tracking
- **messages**: Chat messages

See `supabase-schema.sql` for full schema.

## 🚧 Future Enhancements

- [ ] Problem categories
- [ ] Advanced statistics
- [ ] Problem creation by users
- [ ] Comment system for problems
- [ ] Mobile app
- [ ] Export progress feature

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)
- Real-time with [Socket.io](https://socket.io/)
- Math rendering by [KaTeX](https://katex.org/)

---

**Happy Problem Solving! 🧮✨**
