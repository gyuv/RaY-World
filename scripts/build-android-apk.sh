#!/usr/bin/env bash
#
# Build the RaY-World Android APK (phone + Android TV) from the Capacitor
# project in ./android and copy it to ./app-universal.apk.
#
# The app is a WebView shell that loads the live deployment
# (https://rayworld.vercel.app) — see capacitor.config.ts. That keeps search,
# streaming and dynamic pages working, which a static export cannot do.
#
# Run this on any machine/CI with outbound access to Google's Android hosts
# (dl.google.com — the SDK, and the Android Gradle Plugin on Google Maven).
# JDK 17+ (21 recommended) and Node 18+ are required.
#
#   bash scripts/build-android-apk.sh
#
# If you already have an Android SDK, set ANDROID_HOME (or ANDROID_SDK_ROOT)
# and the script will use it instead of downloading the command-line tools.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# --- Config: match android/variables.gradle (Capacitor 7) ---
PLATFORM="platforms;android-35"
BUILD_TOOLS="build-tools;35.0.0"
CMDLINE_TOOLS_ZIP="commandlinetools-linux-11076708_latest.zip"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/${CMDLINE_TOOLS_ZIP}"

# --- 1. Locate or install the Android SDK ---
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/android-sdk}}"
SDKMANAGER="$SDK/cmdline-tools/latest/bin/sdkmanager"

if [ ! -x "$SDKMANAGER" ]; then
  echo ">> Installing Android command-line tools into $SDK"
  mkdir -p "$SDK/cmdline-tools"
  tmp="$(mktemp -d)"
  curl -fSL --retry 4 -o "$tmp/cmdtools.zip" "$CMDLINE_TOOLS_URL"
  rm -rf "$SDK/cmdline-tools/latest"
  unzip -q -o "$tmp/cmdtools.zip" -d "$SDK/cmdline-tools"
  mv "$SDK/cmdline-tools/cmdline-tools" "$SDK/cmdline-tools/latest"
  rm -rf "$tmp"
fi

export ANDROID_HOME="$SDK"
export ANDROID_SDK_ROOT="$SDK"

echo ">> Accepting SDK licenses"
yes | "$SDKMANAGER" --licenses >/dev/null || true

echo ">> Installing SDK packages: platform-tools $PLATFORM $BUILD_TOOLS"
"$SDKMANAGER" "platform-tools" "$PLATFORM" "$BUILD_TOOLS"

# --- 2. Point the Gradle build at the SDK ---
echo "sdk.dir=$SDK" > android/local.properties

# --- 3. Make sure web assets + config are synced into the native project ---
if [ ! -d node_modules/@capacitor/cli ]; then
  echo ">> Installing npm dependencies"
  npm ci || npm install
fi
echo ">> Syncing Capacitor"
npx cap sync android

# --- 4. Build the debug APK ---
echo ">> Building debug APK"
cd android
chmod +x ./gradlew
./gradlew --no-daemon assembleDebug
cd "$ROOT"

# --- 5. Deliver ---
APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
  echo "!! Build finished but $APK was not found" >&2
  exit 1
fi
cp "$APK" "app-universal.apk"
echo ""
echo ">> Done. Installable APK (phone + Android TV):"
echo "   $ROOT/app-universal.apk"
