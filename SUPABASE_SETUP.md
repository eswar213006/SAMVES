# SAMVES Supabase Setup

## Current integration status

The project is still a client-rendered Vite app. This increment adds a Supabase client boundary, the database/RLS migration, a protected `/admin` sign-in and profile editor, and a public read of published profiles. Until you complete the steps below, the public chooser is explicitly labeled preview-only and its other content remains in-memory. Do not treat browser preview edits, file object URLs, or the unconfigured Admin route as persistent storage.

The migration establishes tables and security policies for summaries, project categories/projects, coding platforms, resumes, certifications, badges, profile assignments, design settings, revisions, and a private storage bucket. This first admin screen currently manages profiles only. Content editors, role assignment management, signed-file delivery, persistent uploads, full published-content reads, and live design settings remain future phases.

## 1. Create and configure Supabase

1. Create a Supabase project and keep its database password in your password manager.
2. In **Authentication > Providers**, enable Email/password sign-in.
3. In **Authentication > Settings**, disable public sign-ups. Invite only the administrator email from the Supabase dashboard; do not create a public registration flow.
4. Open **SQL Editor**, paste and run `supabase/migrations/202610110001_initial_portfolio_schema.sql`.
5. Confirm the four seeded profiles and two empty project categories exist in `public.portfolio_profiles` and `public.project_categories`.

The migration seeds the four existing profile modes as published and leaves portfolio prose/projects/resumes/certifications empty. It seeds the two requested category labels and four Coding Journey platform definitions with blank URLs and null question counts. No personal data or achievements are inserted.

## 2. Authorize the initial administrator

1. Invite the administrator from the Supabase Auth dashboard and complete the invitation.
2. In **SQL Editor**, find the invited user's UUID:

```sql
select id, email from auth.users where email = 'ADMIN_EMAIL_HERE';
```

3. Copy the returned UUID and add only that user to the allowlist:

```sql
insert into public.admin_allowlist(user_id)
values ('AUTH_USER_UUID_HERE');
```

Do not expose or insert a service-role key into the application. The allowlist has no public insert/update policy; adding administrators requires trusted dashboard SQL access.

## 3. Configure local development

Copy `.env.example` to `.env.local`, then set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Use the project's public anon/publishable key from **Project Settings > API**. Never use a service-role/secret key in a `VITE_` variable. `.env.local` is ignored by Git. Restart Vite after changing environment values:

```powershell
npm run dev
```

The public profile chooser will load published profile records. Open `/admin`, sign in with the invited account, and confirm only the allowlisted user can view/manage profile records. New profiles start unpublished unless explicitly published in the editor.

## 4. Configure Vercel

In **Vercel > Project > Settings > Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the required environments. Redeploy after changing build-time Vite environment variables. The Supabase project remains the persistent data store; the Vercel deployment must never contain service-role credentials.

## 5. Security and verification checklist

- Verify **Authentication > Settings** has sign-ups disabled.
- Verify only the invited admin UUID appears in `admin_allowlist`.
- Apply the migration and inspect that RLS is enabled on all portfolio and assignment tables.
- In a signed-out browser, confirm unpublished profiles/content are not returned by PostgREST.
- In a signed-out browser, attempt direct insert/update/delete requests; RLS should reject them.
- Sign in as an allowlisted admin and create a test draft profile; verify it persists after refresh, then publish it and verify it appears in the public chooser.
- Sign in as a normal invited-but-not-allowlisted user and verify the admin route rejects access and mutations remain denied.
- Review Storage bucket policies before enabling any file upload UI. The initial bucket is private and admin-only; public signed URL delivery is not implemented yet.

## Current limitations

This migration and profile editor have not been applied or tested against a real Supabase project in this workspace. No Supabase URL/key was available. The application therefore does not yet claim verified authentication, database persistence, RLS behavior, cross-device profile updates, or file uploads. Other content is still local React state until its admin screens and public repository reads are implemented in a later step.
