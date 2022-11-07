#!/usr/bin/env node
// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
import axios from 'axios';
import fs from "fs";

import path from "path";

import {commitMessage, discordHook, execSync, getPackageInfo, refName} from "./common.mjs";

function getTimeLabel(timeOffset) {
  const now = new Date();
  now.setTime(now.getTime() + timeOffset * 60 * 60 * 1000)
  return now.toISOString().replace('T', '_').replaceAll(':', '-').substring(0, 19)
}

let success = true;
const packageInfo = getPackageInfo();
const timeLabel = getTimeLabel(7);

function notifyStart() {
  return discordHook.send(`:computer: :computer: :computer: Run build for commit: "${refName}: ${commitMessage}"`);
}

function notifyFinish() {
  if (success) {
    return discordHook.send(`:white_check_mark: :white_check_mark: :white_check_mark: Finish build for commit: "${refName}: ${commitMessage}"`);
  }
}

function runBuildIOS() {
  return execSync('./scripts/build-ios.sh')
}

function runBuildAndroid() {
  return execSync('./scripts/build-android.sh')
}

async function uploadBuild(filePath, uploadName) {
  const refName = process.env.REF_NAME
  const commitMessage = process.env.COMMIT_MESSAGE

  await discordHook.send('Finish build ' + refName + ': ' + commitMessage)

  try {
    const cloudConfig = JSON.parse(process.env.NEXTCLOUD_CONFIG)
    const {nextCloudUrl, nextCloudUsername, nextCloudPassword, folder, shareFolder} = cloudConfig;

    const downloadLink = `${nextCloudUrl}/s/${shareFolder}/download?path=%2F&files=${uploadName}`;
    const uploadUrl = `${nextCloudUrl}/remote.php/dav/files/${nextCloudUsername}/${folder}/${uploadName}`;

    const file = await fs.readFileSync(filePath);

    const rs = await axios.put(uploadUrl, file, {
      auth: {
        username: nextCloudUsername, password: nextCloudPassword
      },
      headers: {'Content-Type': 'text/octet-stream'},
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    if (rs.statusText === 'Created') {
      discordHook.send('Upload success! Please download here:')
      discordHook.send(downloadLink)
    } else {
      console.warn('Can not upload build to discord!')
    }
  } catch (e) {
    console.warn('NEXTCLOUD_CONFIG WRONG', e)
  }
}

await notifyStart();
await runBuildIOS()
await runBuildAndroid()
await uploadBuild(path.resolve(process.cwd(), 'android/app/build/outputs/apk/universal.apk'), `subwallet-mobile-v${packageInfo.version}-b${packageInfo.build}-${timeLabel}.apk`)
await notifyFinish();
