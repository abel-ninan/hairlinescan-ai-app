# Meta SDK integration — handoff

**Written 2026-07-29 by the ads-side session. You do not need to know anything about the
ad campaigns to do this work.** Everything you need is below.

---

## 🛑 Finish the backend first — this is queued work, not urgent work

You are currently fixing the **Gemini API key / Supabase** outage. **Stay on that.** Do not
context-switch into this document.

That work outranks everything here, for a concrete reason: the app is live on the App Store
and every scan currently returns HTTP 500. People are downloading a broken app right now.
Nothing in this document improves that — it's about ad measurement, and no ads are running
or will run until scans work.

Come back to this **after** scans are confirmed working end to end.

There's also no dependency between the two. The Supabase project auto-paused rather than
being deleted, so it restored at the same project ref — no URL change, no code change, no
build. This SDK work carries its own separate build and App Store review.

---

## Status check first

✅ **The source is safe.** Build 20 was committed and pushed earlier today (2026-07-29):
commit `aa35a6b`, merged as `6d87afc`, with a standalone backup branch `build-20-source`.
The repo is now `abel-ninan/hairlinescan-ai-app`. The old "never reset/clean this folder"
warning **no longer applies** — you can work normally.

Note `build/` (125 MB of xcarchives) is deliberately gitignored and not on GitHub.

---

## Why this work is being requested (30 seconds of context)

Apple's App Tracking Transparency, introduced in iOS 14.5, requires install attribution to
run through **SKAdNetwork**. Meta will not run app-install ads it cannot measure, so when
an app has no SKAdNetwork wiring Meta silently restricts the ad campaign to devices running
**iOS 14.4 and below** — phones nobody has updated in ~5 years.

That restriction is currently costing real money on the ads side. Adding the Meta SDK plus
SKAdNetwork configuration is what lifts it.

**Current state, verified:**

```
SKAdNetworkIdentifier entries in Info.plist : 0
FacebookAppID                               : absent
NSUserTrackingUsageDescription              : absent
FBSDKCoreKit in Podfile                     : absent
IPHONEOS_DEPLOYMENT_TARGET                  : 13.0   (fine — no change needed)
```

**Identifiers you'll need:**

| Thing | Value |
|---|---|
| Meta Developer App ID | `972345102352721` |
| Bundle ID | `com.hairlinescan.app` |
| App Store ID | `6758323696` |
| Apple Team ID | `7RTXHY87WP` |

The Meta Client Token is **not** recorded here — get it from
`developers.facebook.com` → app `972345102352721` → Settings → Advanced → Client Token.

---

## Steps

### 1. Podfile

`ios/App/App/../Podfile` → add to the `App` target (CocoaPods 1.16.2 is installed):

```ruby
target 'App' do
  capacitor_pods
  pod 'FBSDKCoreKit'
end
```

Then:

```bash
cd ios/App && pod install
```

`FBSDKCoreKit` alone is sufficient — it carries app events and SKAdNetwork support. You do
**not** need `FBSDKLoginKit` or `FBSDKShareKit`; this app has no Facebook login or sharing.

### 2. Info.plist

File: `ios/App/App/Info.plist`

Add:

```xml
<key>FacebookAppID</key>
<string>972345102352721</string>

<key>FacebookClientToken</key>
<string>PASTE_FROM_META_DEV_CONSOLE</string>

<key>FacebookDisplayName</key>
<string>HairMaxx</string>

<key>FacebookAutoLogAppEventsEnabled</key>
<true/>

<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>v9wttpbfk9.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>n38lu8286q.skadnetwork</string>
  </dict>
</array>
```

> ⚠️ **Verify the SKAdNetwork ID list against Meta's current published documentation before
> shipping.** The two above are Meta's long-standing identifiers, but Meta updates this list
> and an out-of-date list silently costs attribution. Source of truth: Meta's "SKAdNetwork"
> developer docs. Do not trust this file over Meta's docs.

**ATT prompt — optional, decide deliberately:**

