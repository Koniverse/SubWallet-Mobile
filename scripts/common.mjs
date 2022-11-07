import cp from 'child_process';
import {Webhook} from "discord-webhook-node";
import fs from "fs";
import path from "path";


export const discordHook = new Webhook(process.env.DISCORD_WEBHOOK || '');
export const commitMessage = process.env.COMMIT_MESSAGE || '';
export const refName = process.env.REF_NAME || '';
export async function execSync(cmd, callback) {
  return new Promise((resolve, reject) => {
    const startTime = new Date().getTime();
    try {
      cp.execSync(cmd, {stdio: 'inherit'});
      const runTime = (new Date().getTime() - startTime)/1000
      discordHook.send(`Finish ${cmd} in ${runTime}s`).finally(resolve);
    } catch (error) {
      discordHook.send(`:red_circle: :red_circle: :red_circle:  Failed to run "${cmd}" for "${refName}: ${commitMessage}"`).finally(() => {
        process.exit(-1);
      })

      reject(error)
    }
  })
}

export function getPackageInfo() {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
  );
}