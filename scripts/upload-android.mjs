#!/usr/bin/env node
// Copyright 2017-2022 SubWallet
// SPDX-License-Identifier: Apache-2.0
import {
    refName,
    uploadBuild,
    getPackageInfo,
    buildDateString
  } from "./common.mjs";
  
  async function runUploadAndroid() {
    const packageInfo = getPackageInfo('./package.json');
    const downloadLink = await uploadBuild('./android/app/build/outputs/apk/release/app-release.apk', `SubWalletMobile-build-${packageInfo.build}-${refName}-${buildDateString}.apk`);
    // Very important! This console.log is used to pass download link to Discord action
    console.log(`Android build file: ${downloadLink}`);
  }

runUploadAndroid();

  