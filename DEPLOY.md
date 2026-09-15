# 🚀 Deploying the Karthik Easam Portfolio (Next.js)

This is the **complete full-stack source code** — frontend + backend + database.
You do NOT need to write any code. Follow the steps below.

---

## What's inside

| Part | Tech |
|---|---|
| Website (all pages, animations, design) | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Framer Motion |
| K-AI chat assistant (backend API) | `/api/chat` route — works with your **free Gemini key** |
| Contact form + feedback storage | API routes + SQLite via Prisma ORM |
| Images (your photo, og-card, favicon) | `public/images/` |
| Bonus single-file version | `public/portfolio-standalone.html` (photo embedded) |

---

## Step 0 — Prerequisites

- A free account on **Vercel** (vercel.com) or **AWS**, or any server
- A **free Gemini API key** → get it at **https://aistudio.google.com/apikey**
  (2 minutes, no credit card, ~1,500 free chats/day)

---

## Step 1 — Set up locally (optional, to test first)

```bash
npm install            # or: bun install
cp .env.example .env   # then edit .env (see below)
npx prisma generate && npx prisma db push
npm run dev            # open http://localhost:3000
```

### The `.env` file (2 lines)

```
DATABASE_URL=file:./db/custom.db
GEMINI_API_KEY=paste-your-free-key-here
```

- `DATABASE_URL` — SQLite database file (created automatically by `prisma db push`)
- `GEMINI_API_KEY` — your free key from aistudio.google.com/apikey.
  Without it, the site works fine but K-AI replies that it is offline.

---

## Step 2 — Put the code on GitHub

1. Create a new **private** repository on github.com (e.g. `my-portfolio`)
2. Upload this whole folder to it (GitHub web UI: "uploading an existing folder",
   or run `git init && git add . && git commit -m "portfolio" && git push`)

---

## Step 3 — Host it

### ⭐ Option A+: Vercel + your GoDaddy domain `easamkarthik.com` (RECOMMENDED — this is the GoDaddy path)

> **Important:** GoDaddy's regular (shared/cPanel) hosting cannot run Next.js —
> it has no Node.js support. The standard setup is: **keep your domain at
> GoDaddy**, run the website FREE on Vercel, and connect the two with 2 DNS
> records. You keep paying GoDaddy only for the domain. (`easamkarthik.com`
> will be the address visitors type; Vercel is the engine under the hood.)

**3.1 Deploy on Vercel** (steps from Option A above):
- Import the repo, add Environment Variables:
  - `DATABASE_URL` = `file:./db/custom.db`
  - `GEMINI_API_KEY` = *(your free key — you already have this)*
- Deploy → you get something like `my-portfolio.vercel.app`

**3.2 Add the domain in Vercel:**
- Project → **Settings → Domains → Add** → type `easamkarthik.com`
- Also add `www.easamkarthik.com`
- Vercel will show you the DNS records it needs (should match the table below)

**3.3 Point GoDaddy to Vercel** (GoDaddy → My Products → Domains → **DNS** → Manage):

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` | 1 Hour |
| CNAME | `www` | `cname.vercel-dns.com` | 1 Hour |

- If GoDaddy already has default "A" or "CNAME Forwarding" records for `@` or
  `www`, **edit/delete those first** (pencil icon), then add the ones above.
- DNS usually connects in 10–30 minutes (can take up to 48h worst case).
- Vercel auto-issues the HTTPS certificate once DNS verifies. Done — your
  portfolio is live at **https://easamkarthik.com** 🎉

### Option A: Vercel (recommended — easiest, free)

1. Go to **vercel.com** → sign in with GitHub
2. **Add New Project** → pick your repo → **Import**
3. Before clicking Deploy, open **Environment Variables** and add:
   - `DATABASE_URL` = `file:./db/custom.db`
   - `GEMINI_API_KEY` = your key
4. Click **Deploy** → done in ~2 minutes. You get `your-site.vercel.app`
5. Custom domain: Project → Settings → Domains → add yours, point DNS as shown

> ⚠️ Vercel note: the SQLite file is **ephemeral** on serverless hosts (contact
> submissions may not persist across restarts). The site + K-AI chat work
> perfectly. If you want guaranteed form-storage, use Option B or C.

### Option B: AWS Amplify Hosting (you mentioned AWS)

1. AWS Console → **Amplify Hosting** → **Host web app** → connect your GitHub repo
2. Build settings: it auto-detects Next.js (SSR). Add environment variables
   (`DATABASE_URL`, `GEMINI_API_KEY`) under Advanced settings
3. Deploy → Amplify gives you HTTPS + a custom-domain option (Route 53)

### Option C: Any VPS / server (full persistence)

```bash
npm install && npx prisma generate && npx prisma db push
npm run build
npm start          # serves on port 3000; put Nginx/Caddy in front for HTTPS
```

---

## Step 4 — Custom domain (optional)

Buy/point a domain (e.g. `karthikeasam.com`) at any registrar, then follow the
host's domain guide (Vercel/Amplify both have 2-click domain setup).

---

## Files you may want to edit later (no coding skill needed)

| What | File |
|---|---|
| Phone, email, address, links | `src/lib/resume-data.ts` (top of file) |
| Your photo | replace `public/images/karthik-photo.jpg` |
| Link-preview card | replace `public/images/og-card.jpg` |
| Resume PDF download | `public/` (the PDF file) |
