#!/usr/bin/env node
// Copyright 2017-2022 SubWallet
// SPDX-License-Identifier: Apache-2.0
import {
  commitMessage,
  discordHook,
  execSync,
  refName,
  uploadBuild,
  getPackageInfo,
  buildDateString
} from "./common.mjs";

function notifyStart() {
  return discordHook.send(`:computer: Start build android for: "${refName}: ${commitMessage}"`);
}
function notifyFinish() {
  return discordHook.send(`:ok: Finish build android for: "${refName}: ${commitMessage}"`);
}

async function runCleanAndroid() {
  return execSync('./gradlew clean', 'Clean build');
}

async function runBuildAndroid() {
  return execSync('./gradlew assembleRelease', 'Build APK');
}

async function runUploadAndroid() {
  const packageInfo = getPackageInfo('../package.json');
  const downloadLink = await uploadBuild('./app/build/outputs/apk/release/app-release.apk', `SubWalletMobile-build-${packageInfo.build}-${refName}-${buildDateString}.apk`);
  return discordHook.send(`:robot: Android build (${refName}): ${downloadLink}`);
}

// await notifyStart();
await runCleanAndroid()
await runBuildAndroid();
await runUploadAndroid();
// await notifyFinish();
