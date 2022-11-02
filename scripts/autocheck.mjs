#!/usr/bin/env node
// Copyright 2017-2022 SubWallet
// SPDX-License-Identifier: Apache-2.0
import cp from 'child_process';
import {Webhook} from "discord-webhook-node";

const discordHook = new Webhook(process.env.DISCORD_WEBHOOK || '');
const commitMessage = process.env.COMMIT_MESSAGE || '';

let success = true;

export function execSync (cmd, noLog) {
  !noLog && console.log(`$ ${cmd}`);

  try {
    cp.execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    success = false;
    discordHook.send(`:red_circle: :red_circle: :red_circle:  Failed to run "${cmd}" for "${commitMessage}"`).finally(() => {
      process.exit(-1);
    })
  }
}

function notifyStart() {
  return discordHook.send(`:computer: :computer: :computer: Run autocheck for commit: "${commitMessage}"`);
}
function notifyFinish() {
  if (success) {
    return discordHook.send(`:white_check_mark: :white_check_mark: :white_check_mark: Finish autocheck for commit: "${commitMessage}"`);
  }
}

function runCheck() {
  execSync('yarn lint');
}


await notifyStart();
runCheck();
await notifyFinish();
