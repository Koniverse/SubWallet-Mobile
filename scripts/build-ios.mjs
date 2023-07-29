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
  return discordHook.send(`:computer: Start build ios for: "${refName}: ${commitMessage}"`);
}
function notifyFinish() {
  return discordHook.send(`:ok: Finish build ios for: "${refName}: ${commitMessage}"`);
}

async function runCleanIOS() {
  return execSync('rm -rf ./build && rm -rf ./dist && pod update hermes-engine --no-repo-update && pod install --repo-update && pod update MMKV', 'Clean build');
}

async function runBuildIOS() {
  return execSync('xcodebuild -workspace ./SubWalletMobile.xcworkspace -scheme SubWalletMobile -sdk iphoneos -configuration Release -quiet -archivePath $PWD/dist/SubWallet.xcarchive clean archive', 'Build Archive');
}

async function runExportIOS() {
  return execSync('xcodebuild -exportArchive -archivePath $PWD/dist/SubWallet.xcarchive -exportOptionsPlist exportAdhocOptions.plist -exportPath $PWD/dist', 'Export ipa');
}

async function runUploadIOS() {
  const packageInfo = getPackageInfo('../package.json');
  const downloadLink = await uploadBuild('./dist/SubWalletMobile.ipa', `SubWalletMobile-build-${packageInfo.build}-${refName}-${buildDateString}.ipa`);
  return discordHook.send(`:apple: IOS build (${refName}): ${downloadLink}`);
}

// await notifyStart();
await runCleanIOS()
await runBuildIOS();
await runExportIOS();
await runUploadIOS();
// await notifyFinish();
