# DevDirectory

A premium developer discovery app built with React, TypeScript, Vite, and Supabase. The UI can be explored without a backend using clearly identified sample profiles. Authentication and member data become live after connecting a Supabase project.

## Architecture

- `src/App.tsx` contains the public landing, discovery, and developer profile routes.
- `src/AuthPage.tsx` handles sign-up, login, and password reset with Supabase Auth.
- `src/Dashboard.tsx` handles owner profile and portfolio editing plus connection requests.
- `src/lib/validation.ts` contains Zod schemas shared by forms.
- `src/lib/data.ts` contains protected data mutations.
- `src/lib/supabase.ts` creates a browser client only from public Vite environment variables.
- `supabase/schema.sql` creates the PostgreSQL tables, indexes, triggers, and Row Level Security policies.

Public developer profile fields live in `profiles`. Authentication email and credentials remain in Supabase Auth. RLS policies require the signed-in user to own profile, skill, project, and project technology records. Connection requests are visible to their participants; only a recipient may accept or decline a pending request.

## Requirements

- Node.js 20 or later
- npm
- A Supabase project for real accounts and persisted data

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the project URL and **anon/public key** from Supabase project settings. Never put a service-role key in a `VITE_` variable.

3. In the Supabase SQL editor, run `supabase/schema.sql`.
   If the project already has the original schema, run the updated file again to add company and public contact email fields to existing profiles.

4. In Supabase Auth settings, set the site URL and add local and deployed callback URLs. Email confirmation is enabled by default in many Supabase projects; users should confirm before logging in.

5. Start the development server:

   ```sh
   npm run dev
   ```

With no Supabase variables, the app runs in demo mode. Demo profile cards are not connected to real accounts; dashboard and connection actions explain that setup is required.

## Verification

```sh
npm test
npm run build
```

The test suite covers credential, profile URL, and project validation. For a backend smoke check after setup, create an account, confirm the email, save a profile, add/edit/delete a project, then check that a second account cannot edit the first account’s rows. RLS is the authorization boundary; client checks are for usability only.

## Deploy to Vercel

1. Import the repository into Vercel and select the Vite preset.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables for the desired deployment environments.
3. Deploy, then add the production URL to Supabase Auth’s allowed redirect URLs.
4. Run the SQL schema in the target Supabase project before enabling public sign-up.

The Vite client bundle contains the anon key by design. Supabase RLS must remain enabled; never expose database service-role credentials in the browser.

## Troubleshooting

- **“Connect a Supabase project first”**: verify `.env.local` uses the exact variable names, then restart Vite.
- **Invalid API key / failed fetch**: check the project URL and anon key, and verify Supabase is online.
- **Profile or project writes fail**: run the schema and confirm the signed-in session is valid. Inspect Supabase logs for RLS denials.
- **Email confirmation does not arrive**: check the Supabase Auth email provider configuration and spam folder.
- **Unknown route after deployment**: configure the Vercel SPA rewrite so nested app routes serve `index.html`.

## Current scope and roadmap

This version provides public discovery with company and email-domain filters, sorting and load more, profile tabs with contact details, posts, and same-company colleagues, Supabase email/password auth and recovery links, profile/project management, community posts, and connection request statuses. Developer and post bookmarks and unfinished post drafts are stored in browser local storage, so they are specific to that device and browser. Published posts, dashboard community counts, and company/contact profile fields use Supabase. Demo landing metrics and testimonials are illustrative and labeled as demo content.

Future work: generated Supabase TypeScript types, image uploads with storage bucket policies, live profile view analytics, notifications, direct messaging, OAuth providers, moderation/report flows, verified profile badges, pagination backed by database cursors, and richer automated authorization tests. Privacy and terms pages are starter copy; the service operator must adapt them before a public production launch.
