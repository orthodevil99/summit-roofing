# Summit Roofing — Denver, CO (Prototype Website)

Zero-cost ($0) mobile-first contractor lead-generation prototype built with **HTML + Tailwind CSS + Vanilla JS**.

## Files Included
- `index.html` — Main single-page mobile-first website + Thank You confirmation view
- `leads.html` — Captured Leads page (`/leads.html`) with status filtering, search, and 1-click Google Sheets CSV export
- `styles.css` — Precompiled zero-FOUC utility stylesheet + custom brand variables (`#0F2A44` Navy & `#F59E0B` Amber)
- `script.js` — Reusable `CLIENT_CONFIG` template architecture, gallery lightbox, client-side validation, spam protection, and storage connectors
- `images/` — 9 optimized architectural & roofing photos
- `integrations/supabase-schema.sql` — SQL schema for the Supabase `leads` table
- `integrations/google-sheets-webhook.gs` — Google Apps Script for saving leads to a private, restricted Google Sheet
- `vercel.json` — Static hosting configuration for Vercel

## 1-Minute Vercel Deployment
1. Drag and drop this folder into [Vercel](https://vercel.com/new) or run `npx vercel --prod`.
2. Open **🔌 Storage Config** in the top demo bar (or edit `window.CLIENT_CONFIG` in `script.js`) to paste your Formspree Endpoint, Restricted Google Sheet Web App URL, or Supabase URL + Anon Key.
