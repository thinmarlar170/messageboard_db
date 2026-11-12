# messageboard_db
2026/11/5 KIC lecture sample

## Run

Requires Node.js 18 or newer.

```sh
npm install
npm start
```

Put `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the root `.env` file. The server
loads these values with dotenv; keep `.env` private and never put the secret
key in files under `public/` or expose it to the browser. Open
http://localhost:3000 to use the message board.

Apply the existing migration in `supabase/migrations` to your Supabase project
before starting the app (for a linked project, run `npx supabase db push`). The
migrations create the `posts` table, enable RLS without adding public policies,
and grant only the server-side `service_role` permission to read and insert
posts. The API uses the server-side secret key to access posts.

## Test

```sh
npm test
```

The tests use an in-memory test store and do not connect to or change Supabase.
For a read-only check against existing data, start the app and open
`/api/posts`. Submitting the form or making a `POST /api/posts` request adds a
persistent row; it does not overwrite existing posts. Do not use database
reset commands when testing against a project with data you want to keep.