SKAdNetwork attribution works *without* ATT consent. The ATT prompt only unlocks IDFA-based
attribution on top of it. If you want it, add:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Allows us to measure ad performance so we can improve the app.</string>
```

…and call `ATTrackingManager.requestTrackingAuthorization` (import `AppTrackingTransparency`)
*after* the UI is up — never in `didFinishLaunchingWithOptions`, or the prompt is suppressed.

Skipping ATT is a legitimate choice: you keep SKAN attribution and avoid a prompt that most
users decline anyway.

### 3. AppDelegate

File: `ios/App/App/AppDelegate.swift`. It's currently the stock Capacitor delegate.

Add the import:

```swift
import FBSDKCoreKit
```

And inside `didFinishLaunchingWithOptions`, **before** `return true`:

```swift
ApplicationDelegate.shared.application(
    application,
    didFinishLaunchingWithOptions: launchOptions
)
```

Leave the existing `open url` method alone — it already routes through
`ApplicationDelegateProxy` for Capacitor, and that must keep working.

### 4. Build and verify locally

```bash
npm run build && npx cap sync ios
```

Then open `ios/App/App.xcworkspace` (the **workspace**, not the project) and run on a device
or simulator. Confirm:

- App launches without crashing
- No missing-framework link errors
- Camera + photo flows still work (this app's core flow)
- RevenueCat purchases still initialize — `RevenuecatPurchasesCapacitor` is already a pod and
  the two SDKs coexist fine, but confirm rather than assume

### 5. Meta Events Manager

At `business.facebook.com/events_manager2` → the dataset for app `972345102352721`:

- Confirm the app shows as connected (it may currently read "Inactive / Never received event"
  — that's expected until the SDK ships and fires its first event)
- Configure the **SKAdNetwork conversion value schema**

### 6. App Store Connect — privacy disclosures

**Don't miss this — it's a review-rejection risk.** Adding the Meta SDK changes what the app
collects. Update **App Privacy** answers in App Store Connect before submitting.

Note this app is listed under the **Entertainment** category and its camera usage string is
deliberately worded around "fun selfies for entertainment analysis" rather than health
language. That phrasing is intentional — it resolved a prior Apple 1.4.1 rejection. **Do not
reword it** while you're in Info.plist.

### 7. Ship

Bump `CURRENT_PROJECT_VERSION` to 21, archive, upload, submit.

---

## Relationship to the backend problem — this is now independent work

Earlier today the Supabase project was down (NXDOMAIN) and it looked like the backend fix and
this SDK work might have to ship as one build. **That's resolved — they're independent.**

Verified 2026-07-29 after the restore:

```
euztyowduyplbduzcgct.supabase.co  →  resolves (172.64.149.246)
/functions/v1/analyze_hairline    →  HTTP 405 on GET (up; wants POST)
```

The project **auto-paused** rather than being deleted, so it restored at the *same* project
ref. No URL change, therefore no code change, therefore **no build was needed for the backend**.
That means this SDK work carries its own build and its own review cycle — schedule it on its
own merits, not as a rider on something else.

✅ ~~**Still broken:** scans return HTTP 500 because the Gemini API key is invalid.~~
**RESOLVED 2026-07-29.** The diagnosis in that line was wrong: the key was fine, the
**model** was retired. Google withdrew `gemini-2.5-flash` from new API keys (the original
key was grandfathered, so it kept working until rotation), and the `gemini-2.0-*` models
have free-tier `limit: 0`. Fixed by switching to `gemini-3.6-flash` (commit `7c06a09`),
verified end-to-end: HTTP 200, all 24 response fields, ~30s for a 3-photo scan. **No billing
account was needed** and no app build was required — the fix was entirely server-side, so
existing downloaders were repaired without an update.

✅ ~~**Recurring risk:** free-tier Supabase auto-pauses after ~1 week of inactivity~~
**MITIGATED 2026-07-29.** A keep-alive LaunchAgent (`com.abe.hairmaxx.keepalive`, every
2 days) now pings the project and auto-restores it if it ever finds it paused. Note it only
runs while this Mac is on; a paid tier is still the fully reliable fix.

---

## Done means

- [ ] `pod install` succeeds, app builds and runs
- [ ] `FacebookAppID` + real client token + `SKAdNetworkItems` in Info.plist
- [ ] SKAdNetwork ID list verified against Meta's current docs
- [ ] SDK initialized in AppDelegate
- [ ] Camera, photo, and RevenueCat flows all still work
- [ ] App Privacy answers updated in App Store Connect
- [ ] Build 21 uploaded

When build 21 is **live on the App Store**, tell the ads session. The ad campaign must be
rebuilt from scratch at that point — the existing ad sets have the iOS ≤14.4 restriction
baked into them and editing it is silently ignored by Meta.
