#!/bin/zsh
# Preflight guard — run BEFORE archiving any build that includes the Meta SDK.
#
# Why this exists: FacebookClientToken ships as a placeholder until someone pastes
# the real value from developers.facebook.com → app 972345102352721 → Settings →
# Advanced → Client Token. A build carrying the placeholder compiles and launches
# fine, but reports no app events and no SKAdNetwork attribution — the exact thing
# this whole integration is for. That failure is invisible until ad money is spent,
# so it gets a hard gate instead of a code comment.
#
# Usage: ./scripts/preflight_meta_sdk.sh   (exit 0 = safe to archive)

set -u
PLIST="$(cd "$(dirname "$0")/.." && pwd)/ios/App/App/Info.plist"
FAIL=0

check() {  # check <description> <condition-result>
  if [[ "$2" == "ok" ]]; then
    print -r -- "  ✅ $1"
  else
    print -r -- "  ❌ $1"
    FAIL=1
  fi
}

print -r -- "Meta SDK preflight — $PLIST"
print -r -- ""

TOKEN=$(/usr/libexec/PlistBuddy -c "Print :FacebookClientToken" "$PLIST" 2>/dev/null)
if [[ -z "$TOKEN" ]]; then
  check "FacebookClientToken present" "no"
elif [[ "$TOKEN" == "REPLACE_WITH_META_CLIENT_TOKEN" ]]; then
  print -r -- "  ❌ FacebookClientToken is still the PLACEHOLDER — get the real value from"
  print -r -- "     developers.facebook.com → app 972345102352721 → Settings → Advanced"
  FAIL=1
else
  check "FacebookClientToken set (${#TOKEN} chars)" "ok"
fi

APPID=$(/usr/libexec/PlistBuddy -c "Print :FacebookAppID" "$PLIST" 2>/dev/null)
[[ "$APPID" == "972345102352721" ]] && check "FacebookAppID correct" "ok" \
                                    || check "FacebookAppID wrong or missing (got '$APPID')" "no"

SKAN_COUNT=$(/usr/libexec/PlistBuddy -c "Print :SKAdNetworkItems" "$PLIST" 2>/dev/null | grep -c "skadnetwork")
[[ "$SKAN_COUNT" -ge 2 ]] && check "SKAdNetworkItems present ($SKAN_COUNT ids)" "ok" \
                          || check "SKAdNetworkItems missing or incomplete ($SKAN_COUNT)" "no"

# The camera string was deliberately worded around entertainment, not health — that
# wording resolved a prior Apple 1.4.1 rejection. Guard against a well-meaning reword.
CAM=$(/usr/libexec/PlistBuddy -c "Print :NSCameraUsageDescription" "$PLIST" 2>/dev/null)
if [[ "$CAM" == *"entertainment"* ]]; then
  check "Camera usage string still entertainment-worded" "ok"
else
  print -r -- "  ⚠️  Camera usage string no longer mentions 'entertainment' — this wording"
  print -r -- "     resolved an Apple 1.4.1 rejection. Verify this change is intentional."
fi

print -r -- ""
if [[ "$FAIL" == "1" ]]; then
  print -r -- "PREFLIGHT FAILED — do not archive."
  exit 1
fi
print -r -- "Preflight passed — safe to archive."
exit 0
