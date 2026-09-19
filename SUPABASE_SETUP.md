# Supabase Setup for SafeSignal

This guide explains how to set up the backend for the SafeSignal platform using Supabase.

## 1. Create a Supabase Project
1. Go to [database.new](https://database.new/) or log into [Supabase](https://supabase.com/).
2. Create a new project.
3. Wait for the database provisioning to complete.

## 2. Configure Environment Variables
1. In your Supabase dashboard, go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the root of the project folder, duplicate the `.env.example` file and rename it to `.env` (if not done already).
4. Update the values in `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 3. Run Database Migrations
1. In the Supabase dashboard, navigate to the **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/migrations/00001_initial_schema.sql` and run it to create tables (`profiles`, `safety_signals`, `safety_patterns`, `reviews`, `safety_zones`) and configure Row Level Security (RLS).
4. Run `supabase/migrations/00002_trust_score_update.sql` to add trust metrics and anonymous reporter hash columns.
5. Run `supabase/migrations/00003_server_pattern_engine.sql` to enable the automated server-side pattern aggregation trigger.

## 4. Run Seed Data
1. Open a new query tab in the Supabase SQL Editor.
2. Open the file `supabase/seed.sql` from your project folder.
3. Copy the SQL content and paste it into the editor.
4. Click **Run** to populate the database with demo zones and initial mock signals/patterns.

## 5. Set up Authentication
1. Go to **Authentication** -> **Providers** in the Supabase dashboard.
2. Ensure the **Email** provider is enabled (it should be by default).
3. Go to **Authentication** -> **Users** and click **Add user** -> **Create new user**.
4. Enter an email (e.g., `admin@safesignal.org`) and a secure password.
5. *Wait for the user to be created.*
6. To grant Authority dashboard access, go to the **Table Editor**, open the `profiles` table.
7. Find the newly created user row (it is created automatically via triggers).
8. Change their `role` column to `authority` or `admin`.

## 6. Start the App
Run the following in your terminal:
```bash
npm run dev
```

You can now test the anonymous citizen reporting flow on the homepage, and log in at `/authority/login` with your new account to review signals in the dashboard.
