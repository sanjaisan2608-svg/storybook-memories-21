# Storybook Memories

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cf4d9bde-8360-4b90-adae-f50de5be987b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Cloud saving and Vercel deployment

The story can be viewed publicly, while changes are restricted to the creator's Supabase account. Text, photos, background music, the favorite song, and video are synced to Supabase so they are available after reloads and on other devices.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/setup.sql`](./supabase/setup.sql).
3. In **Authentication → Users**, create the creator account with an email and password. Disable public sign-ups in **Authentication → Settings**.
4. Copy that user's UUID from the Users page. In the SQL Editor, register the creator:

   ```sql
   insert into public.birthday_story_owners (user_id)
   values ('PASTE-CREATOR-USER-UUID-HERE');
   ```

5. Copy the project's URL and publishable/anon key from **Project Settings → API**. These are browser-safe public credentials; never put a Supabase service-role key in the frontend.
6. In Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables for the deployments you use, then redeploy. For local development, copy `.env.example` to `.env.local` and fill in the same values.
7. Open the deployed link, select **Personalize**, and sign in using the creator account. Add or update the story there. The public link can view the saved story but must sign in to edit it.

Cloud uploads require the project setup and Vercel environment variables. Before cloud is configured, local edits are stored only in that browser. Existing local content can be migrated by signing in on the same browser after configuration; leave the app open until the panel reports that the story is saved to the cloud account.
