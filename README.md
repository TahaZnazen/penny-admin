# Penny Slot Admin Dashboard

Admin dashboard for managing and monitoring the Penny Slot Telegram Bot. Built with Next.js 14, Tailwind CSS, and shadcn/ui.

## Features

- **Dashboard Home**: Overview of total users, games, wins, and current cycle status
- **Users Management**: Search, filter, and view detailed user profiles
- **Game Sessions**: Track all game sessions with status filters
- **Win History**: Manage wins, mark rewards as claimed, export to CSV
- **Prize Pool Management**: View and adjust cycle settings, reset game cycle
- **Analytics**: Charts showing user registrations, games played, wins over time, and leaderboard

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **Charts**: Recharts
- **Auth**: JWT-based session authentication

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and update the values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Supabase (server-side only)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Admin Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Session
JWT_SECRET=random_32_char_string_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Login

Use the admin credentials configured in your `.env.local` file.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (server-side)
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── prize-pool/
│   │   ├── sessions/
│   │   ├── users/
│   │   └── wins/
│   ├── dashboard/              # Dashboard pages
│   │   ├── analytics/
│   │   ├── prize-pool/
│   │   ├── sessions/
│   │   ├── users/
│   │   └── wins/
│   └── login/
├── components/
│   ├── dashboard/              # Dashboard-specific components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   ├── supabase.ts             # Supabase client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
└── middleware.ts               # Auth middleware
```

## Security Notes

- All Supabase queries run server-side via API routes
- The service_role key is never exposed to the client
- Session tokens expire after 1 hour
- All dashboard routes are protected by authentication middleware

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm run start
```

## Database Schema

The dashboard connects to an existing Supabase database with these tables:

- `users`: Registered users with Telegram/X info
- `game_sessions`: Game codes and their status
- `global_state`: Prize pool cycle configuration
- `win_history`: Record of all wins

See the full schema in the project specification.
