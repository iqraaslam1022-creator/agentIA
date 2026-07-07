# AgentIA — Base44 se Supabase Migration Guide

## Step 1: Supabase account banayein (free)
1. https://supabase.com par jayein → "Start your project" → GitHub/email se sign up karein
2. "New Project" banayein — naam, password, aur region (Mumbai/Singapore pick karein for Pakistan ke qareeb speed)

## Step 2: Database schema install karein
1. Supabase Dashboard → left sidebar → **SQL Editor**
2. **New Query** par click karein
3. `schema.sql` file (yahan diya gaya) ka poora content paste karein
4. **Run** dabayein — sab 8 tables ban jayengi (leads, properties, deals, invoices, follow_ups, documents, communication_logs, users)

## Step 2.5: Storage bucket banayein (Documents page ke liye)
1. Dashboard → **Storage** → **New bucket**
2. Naam rakhein: `documents`
3. **Public bucket** ON kar dein (taake file links directly khul sakein)
4. Create dabayein

## Step 3: API keys copy karein
1. Dashboard → **Project Settings** → **API**
2. Yeh do cheezein copy karein:
   - `Project URL`
   - `anon public` key

## Step 4: Apne project mein Supabase install karein
```bash
npm install @supabase/supabase-js
```
(Aap chahein to `@base44/sdk` aur `@base44/vite-plugin` ko `package.json` se hata sakti hain, ab zaroorat nahi)

## Step 5: `.env` file banayein
Apne project ke root mein `.env` file banayein (agar pehle se nahi hai):
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 6: Files copy karein
Yeh 3 files apne project ke `src/api/` folder mein daal dein (jo yahan diye gaye hain):
- `supabaseClient.js`
- `entities.js`
- `auth.js`

Purani `base44Client.js` file ab zaroorat nahi — delete kar sakti hain.

## Step 7: Imports update karein
Jahan bhi aapke code mein yeh likha hai:
```js
import { base44 } from '@/api/base44Client';
// aur phir: base44.entities.Lead.list()
```

Usko is se replace karein:
```js
import { Lead, Deal, Property, Invoice, FollowUp, Document, CommunicationLog } from '@/api/entities';
// ab seedha: Lead.list()
```

Aur auth wale calls:
```js
import { base44 } from '@/api/base44Client';
base44.auth.login(...)
```
Isko:
```js
import { auth } from '@/api/auth';
auth.login(email, password)
```

## Step 8: Test karein
```bash
npm run dev
```
Login/signup try karein, phir ek naya Lead create kar ke dekhein ke Supabase Dashboard → **Table Editor** → `leads` mein data show ho raha hai ya nahi.

## Step 9: Deploy + apna domain
Ab aap free mein deploy kar sakti hain:
- **Vercel** ya **Netlify** (dono free tier dete hain, aur inpe apna khud ka custom domain bhi free mein connect ho sakta hai — sirf domain registrar (Namecheap/GoDaddy) se domain kharidna hoga, jo Base44 ke upgrade se kaafi sasta hai)

---

## Notes
- **Billing:** `ChoosePlan.jsx` currently just records the chosen plan in the database — it does **not** charge a real card. Your `package.json` already has `@stripe/react-stripe-js` installed; wire up Stripe Checkout there before accepting real customer payments.
- **OTP email codes:** Supabase sends a confirmation *link* by default. To get 6-digit codes (like your Register page expects), go to Supabase Dashboard → **Authentication → Email Templates → Confirm signup**, and change the template to show `{{ .Token }}` instead of the magic link button.
- **Google login:** enable it under Dashboard → **Authentication → Providers → Google** (you'll need a Google OAuth client ID/secret from Google Cloud Console).
- `owner_id` column har table mein automatically login kiye hue user ka ID save karta hai (Row Level Security ki wajah se har user sirf apna data dekh sakta hai — yeh Base44 jaisa hi secure setup hai)

---

## Complete file list (this migration)

**Backend / API layer**
- `schema.sql`
- `src/api/supabaseClient.js`
- `src/api/entities.js`
- `src/api/auth.js`
- `src/api/storage.js`

**App shell**
- `src/App.jsx`, `src/main.jsx`, `src/index.css`
- `src/lib/AuthContext.jsx`, `src/lib/FollowUpReminderContext.jsx`, `src/lib/PageNotFound.jsx`, `src/lib/utils.js`, `src/lib/generateInvoicePDF.js`
- `src/hooks/use-mobile.js`
- `src/components/layout/Sidebar.jsx`

**Auth pages**
- `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `ChoosePlan.jsx`
- `src/components/AuthLayout.jsx`, `GoogleIcon.jsx`, `UserNotRegisteredError.jsx`

**Feature pages**
- `src/pages/Dashboard.jsx` (+ `components/dashboard/StatCard.jsx`)
- `src/pages/Leads.jsx` (+ `components/leads/LeadFormDialog.jsx`, `FollowUpDialog.jsx`, `CommunicationLogPanel.jsx`)
- `src/pages/Properties.jsx` (+ `components/properties/PropertyFormDialog.jsx`)
- `src/pages/Pipeline.jsx`
- `src/pages/Invoices.jsx` (+ `components/invoices/InvoiceFormDialog.jsx`, `MarkPaidDialog.jsx`)
- `src/pages/Documents.jsx`
- `src/pages/SettingsPage.jsx`

**Shared UI**
- `src/components/ui/sidebar.jsx`, `SkeletonLoader.jsx`, `DeleteConfirmDialog.jsx`
- `src/components/reminders/ReminderPopup.jsx`
- `src/components/ScrollToTop.jsx`

**Not included** (standard shadcn/ui primitives your project already had — `button.jsx`, `input.jsx`, `dialog.jsx`, `select.jsx`, `badge.jsx`, `dropdown-menu.jsx`, `toast`/`use-toast.js`, `textarea.jsx`, etc.). These have zero Base44 dependency, so keep using your originals as-is.

- Agar koi feature kaam na kare (jaise file upload ke liye "Document" ka `file_url`), Supabase ka free **Storage** bucket bhi use kar sakti hain — bata dein to woh bhi bana dun
- Stripe integration (`@stripe/react-stripe-js`) waisi hi rahegi, uska Base44 se koi lena dena nahi tha
