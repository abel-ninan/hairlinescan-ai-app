# HairMaxx — Subscription → $4.99 Per-Scan Conversion: HANDOFF

**Status as of 2026-05-15 01:30 PT:** All code rewritten and the web bundle is built and synced into the iOS project. Five external-account steps remain that I could not complete because none of the required services (Supabase, RevenueCat, App Store Connect, GitHub) were signed in to the user's Chrome and Apple ID 2FA cannot be bypassed without the user's trusted device. Detailed instructions below.

---

## ❗ Critical finding: the backend is dead

`euztyowduyplbduzcgct.supabase.co` returns **NXDOMAIN**. The Supabase project hosting the `analyze_hairline` edge function (the thing that calls Gemini) has been paused or deleted — most likely paused after ~1 week of inactivity on the free tier (last commit touching that function was March 4 2026; today is May 15).

**This means the live app on the App Store is already broken** — payments work, but scans return a network error. Switching to per-scan pricing won't help users until the backend is restored.

Restoring the backend is **step 1** of the handoff.

---

## ✅ What I completed autonomously

### Code rewrite — subscription → per-scan credit model
- `src/hooks/useScanCredit.ts` (new) — replaces `useSubscription.ts`. Tracks scan credits in `localStorage` under `hairmaxx_scan_credits`. Each `purchase()` call buys one $4.99 consumable and grants 1 credit; `consumeCredit()` decrements after each successful analysis.
- `src/hooks/useSubscription.ts` — **deleted**.
- `src/pages/Index.tsx` — switched import, replaced `isSubscribed` with `hasCredit`, calls `consumeCredit()` in `handleScanComplete` so users only pay for scans they actually got.
- `src/components/screens/PaywallScreen.tsx` — copy changed: button now reads **"Buy 1 Scan — $4.99"**, price line is **"$4.99 per scan · one-time purchase"**, Apple's auto-renewal disclosure replaced with the consumable disclosure ("one-time purchase for a single scan — no subscription and no auto-renewal").
- `src/components/screens/SettingsScreen.tsx` — FAQ rewritten (3 entries about scan pricing, refunds, and the legacy-subscriber path). Terms-of-service section 5 rewritten from "Subscriptions & Payments" → "In-App Purchases".
- `public/terms.html` — Section 5 rewritten the same way (this is shipped to iOS at `ios/App/App/public/terms.html` by `cap sync`).
- `public/privacy-policy.html` — RevenueCat blurb updated to drop subscription wording.

### Legacy subscriber grandfathering
The new `useScanCredit` hook checks two things on first run:
1. If `localStorage["hairmaxx_subscribed"] === "true"` (the old key), it seeds 999 credits so existing subscribers keep working in the new build without disruption.
2. If they tap **Restore Purchases**, it queries RevenueCat for the active `HairMaxx Pro` entitlement and, if present, grants 999 credits.

This avoids angering anyone who paid under the old model. Per Apple's rules you cannot retroactively cancel their subscription — they'll keep auto-renewing until they cancel in Settings — but they at least get a working app.

### Build verification
- `npm run type-check` — passes (no errors).
- `npm run build` — passes; new bundle is `dist/assets/index-CAsBES4d.js` (1.17 MB).
- `npx cap sync ios` — succeeded; web assets and capacitor config copied to `ios/App/App/public`; pods reinstalled; both `MediaPlugin` and `PurchasesPlugin` confirmed wired.

### Chrome pre-staging
Four tabs are open in the front Chrome window, ready for you to authenticate and act on:
1. **Tab 1** — Facebook Ads Manager (unchanged, your prior work)
2. **Tab 2** — `supabase.com/dashboard/sign-in` (will redirect back to organizations once signed in)
3. **Tab 3** — `app.revenuecat.com/login`
4. **Tab 4** — `appstoreconnect.apple.com` login (will redirect to your app once signed in)
5. **Tab 5** — `github.com` (in case Supabase requires GitHub OAuth)

---

## 🚧 What's blocked and why

| # | Step | Blocker | Resolvable how |
|---|------|---------|----------------|
| 1 | Restore Supabase project + redeploy `analyze_hairline` edge function + set `GEMINI_API_KEY` secret | Not signed in to Supabase in this Chrome; no Google SSO option | Sign in with your Supabase email or GitHub creds |
| 2 | Create `com.hairlinescan.app.scan` Consumable IAP in App Store Connect; mark old subscription "Removed from Sale" | Apple ID 2FA requires your trusted device (iPhone/Mac/SMS) | Authenticate from your phone when you're back |
| 3 | Add the new product to RevenueCat under the existing offering | RevenueCat not signed in | Sign in with your RevenueCat creds |
| 4 | Install iOS 18.5 device platform support in Xcode (`Settings → Platforms → iOS`) | Xcode UI download, not scriptable | Open Xcode and click install |
| 5 | Archive + upload new build via Xcode → Distribute App | Requires both items above plus your Apple ID in Xcode | Standard Xcode upload flow |
| 6 | Submit app for Apple review (24h–7 day wait) | Apple side, not skippable | Submit after upload completes |

