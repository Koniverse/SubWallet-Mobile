#!/usr/bin/env node
// Copyright 2017-2022 SubWallet
// SPDX-License-Identifier: Apache-2.0
import {commitMessage, discordHook, execSync, refName} from "./common.mjs";

function notifyStart() {
  return discordHook.send(`:computer: :computer: :computer: Run autocheck for commit: "${refName}: ${commitMessage}"`);
}
function notifyFinish() {
  return discordHook.send(`:white_check_mark: :white_check_mark: :white_check_mark: Finish autocheck for commit: "${refName}: ${commitMessage}"`);
}

async function runCheck() {
  return execSync('yarn lint');
}


await notifyStart();
await runCheck();
await notifyFinish();
