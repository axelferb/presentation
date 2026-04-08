# Proposales AI — Proposal Generator

Transform a client inquiry into a polished Proposales draft in seconds, powered by Claude.

## What it does

Paste a brief client inquiry (event type, guest count, dates, budget) → Claude structures a professional proposal → the draft is created in your Proposales account → you get a direct link to review and send.

## Stack

- **Next.js 15** (App Router)
- **Anthropic SDK** (Claude claude-opus-4-5) for AI content generation
- **Proposales API v3** for creating proposal drafts
- **Vercel** for hosting

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd proposal-generator
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Then fill in your keys in `.env.local`:

```env
PROPOSALES_API_KEY=       # From https://secure.proposales.com/settings/profile
PROPOSALES_COMPANY_ID=    # Your company ID (ask Proposales support if needed)
ANTHROPIC_API_KEY=        # From https://console.anthropic.com
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add your environment variables:

```bash
vercel env add PROPOSALES_API_KEY
vercel env add PROPOSALES_COMPANY_ID
vercel env add ANTHROPIC_API_KEY
```

Redeploy:

```bash
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. Add the three environment variables in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy

---

## How it works (code walkthrough)

```
app/
├── page.tsx                        # Frontend UI — textarea, example chips, result card
├── globals.css                     # Design system — luxury hospitality aesthetic
├── layout.tsx                      # Root layout with Google Fonts
└── api/
    └── generate-proposal/
        └── route.ts                # POST /api/generate-proposal
                                    #   1. Calls Claude with the inquiry
                                    #   2. Parses structured JSON from Claude
                                    #   3. POSTs to Proposales /v3/proposals
                                    #   4. Returns proposal URL to the client

lib/
└── proposales.ts                   # Typed wrapper for the Proposales API
```

**API flow:**

1. User submits an inquiry on the frontend
2. `POST /api/generate-proposal` receives the inquiry
3. Claude (claude-opus-4-5) is prompted to return structured JSON: `{ title_md, description_md, language, recipient }`
4. The structured data is sent to `POST https://api.proposales.com/v3/proposals`
5. Proposales returns a `{ uuid, url }` — the URL is shown to the user with a direct link

---

## Getting your Proposales Company ID

The Proposales API requires a `company_id` for most operations. To find yours:

1. Log into Proposales
2. Contact Proposales support and ask for your Company ID
3. Alternatively, you can find it via `GET /v1/companies` if you have API access

---

## Notes

- The proposal is created as a **draft** — it won't be sent to any client automatically
- You can open the returned URL to review, edit, and send from within Proposales
- Claude is prompted to write in a warm hospitality voice, but the draft is fully editable
