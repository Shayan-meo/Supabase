# Supabase Data Push

A minimal web form that captures user details and writes them directly to a **Supabase** (PostgreSQL) database.

No framework, no build step — just plain **HTML**, **JavaScript**, and the Supabase JS client loaded as an ES module.

---

## Features


- Clean form with four fields: name, age, country, email
- Client-side validation before any network call
- Direct insert into a Supabase table via the official JS client
- Live status feedback — loading, success, and error states
- Automatic form reset after a successful submission

---

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Form markup — input fields, submit button, status message |
| `app.js` | Application logic — Supabase client, validation, insert |
| `package.json` | Declares the `@supabase/supabase-js` dependency |
| `README.md` | This document |

---

## Prerequisites

- A [Supabase](https://supabase.com) account and project
- A local HTTP server (see below) — ES modules cannot be loaded from `file://`

---

## Getting Started

### 1. Create the database table

In your Supabase dashboard, open **SQL Editor** and run:

```sql
create table users (
  id         bigint primary key generated always as identity,
  name       text,
  age        int,
  country    text,
  email      text,
  created_at timestamptz default now()
);
```

### 2. Configure Row Level Security

Supabase enforces RLS by default. Add a policy that permits anonymous inserts:

```sql
alter table users enable row level security;

create policy "Allow anonymous inserts"
on users for insert
to anon
with check (true);
```

> This policy grants **insert only** — no client can read existing rows. Tighten or extend it to match your requirements.

### 3. Add your credentials

Copy your project URL and publishable key from **Project Settings → API**, then update `app.js`:

```js
const SUPABASE_URL      = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-publishable-key';
```

### 4. Run the application

**VS Code — Live Server (recommended)**

1. Install the **Live Server** extension
2. Right-click `index.html`
3. Select **Open with Live Server**

**Terminal**

```bash
npx serve
```

Then open the `http://localhost:...` URL in your browser.

> **Important:** Opening `index.html` directly from the filesystem will not work. The browser blocks ES module imports over the `file://` protocol due to CORS restrictions.

---

## How It Works

### Loading the Supabase client

```js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

The package is served through [esm.sh](https://esm.sh), a CDN that converts npm packages into browser-ready ES modules — no bundler required.

Because the file uses `import`, the script tag must declare the module type:

```html
<script type="module" src="app.js"></script>
```

Without `type="module"`, the browser treats the file as a classic script and fails at parse time with `Cannot use import statement outside a module`. Since parsing fails, **no code in the file executes** — including the event listener, which is why the button would appear unresponsive.

`type="module"` also defers execution until the DOM is parsed, so a separate `defer` attribute is unnecessary.

### Initializing the client

```js
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

`db` is the entry point for every database operation in the app.

### Handling submission

```js
document.getElementById('submitBtn').addEventListener('click', async () => {
  // ...
});
```

The handler is `async` because database operations are asynchronous — `await` suspends execution until Supabase responds, without blocking the UI.

### Validating input

```js
if (!name || !age || !country || !email) {
  statusMsg.style.color = 'red';
  statusMsg.innerText = 'Tamam fields bharna zaroori hain!';
  return;
}
```

An early `return` prevents an unnecessary network round trip when any field is empty.

### Inserting the record

```js
const { data, error } = await db
  .from('users')
  .insert([{ name, age: Number(age), country, email }])
  .select();
```

| Call | Purpose |
|------|---------|
| `.from('users')` | Targets the table |
| `.insert([...])` | Accepts an array, so batch inserts are supported |
| `Number(age)` | HTML inputs always yield strings; the column expects an integer |
| `.select()` | Returns the inserted row — omit it and `data` is `null` |

### Handling the response

```js
if (error) {
  statusMsg.style.color = 'red';
  statusMsg.innerText = '❌ Error: ' + error.message;
  return;
}
```

The Supabase client does not throw on query failures — it resolves with an `{ data, error }` tuple. The `error` property must be checked explicitly on every call.

The surrounding `try/catch` handles a different class of failure: network drops, CORS rejections, and runtime exceptions that never reach the `error` object.

---

## Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|------------|
| Button does nothing | `type="module"` missing on the script tag | Use `<script type="module" src="app.js">` |
| `CORS policy` error in console | Page opened via `file://` | Serve over HTTP with Live Server or `npx serve` |
| `relation "users" does not exist` | Table not created | Run the schema SQL in step 1 |
| `new row violates row-level security policy` | No insert policy defined | Run the RLS SQL in step 2 |
| `Failed to fetch` | Incorrect project URL or key | Re-copy both from Project Settings → API |

Open **DevTools → Console** (F12) first — the underlying error is almost always reported there.

---

## Security

The key used here (`sb_publishable_...`) is designed for client-side exposure. Data protection comes from **Row Level Security policies**, not from hiding the key.

Never commit or ship a `service_role` key in frontend code — it bypasses RLS entirely and grants unrestricted database access.

---

## License

MIT
