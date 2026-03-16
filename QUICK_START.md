# Quick Start Guide

Get your Holiday Tasker app up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Option A: Quick Setup (Recommended for Testing)

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details and create your project
4. Once created, go to **Settings** → **API**
5. Copy your **Project URL** and **anon/public key**

### Option B: Detailed Setup

Follow the comprehensive guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Start the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Step 5: Test Authentication

1. Click "Get Started" or "Log In" on the landing page
2. Create a new account on the Sign Up page
3. Check your email for confirmation (if enabled in Supabase)
4. Log in with your credentials
5. You'll be redirected to the dashboard!

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct values
- Restart the dev server after changing `.env`

### Can't log in
- Check if email confirmation is required in Supabase settings
- Look for the confirmation email in your inbox/spam

### Build errors
- Make sure all dependencies are installed: `npm install`
- Clear cache and reinstall: `rm -rf node_modules package-lock.json && npm install`

## Next Steps

- Customize the theme colors in `tailwind.config.ts`
- Add more features to the dashboard
- Set up Row Level Security (RLS) in Supabase for data protection
- Deploy to production (Vercel, Netlify, etc.)

## Need Help?

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed authentication setup
- Review [README.md](./README.md) for project overview
- Visit [Supabase Documentation](https://supabase.com/docs)

Happy coding! 🚀
