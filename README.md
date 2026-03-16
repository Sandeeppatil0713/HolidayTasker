# Holiday Tasker

A comprehensive productivity platform that seamlessly combines daily task management with vacation planning.

## Features

- ✅ Smart To-Do Management (with Supabase storage)
- ✈️ Vacation Planner
- 🔍 Smart Search
- 📊 Analytics Dashboard
- 📅 Calendar Integration
- 🔐 Secure Authentication with Supabase
- 💾 Cloud Data Storage

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd holiday-tasker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase authentication:
   - Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a `.env` file with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Set up the database for tasks:
   - Follow the instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - Run the SQL script in your Supabase SQL Editor
   - This creates the tasks table with Row Level Security

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Authentication

The app includes a complete authentication system powered by Supabase:

- **Sign Up**: Create a new account with name, email, and password
- **Login**: Secure login with email and password
- **Protected Routes**: Dashboard and all features require authentication
- **Logout**: Secure logout functionality
- **Session Management**: Automatic session handling and persistence

For detailed setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## Data Storage

### Tasks Module
All tasks are stored in Supabase with the following features:
- **Persistent Storage**: Tasks are saved to the cloud
- **User Isolation**: Each user can only see their own tasks
- **Real-time Updates**: Changes are reflected immediately
- **Secure Access**: Row Level Security (RLS) protects user data

For detailed integration guide, see [TASKS_INTEGRATION_GUIDE.md](./TASKS_INTEGRATION_GUIDE.md)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── DashboardLayout.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── contexts/        # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── pages/           # Page components
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignUpPage.tsx
│   └── ...
├── lib/             # Utility functions
│   ├── supabase.ts
│   └── utils.ts
└── App.tsx          # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Build Tool**: Vite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
