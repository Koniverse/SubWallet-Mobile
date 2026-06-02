#!/usr/bin/env bash
set -euo pipefail

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is not available. Install Android SDK platform-tools or add adb to PATH." >&2
  exit 1
fi

if command -v react-native >/dev/null 2>&1; then
  RN_CLI="react-native"
elif [[ -x "./node_modules/.bin/react-native" ]]; then
  RN_CLI="./node_modules/.bin/react-native"
else
  echo "react-native is not available. Run yarn install first." >&2
  exit 1
fi

if ! devices_output="$(adb devices)"; then
  echo "adb devices failed. Check that the ADB server can start, then try again." >&2
  exit 1
fi

mapfile -t devices < <(printf '%s\n' "$devices_output" | awk 'NR > 1 && $2 == "device" { print $1 }')

if [[ ${#devices[@]} -eq 0 ]]; then
  echo "No Android device is online. Start Genymotion first, then run yarn android again." >&2
  exit 1
fi

if [[ -n "${GENYMOTION_SERIAL:-}" ]]; then
  for serial in "${devices[@]}"; do
    if [[ "$serial" == "$GENYMOTION_SERIAL" ]]; then
      echo "Using Genymotion device: $serial"
      exec "$RN_CLI" run-android --deviceId "$serial" "$@"
    fi
  done

  echo "GENYMOTION_SERIAL=$GENYMOTION_SERIAL is not online." >&2
  echo "Online devices:" >&2
  printf '  %s\n' "${devices[@]}" >&2
  exit 1
fi

genymotion_devices=()

for serial in "${devices[@]}"; do
  manufacturer="$(adb -s "$serial" shell getprop ro.product.manufacturer 2>/dev/null | tr -d '\r' | tr '[:upper:]' '[:lower:]' || true)"
  brand="$(adb -s "$serial" shell getprop ro.product.brand 2>/dev/null | tr -d '\r' | tr '[:upper:]' '[:lower:]' || true)"
  model="$(adb -s "$serial" shell getprop ro.product.model 2>/dev/null | tr -d '\r' | tr '[:upper:]' '[:lower:]' || true)"

  if [[ "$manufacturer $brand $model" == *genymotion* ]]; then
    genymotion_devices+=("$serial")
  elif [[ "$serial" == *:* && "$serial" != emulator-* ]]; then
    genymotion_devices+=("$serial")
  fi
done

if [[ ${#genymotion_devices[@]} -eq 0 ]]; then
  echo "No Genymotion device was found. Start Genymotion first; Android Studio emulators will not be launched." >&2
  echo "Online devices:" >&2
  printf '  %s\n' "${devices[@]}" >&2
  exit 1
fi

if [[ ${#genymotion_devices[@]} -gt 1 ]]; then
  echo "Multiple Genymotion devices found; using ${genymotion_devices[0]}." >&2
  echo "Set GENYMOTION_SERIAL to choose another one." >&2
fi

echo "Using Genymotion device: ${genymotion_devices[0]}"
exec "$RN_CLI" run-android --deviceId "${genymotion_devices[0]}" "$@"
