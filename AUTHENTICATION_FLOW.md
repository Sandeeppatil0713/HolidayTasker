# Authentication Flow Diagram

## Visual Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Landing Page (/)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Navbar: [Logo] [Features] [Testimonials] [Login] [Sign Up] │
│  │  Hero: "Plan Your Tasks. Plan Your Trips."               │  │
│  │  CTA Buttons: [Get Started] [Explore Features]           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    │ Click "Log In"            │ Click "Get Started"
                    │                           │ or "Sign Up"
                    ▼                           ▼
        ┌───────────────────────┐   ┌───────────────────────┐
        │   Login Page          │   │   Sign Up Page        │
        │   (/login)            │   │   (/signup)           │
        │                       │   │                       │
        │  [Email Input]        │   │  [Name Input]         │
        │  [Password Input]     │   │  [Email Input]        │
        │  [Login Button]       │   │  [Password Input]     │
        │                       │   │  [Confirm Password]   │
        │  "Don't have account? │   │  [Sign Up Button]     │
        │   Sign Up"            │   │                       │
        │                       │   │  "Already have        │
        │                       │   │   account? Log In"    │
        └───────────────────────┘   └───────────────────────┘
                    │                           │
                    │ Sign Up Link              │ Login Link
                    └───────────┬───────────────┘
                                │
                                │ Successful Auth
                                ▼
        ┌───────────────────────────────────────────────┐
        │         Protected Dashboard Routes            │
        │         (Requires Authentication)             │
        │                                               │
        │  ┌─────────────────────────────────────────┐ │
        │  │  Sidebar Navigation                     │ │
        │  │  - Dashboard Home                       │ │
        │  │  - My Tasks                             │ │
        │  │  - Vacation Planner                     │ │
        │  │  - Calendar                             │ │
        │  │  - Budget Tracker                       │ │
        │  │  - Smart Search                         │ │
        │  │  - Analytics                            │ │
        │  │  - Settings                             │ │
        │  │  - Profile                              │ │
        │  └─────────────────────────────────────────┘ │
        │                                               │
        │  Header: [Menu] [Welcome] [Theme] [Logout]   │
        └───────────────────────────────────────────────┘
                                │
                                │ Click "Logout"
                                ▼
                    ┌───────────────────────┐
                    │  Sign Out             │
                    │  Clear Session        │
                    │  Redirect to Landing  │
                    └───────────────────────┘
```

## Component Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         App.tsx                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              QueryClientProvider                       │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │           ThemeProvider                          │ │  │
│  │  │  ┌────────────────────────────────────────────┐ │ │  │
│  │  │  │         AuthProvider                       │ │ │  │
│  │  │  │  - Manages user state                      │ │ │  │
│  │  │  │  - Handles sign up/in/out                  │ │ │  │
│  │  │  │  - Listens to auth changes                 │ │ │  │
│  │  │  │                                            │ │ │  │
│  │  │  │  ┌──────────────────────────────────────┐ │ │ │  │
│  │  │  │  │        BrowserRouter                 │ │ │ │  │
│  │  │  │  │  - Public Routes:                    │ │ │ │  │
│  │  │  │  │    / (Landing)                       │ │ │ │  │
│  │  │  │  │    /login                            │ │ │ │  │
│  │  │  │  │    /signup                           │ │ │ │  │
│  │  │  │  │                                      │ │ │ │  │
│  │  │  │  │  - Protected Routes:                 │ │ │ │  │
│  │  │  │  │    /dashboard/*                      │ │ │ │  │
│  │  │  │  │    (wrapped in ProtectedRoute)       │ │ │ │  │
│  │  │  │  └──────────────────────────────────────┘ │ │ │  │
│  │  │  └────────────────────────────────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Authentication State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthContext                               │
│                                                              │
│  State:                                                      │
│  ├─ user: User | null                                        │
│  ├─ session: Session | null                                  │
│  └─ loading: boolean                                         │
│                                                              │
│  Methods:                                                    │
│  ├─ signUp(email, password, name)                           │
│  │   └─> Supabase.auth.signUp()                            │
│  │                                                          │
│  ├─ signIn(email, password)                                 │
│  │   └─> Supabase.auth.signInWithPassword()               │
│  │                                                          │
│  └─ signOut()                                               │
│      └─> Supabase.auth.signOut()                           │
│                                                              │
│  Effects:                                                    │
│  ├─ On mount: Get initial session                           │
│  └─ Subscribe to auth state changes                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Client                             │
│                  (src/lib/supabase.ts)                       │
│                                                              │
│  Configuration:                                              │
│  ├─ URL: VITE_SUPABASE_URL                                  │
│  └─ Key: VITE_SUPABASE_ANON_KEY                             │
│                                                              │
│  Features:                                                   │
│  ├─ User authentication                                      │
│  ├─ Session management                                       │
│  ├─ Password hashing                                         │
│  └─ Email verification                                       │
└─────────────────────────────────────────────────────────────┘
```