---

## 📋 Step-by-step recovery (do these in order)

### Step 1 — Restore the Supabase backend

Tab 2 is open at the Supabase sign-in page.

1. **Sign in** (email/password, or GitHub if that's how you set up the account).
2. After sign-in, go to **Projects** in the left nav.
   - If the project `euztyowduyplbduzcgct` is listed as **Paused** → click it, then click **Restore project**. Wait ~2 min. URL stays the same; nothing else needs to change.
   - If the project **doesn't exist anymore** (deleted) → create a new one (any region; smallest free-tier instance is fine). Then:
     - Note the new project's URL (looks like `https://<new-id>.supabase.co`) and **anon public key** (Settings → API).
     - Update `/Users/abe/Documents/hairlinescan-ai-demooo/.env`:
       ```
       VITE_SUPABASE_PROJECT_ID="<new-id>"
       VITE_SUPABASE_URL="https://<new-id>.supabase.co"
       VITE_SUPABASE_PUBLISHABLE_KEY="<new anon key>"
       ```
     - Update CSP in `/Users/abe/Documents/hairlinescan-ai-demooo/index.html` — find `connect-src 'self' https://euztyowduyplbduzcgct.supabase.co` and replace with the new URL.
     - Update `supabase/config.toml` — replace `project_id = "euztyowduyplbduzcgct"` with the new id.
     - Update `src/integrations/supabase/client.ts` (the hardcoded fallback URL).
3. **Get a Gemini API key.** Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (uses your Google account, already signed in). Click **Create API key**, choose a Google Cloud project (or create one), and copy the key.
4. **Set the secret** for the edge function. In the Supabase dashboard → your project → **Edge Functions** → **Secrets** (or via CLI):
   ```bash
   cd /Users/abe/Documents/hairlinescan-ai-demooo
   supabase login   # opens browser, sign in
   supabase link --project-ref <project-id>
   supabase secrets set GEMINI_API_KEY=<key-from-aistudio>
   ```
5. **Deploy the edge function:**
   ```bash
   supabase functions deploy analyze_hairline --no-verify-jwt
   ```
6. **Smoke-test it:**
   ```bash
   curl -X POST 'https://<project-id>.supabase.co/functions/v1/analyze_hairline' \
     -H 'Content-Type: application/json' \
     -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
     -H "Authorization: Bearer $VITE_SUPABASE_PUBLISHABLE_KEY" \
     -d '{"photos":[],"answers":{}}'
   ```
   Expect HTTP 400 with `{"error":"At least one photo is required"}` — that confirms the function is up and the API key is wired.

### Step 2 — Create the new Consumable IAP in App Store Connect

Tab 4 is open at the App Store Connect sign-in. After you sign in (Apple ID + 2FA), it lands on the HairMaxx app page.

1. Left nav → **Monetization → In-App Purchases**.
2. Click **+** to create a new IAP.
3. Settings:
   - **Type:** *Consumable*
   - **Reference Name:** `HairMaxx Single Scan`
   - **Product ID:** `com.hairlinescan.app.scan` (must match the constant in `useScanCredit.ts` exactly)
   - **Price:** Tier 5 ($4.99 USD)
   - **Display Name (en-US):** `HairMaxx Scan`
   - **Description (en-US):** `One AI-powered hairline analysis with personalized grooming tips.`
   - **Review screenshot:** upload any 640×920+ screenshot of the paywall (you can re-use the existing paywall asset).
   - **Review notes:** "Consumable in-app purchase. Each purchase grants one AI scan analysis. No subscription, no auto-renewal. Replaces previous auto-renewing subscription product."
4. Save. State should be **"Ready to Submit"** (it'll get submitted together with the new app binary).
5. Find the old subscription: **In-App Purchases → Subscriptions → HairMaxx Pro** (or whatever it's named). Open it → **Pricing** → **Remove from Sale on all storefronts**. **Do not delete it** — that would break the grandfather flow in `useScanCredit.restore()`. Existing subscribers keep getting service until they cancel, which is what Apple requires.

### Step 3 — Add the new product to RevenueCat

Tab 3 is open at RevenueCat. Sign in.

1. Pick your **HairMaxx** project → **Products** → **+ New**.
2. Add `com.hairlinescan.app.scan` (the same product ID), Store: Apple App Store.
3. **Offerings** → open the **Current** offering. **+ Add Package**, pick a custom identifier like `$rc_scan_credit`, attach the new product.
4. Optional: remove the old subscription package from the offering so new users only see the per-scan one. The legacy package can stay defined under Products so the `restore()` flow can still surface the old entitlement for grandfathered users.
5. Verify the API key in **Project Settings → API keys → Apple App Store** matches the one in `.env`:
   ```
   VITE_REVENUECAT_API_KEY="appl_bWKXafaDsxgMbwCCLbBLhVoGnBw"
   ```
   If it doesn't, copy the public Apple key from RevenueCat and overwrite `.env`. (This is a *public* key, safe to ship in the client bundle.)

### Step 4 — Install Xcode iOS 18.5 platform support

Building the archive failed because `xcodebuild` reports *"iOS 18.5 is not installed"* for the "Any iOS Device" destination, even though the SDK is. Xcode 16.4 needs the device support package separately.

1. Open Xcode.
2. **Xcode menu → Settings → Platforms**.
3. Find **iOS 18.5** in the list, click **GET** (it's about 8 GB).
4. Wait for install to finish.

### Step 5 — Build + archive + upload

1. Build the web bundle and sync (re-run after Step 1 if you changed `.env`):
   ```bash
   cd /Users/abe/Documents/hairlinescan-ai-demooo
   npm run build:ios
   ```
2. Open the Xcode workspace:
   ```bash
   open ios/App/App.xcworkspace
   ```
3. In Xcode:
   - Top toolbar device selector → **Any iOS Device (arm64)**.
   - **Bump build number**: select App target → General → Identity → increment Build (e.g., from 5 to 6). Keep Version at 1.2.0 unless you want to bump it.
   - **Product menu → Archive**. Takes ~2 min.
4. When the Organizer window opens with the archive, click **Distribute App → App Store Connect → Upload**. Walk through the signing/profile prompts (let Xcode manage signing automatically).
5. Wait for the upload to process on Apple's side (5–15 min). You'll get an email when it's ready.

### Step 6 — Submit for review

In App Store Connect → HairMaxx app → **+ Version** (1.2.1 or whatever build you bumped to).

- **What's New (en-US):** `We've switched to a simple pay-per-scan model — just $4.99 per scan, no subscription. Existing subscribers keep their access; tap Restore Purchases to migrate.`
- **Build:** select the build you just uploaded.
- **In-App Purchases for this version:** attach `HairMaxx Single Scan` (the new consumable IAP from Step 2).
- **App Review Information:** mention "This version converts pricing from monthly subscription to a single $4.99 consumable per scan. Existing subscribers are grandfathered."
- Submit for review.

Apple review usually takes 24–48 hours. The new IAP is reviewed in tandem with the binary.

---

## 🧪 How to test on-device before submitting

1. Plug iPhone into the Mac.
2. In Xcode, set device selector to your phone, click **▶ Run**.
3. Apple uses **sandbox accounts** for IAP testing. In **Settings → App Store** on your phone → Sandbox Account → sign in with a sandbox tester (create one in App Store Connect → Users and Access → Sandbox Testers).
4. Open HairMaxx → start a scan. With 0 credits and no active subscription, you should see the paywall. Tap **Buy 1 Scan — $4.99** → Apple shows the sandbox purchase sheet (says "[Environment: Sandbox]" at the top) → confirm → scan runs.
5. After the scan completes, `consumeCredit()` decrements you back to 0 credits. Trying another scan should show the paywall again.

If the paywall says *"No scan packages available right now"*, RevenueCat's offering isn't returning the product — re-check Step 3 and that the IAP in App Store Connect is at least **"Ready to Submit"** state (sandbox doesn't require approval).

---

## 📁 File changes summary

```
M  src/pages/Index.tsx
M  src/components/screens/PaywallScreen.tsx
M  src/components/screens/SettingsScreen.tsx
M  public/terms.html
M  public/privacy-policy.html
A  src/hooks/useScanCredit.ts
D  src/hooks/useSubscription.ts
A  HANDOFF.md          (this file)
```

iOS-side files regenerated by `cap sync` (don't hand-edit):
```
M  ios/App/App/public/*  (web bundle)
M  ios/App/App/public/terms.html, privacy-policy.html
M  ios/App/App/capacitor.config.json
```

---

## ⏱️ Realistic timeline once you're back

- Supabase restore + Gemini key + deploy: **~15 min** if project is paused, ~30 min if you have to create new
- App Store Connect new IAP: **~10 min**
- RevenueCat config: **~5 min**
- Xcode iOS 18.5 platform download: **~10 min** (mostly download time, ~8 GB)
- Archive + upload + processing: **~20 min**
- Submit for review: **~5 min**
- **Apple review wait: 24h–7 days** (unskippable)

Total active hands-on time once you sit down: ~1 hour. Then waiting on Apple.

---

## 🚨 Two things to watch for

1. **Existing subscribers** won't auto-cancel — Apple doesn't let you do that. They keep paying until they cancel manually in iOS Settings. The new app build will grandfather them into 999 scan credits (effectively unlimited) so they don't feel screwed. If you want to proactively reach out and refund the ones who'd rather not keep paying, you'd do that via Apple's customer support refund tool (case-by-case).

2. **The `dermatologist_reason` field** in the edge function output is awkwardly named — it actually contains barber/stylist recommendations now. This is fine but if you ever do a clean rewrite of the analyze function, consider renaming. Not in scope tonight.
