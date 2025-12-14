# Humanify - AI Content Humanizer

Transform AI-generated text into natural, human-sounding writing instantly.

## Overview

Humanify is a production-ready SaaS application that converts AI-generated content into natural, human-sounding text. Built with Next.js 16, it provides a seamless experience for content creators, students, and professionals who want to make their AI-generated content more authentic.

## Tech Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Animations
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

### Backend & Infrastructure
- **Authentication**: Supabase Auth (Email/Password)
- **Database**: Supabase (PostgreSQL)
- **AI Providers**:
  - Google Gemini 2.0 Flash (Free tier)
  - Anthropic Claude 3.5 Sonnet (Pro BYOK)
- **Payments**: Stripe (Webhook-based)
- **Rate Limiting**: Upstash Redis + Supabase
- **Email**: Resend
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Deployment**: Vercel-ready

## Features

### ✅ Fully Implemented

#### Core Functionality
- **AI Text Humanization**: Transform AI text with 4 tone options (Casual, Professional, Academic, Neutral)
- **Multi-AI Support**: Automatic provider routing (Gemini for free, Claude for Pro with BYOK)
- **Real-time Processing**: Live feedback with loading states and progress indicators
- **Character Limits**: 1,000 for free tier, 10,000 for Pro tier

#### Authentication & User Management
- **Email/Password Auth**: Full signup, login, and session management via Supabase
- **Password Reset**: Complete forgot password flow with email verification
- **Protected Routes**: Middleware-based route protection
- **Admin System**: Role-based access control with database-driven permissions

#### Rate Limiting & Usage Tracking
- **Dual-Layer Rate Limiting**: IP-based (Upstash Redis) + User-based (Supabase)
- **Usage Limits**: 10 humanizations/day (free), unlimited (Pro)
- **Real-time Usage Dashboard**: Live usage tracking with progress bars
- **History & Analytics**: Full humanization history with search and filtering

#### Pro Access System (Waitlist Model)
- **Pro Request Submission**: Users can request Pro access with custom messages
- **Admin Approval Dashboard**: Review and approve/reject Pro requests
- **Automatic Upgrades**: Database-driven plan upgrades on approval
- **Email Notifications**:
  - Request received confirmation
  - Approval/rejection notifications
  - Welcome emails

#### Payment Integration (Stripe)
- **Webhook Handling**: Subscription lifecycle management
- **Customer Portal**: Subscription management via Stripe portal
- **Status Tracking**: Real-time subscription status sync

#### UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode**: System-aware theme switching
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Empty States**: Helpful guidance when no data exists
- **Error Handling**: User-friendly error messages with recovery suggestions
- **Toast Notifications**: Real-time feedback for all actions
- **Loading Skeletons**: Smooth loading experiences

#### Developer Experience
- **Type Safety**: Full TypeScript coverage
- **API Error Handling**: Standardized error responses with codes
- **Request Logging**: Comprehensive logging for debugging
- **Secure Storage**: AES-256-GCM encryption for sensitive data (API keys)
- **Input Validation**: Zod schemas for all API endpoints
- **Safe Error Logging**: No sensitive data exposed in logs

### ⚠️ Partially Implemented

- **API Key Management**: Database table exists but UI incomplete
- **Stripe Direct Payments**: Configured but using waitlist model instead

### ❌ Not Yet Implemented

- **Google OAuth**: Buttons removed (email/password only for now)
- **Automated Testing**: No test suite (manual testing only)
- **Advanced Analytics Dashboard**: Basic tracking only
- **Bulk Processing**: Single text only
- **Multi-language Support**: English only
- **Browser Extension**: Not started
- **Public API Access**: No API key generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Resend account (for emails)
- PostHog account (optional, for analytics)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Humanify
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_claude_api_key  # Optional, for Pro users

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_64_character_hex_key

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Stripe (Optional if using waitlist model)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM="Humanify <noreply@yourdomain.com>"

# Analytics & Monitoring (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=sntrys_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

See individual setup guides:
- [Supabase Setup](./docs/SUPABASE_SETUP.md)
- [Stripe Setup](./docs/STRIPE_SETUP.md)
- [Backend Setup](./docs/BACKEND_SETUP.md)
- [Sentry Setup](./SENTRY_SETUP.md)
- [PostHog Setup](./POSTHOG_SETUP.md)

4. **Run database migrations:**

Follow the Supabase setup guide to create tables and set up Row Level Security (RLS).

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
Humanify/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin endpoints (pro requests)
│   │   ├── humanize/             # Text humanization
│   │   ├── stripe/               # Payment webhooks
│   │   ├── user/                 # User management (profile, usage, history)
│   │   └── pro-request/          # Pro access requests
│   ├── dashboard/                # User dashboard
│   │   ├── page.tsx              # Main humanization interface
│   │   ├── history/              # Humanization history
│   │   ├── settings/             # User settings
│   │   ├── api-settings/         # API key management
│   │   └── request-pro/          # Pro access request form
│   ├── admin/                    # Admin panel
│   │   └── pro-requests/         # Approve/reject Pro requests
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── forgot-password/          # Password reset request
│   ├── reset-password/           # Password reset form
│   ├── pricing/                  # Pricing page
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Dashboard components
│   ├── analytics-provider.tsx   # PostHog wrapper
│   ├── query-provider.tsx       # React Query provider
│   ├── theme-provider.tsx       # Dark mode provider
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility functions
│   ├── ai/                       # AI integration (Gemini, Claude)
│   ├── analytics/                # PostHog configuration
│   ├── api/                      # API utilities
│   ├── auth/                     # Auth helpers
│   ├── email/                    # Email templates & sending (Resend)
│   ├── supabase/                 # Supabase clients
│   └── utils.ts                  # General utilities
├── docs/                         # Documentation
│   ├── BACKEND_SETUP.md
│   ├── STRIPE_SETUP.md
│   └── SUPABASE_SETUP.md
├── middleware.ts                 # Auth & admin middleware
├── instrumentation-client.ts    # Sentry client setup
└── PROGRESS.md                   # Development progress

```

## Development

### Build for Production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

### Database Migrations

All database migrations are in the Supabase dashboard. See [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for SQL scripts.

### Admin Access

To grant admin access to a user:

```sql
UPDATE users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables (same as .env.local)
4. Deploy!

**Important**: After deployment, update:
- Supabase Auth redirect URLs
- Stripe webhook endpoint
- NEXT_PUBLIC_APP_URL to production domain

## Security

- **Authentication**: Supabase Auth with secure cookie-based sessions
- **Authorization**: Middleware + RLS policies on all routes
- **Admin Protection**: Multi-layer security (middleware + database checks)
- **Rate Limiting**: DDoS protection via Upstash Redis
- **Data Encryption**: AES-256-GCM for sensitive API keys
- **Input Validation**: Zod schemas on all API endpoints
- **Safe Logging**: No API keys or sensitive data in logs
- **CORS**: Configured for production domain only

## Known Limitations

1. **No Automated Tests**: Currently relies on manual testing
2. **Rate Limit Bypass**: Users can create multiple accounts (consider device fingerprinting)
3. **No Query Optimization**: May be slow with large datasets (needs server-side pagination)
4. **Type Safety**: Some @ts-ignore comments due to Supabase type generation issues
5. **Manual Pro Approvals**: No automated payment flow (waitlist model only)

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

All rights reserved © 2025 Humanify

---

Built with ❤️ using Next.js, Supabase, and AI
