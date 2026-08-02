#!/usr/bin/env bash
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to select an available iPhone simulator" >&2
  exit 1
fi

simulator_id="${LUX_LAB_SIMULATOR_ID:-}"
if [[ -z "$simulator_id" ]]; then
  simulator_id="$({ xcrun simctl list devices available --json; } | jq -r '
    [.devices
      | to_entries
      | sort_by(.key)
      | reverse
      | .[]
      | select(.key | contains("SimRuntime.iOS-"))
      | .value[]
      | select(.isAvailable == true)
      | select(.name | startswith("iPhone"))]
    | first
    | .udid // empty
  ')"
fi

if [[ -z "$simulator_id" ]]; then
  echo "No available iPhone simulator was found" >&2
  exit 1
fi

xcodebuild \
  -project apps/ios/LuxLab.xcodeproj \
  -scheme LuxLab \
  -destination "platform=iOS Simulator,id=$simulator_id" \
  CODE_SIGNING_ALLOWED=NO \
  -quiet \
  test
