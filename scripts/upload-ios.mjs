#!/usr/bin/env node
// Copyright 2017-2022 SubWallet
// SPDX-License-Identifier: Apache-2.0
import {
    refName,
    uploadBuild,
    getPackageInfo,
    buildDateString
  } from "./common.mjs";
  
  async function runUploadIOS() {
    const packageInfo = getPackageInfo('./package.json');
    const downloadLink = await uploadBuild('output.ipa', `SubWalletMobile-build-${packageInfo.build}-${refName}-${buildDateString}.ipa`);
    // Very important! This console.log is used to pass download link to Discord action
    console.log(`iOS build file: ${downloadLink}`);
  }

runUploadIOS();