## Protected Route Logic

```
┌─────────────────────────────────────────────────────────────┐
│              ProtectedRoute Component                        │
│                                                              │
│  const { user, loading } = useAuth()                         │
│                                                              │
│  if (loading) {                                              │
│    return <LoadingSpinner />                                 │
│  }                                                           │
│                                                              │
│  if (!user) {                                                │
│    return <Navigate to="/login" />                           │
│  }                                                           │
│                                                              │
│  return <>{children}</>                                      │
└─────────────────────────────────────────────────────────────┘
```

## User Journey Examples

### New User Journey
```
1. Visit landing page (/)
2. Click "Get Started" button
3. Redirected to /signup
4. Fill form: Name, Email, Password, Confirm Password
5. Click "Sign Up"
6. Account created in Supabase
7. Redirected to /login
8. (Optional) Check email for confirmation
9. Enter credentials on login page
10. Click "Log In"
11. Authenticated and redirected to /dashboard
12. Access all dashboard features
```

### Returning User Journey
```
1. Visit landing page (/)
2. Click "Log In" button
3. Redirected to /login
4. Enter email and password
5. Click "Log In"
6. Authenticated and redirected to /dashboard
7. Access all dashboard features
```

### Logout Journey
```
1. User is on any dashboard page
2. Click "Logout" button in header
3. Session cleared
4. Redirected to landing page (/)
5. Can no longer access dashboard without logging in
```

### Unauthorized Access Attempt
```
1. User (not logged in) tries to visit /dashboard
2. ProtectedRoute checks authentication
3. No user found
4. Automatically redirected to /login
5. After successful login, can access dashboard
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Scenarios                           │
│                                                              │
│  Sign Up Errors:                                             │
│  ├─ Passwords don't match                                    │
│  │   └─> Show error toast                                    │
│  ├─ Password too short (< 6 chars)                           │
│  │   └─> Show error toast                                    │
│  ├─ Email already exists                                     │
│  │   └─> Show Supabase error message                         │
│  └─ Invalid email format                                     │
│      └─> HTML5 validation + Supabase error                   │
│                                                              │
│  Login Errors:                                               │
│  ├─ Invalid credentials                                      │
│  │   └─> Show error toast with message                       │
│  ├─ Email not confirmed                                      │
│  │   └─> Show error toast                                    │
│  └─ Network error                                            │
│      └─> Show error toast                                    │
│                                                              │
│  Protected Route Errors:                                     │
│  └─ No authentication                                        │
│      └─> Redirect to /login                                  │
└─────────────────────────────────────────────────────────────┘
```

## Success Notifications

```
┌─────────────────────────────────────────────────────────────┐
│                  Success Toast Messages                      │
│                                                              │
│  Sign Up Success:                                            │
│  "Account created! Please check your email to verify..."     │
│                                                              │
│  Login Success:                                              │
│  "Logged in successfully!"                                   │
│                                                              │
│  Logout Success:                                             │
│  "You have been successfully logged out."                    │
└─────────────────────────────────────────────────────────────┘
```
