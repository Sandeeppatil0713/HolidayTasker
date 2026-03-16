# Supabase Authentication Setup

This guide will help you set up Supabase authentication for the Holiday Tasker application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)

## Setup Steps

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Project name: `holiday-tasker` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project" and wait for it to initialize

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find two important values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon/public key**: This is your `VITE_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Configure Email Authentication (Optional)

By default, Supabase requires email confirmation. To configure this:

1. Go to **Authentication** → **Providers** → **Email**
2. Configure your email settings:
   - **Enable Email provider**: ON
   - **Confirm email**: Toggle based on your preference
   - **Secure email change**: Toggle based on your preference

### 5. Configure Email Templates (Optional)

Customize the email templates sent to users:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### 6. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the signup page and create a test account
3. Check your email for the confirmation link (if email confirmation is enabled)
4. Try logging in with your credentials

## Authentication Flow

### Sign Up
- User fills out the signup form with name, email, password, and password confirmation
- The app creates a new user in Supabase Auth
- User metadata (name) is stored in the user's profile
- If email confirmation is enabled, user receives a confirmation email

### Login
- User enters email and password
- Supabase validates credentials
- On success, user is redirected to the dashboard
- Session is maintained automatically

### Protected Routes
- All dashboard routes are protected
- Unauthenticated users are redirected to the login page
- Authentication state is managed globally via AuthContext

## Security Best Practices

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Use Row Level Security (RLS)** - Enable RLS on your database tables
3. **Rotate keys regularly** - Especially if they're exposed
4. **Use environment-specific projects** - Separate projects for development and production

## Troubleshooting

### "Invalid API key" error
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes
- Restart your development server after changing `.env`

### Email not sending
- Check your email provider settings in Supabase
- For development, check the Supabase logs for email delivery status
- Consider using a custom SMTP provider for production

### User not redirecting after login
- Check browser console for errors
- Verify that the AuthContext is properly wrapped around your app
- Ensure ProtectedRoute component is working correctly

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
