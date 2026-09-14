# RaY-World — Android APK (phone + Android TV)

This project ships a native Android build via [Capacitor](https://capacitorjs.com/).
The native app is a **WebView shell** that loads the live deployment at
`https://rayworld.vercel.app`.

## Why a WebView shell (and not a static export)

RaY-World depends on its server at runtime:

- `/api/search` — live search dropdown and the search page,
- `/api/proxy` — stream extraction/proxying for the player,
- `movie/[id]`, `tv/[id]`, `watch/[type]/[id]` — rendered on demand for
  arbitrary titles,
- server-side TMDB calls (the API key is never exposed to the client).

A pure `output: 'export'` static bundle has **no server**, so in a standalone
static APK search, streaming and on-demand pages would not work and content
pages would be empty. Loading the deployed site in the WebView keeps every
feature working on both phones and TV. The web app itself is unchanged
(`next.config.mjs` still builds the normal server app).

If you ever want a different backend (a staging URL, a self-hosted instance),
change `server.url` in [`capacitor.config.ts`](./capacitor.config.ts) and
re-run `npx cap sync android`.

## What's configured

- `capacitor.config.ts` — appId `com.rayworld.app`, `server.url` → the live site.
- `mobile-www/index.html` — branded offline/loading fallback shown only when the
  site can't be reached.
- `android/app/src/main/AndroidManifest.xml`:
  - `android.hardware.touchscreen` **not required** and
    `android.software.leanback` **not required** → installs on phones **and** TVs.
  - A `LEANBACK_LAUNCHER` intent filter → appears on the Android TV home row
    (alongside the normal phone `LAUNCHER`).
  - `android:banner="@drawable/tv_banner"` → the TV launcher banner.
- Target/compile SDK 35, minSdk 23 (Android 5.1+ — covers current Android TV).

## Build the APK

Requirements: **JDK 17+ (21 recommended)**, **Node 18+**, and outbound access
to Google's Android hosts (`dl.google.com` for the SDK and the Android Gradle
Plugin). One command:

```bash
bash scripts/build-android-apk.sh
```

It installs the Android command-line tools + SDK packages if needed, syncs
Capacitor, runs `./gradlew assembleDebug`, and copies the result to
`./app-universal.apk`.

### Using a pre-installed SDK (offline / no `dl.google.com`)

If you already have an Android SDK, point the script at it and it skips the
download **and** every `sdkmanager` call — the parts that need outbound access
to Google's hosts — so the build runs fully offline:

```bash
export ANDROID_HOME=/path/to/android-sdk   # or ANDROID_SDK_ROOT
bash scripts/build-android-apk.sh
```

The offline path is taken automatically when that SDK already contains the
packages matching `android/variables.gradle`:

- `platforms/android-35`
- `build-tools/35.0.0`
- `platform-tools`

If those are present under a non-standard layout and detection misses them, set
`SKIP_SDK_SETUP=1` to force the offline path (the script still fails fast with a
clear message if a required package is genuinely absent).

### Manual steps (equivalent)

```bash
# 1. Point Gradle at your SDK
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# 2. Sync web config into the native project
npx cap sync android

# 3. Build
cd android && ./gradlew assembleDebug

# 4. Deliver
cp app/build/outputs/apk/debug/app-debug.apk ../app-universal.apk
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`
→ copied to `app-universal.apk` at the repo root.

## Install / test

```bash
# Phone or Android TV over adb
adb install -r app-universal.apk
```

On Android TV, sideload the APK (adb over network, or a file manager) — it
appears in the TV launcher with the RaY-World banner. Navigation works with the
D-pad because the web UI already has focus rings and a remote-friendly layout.

> Note: this is an **unsigned debug** build for testing. For Play Store / stable
> distribution, produce a signed release (`assembleRelease` with a keystore).

## Download buttons on the site

The footer has a **Get the app** section with three options: Android (phone /
tablet), Android TV, and the Web App. The Android buttons point to the APK
published by the workflow above at a stable URL:

```
https://github.com/gyuv/RaY-World/releases/download/apk-latest/app-universal.apk
```

Run the **Build Android APK** workflow once and it creates/updates the
`apk-latest` release with the APK, so the buttons resolve. All three targets are
overridable at build time (e.g. in Vercel env vars) without code changes:

| Env var                   | Controls                | Default                                   |
| ------------------------- | ----------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_APK_URL`     | Android (phone/tablet)  | `…/releases/download/apk-latest/app-universal.apk` |
| `NEXT_PUBLIC_APK_TV_URL`  | Android TV              | same as `NEXT_PUBLIC_APK_URL`             |
| `NEXT_PUBLIC_WEBAPP_URL`  | Web App link            | `https://rayworld.vercel.app`             |

The one universal APK already carries both the phone launcher and the Android TV
Leanback launcher, so a single build serves both Android buttons; set
`NEXT_PUBLIC_APK_TV_URL` only if you later ship a TV-specific build.

## Building inside the Claude Code web sandbox

This repo's Claude Code environment blocks `dl.google.com` by egress policy, so
the script **cannot download** the SDK there. Two ways forward:

- **Run it where Google's hosts are reachable** — a local machine or CI
  (GitHub Actions `ubuntu-latest` works out of the box).
- **Provide a pre-installed SDK** (platform-35, build-tools 35.0.0,
  platform-tools) and set `ANDROID_HOME` to it — the script then skips the
  download and all `sdkmanager` calls and builds offline. See
  [Using a pre-installed SDK](#using-a-pre-installed-sdk-offline--no-dlgooglecom)
  above.
