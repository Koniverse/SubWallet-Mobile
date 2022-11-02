#!/usr/bin/env node
// Copyright 2017-2022 SubWallet
// SPDX-License-Identifier: Apache-2.0
import cp from 'child_process';
import {Webhook} from "discord-webhook-node";
const discordHook = new Webhook(process.env.DISCORD_HOOK || 'https://discord.com/api/webhooks/1037223954324140132/XCik4qF_66zM07lFohefSSY2BixusMdgFddbgASstTLFfICz67vJA67Qe1xuhXN_Hu0f');
const commitMessage = process.env.COMMIT_MESSAGE | 'Test commit message';

export function execSync (cmd, noLog) {
  !noLog && console.log(`$ ${cmd}`);

  try {
    cp.execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    discordHook.send(`Failed to run "${cmd}" for "${commitMessage}"`).finally(() => {
      process.exit(-1);
    })
  }
}

function notifyStart() {
  return discordHook.send(`Run autocheck for commit: "${commitMessage}"`);
}
function notifyFinish() {
  return discordHook.send(`Finish autocheck for commit: "${commitMessage}"`);
}

function runCheck() {
  execSync('yarn lint');
}


await notifyStart();
runCheck();
await notifyFinish();
