import cp from 'child_process';
import {Webhook} from "discord-webhook-node";
import fs from "fs";
import path from "path";
import axios from "axios";


export const discordHook = new Webhook(process.env.DISCORD_WEBHOOK || '');
export const commitMessage = process.env.COMMIT_MESSAGE || 'Default commit message';
export const refName = process.env.REF_NAME || 'default-ref';
export const buildDateString = new Date().toISOString().slice(0, 19).replaceAll(':', '-')
const cloudConfig = JSON.parse(process.env.NEXTCLOUD_CONFIG || '{}');

export async function execSync(cmd, name) {
  return new Promise((resolve, reject) => {
    // const startTime = new Date().getTime();
    try {
      cp.execSync(cmd, {stdio: 'inherit'});
      // const runTime = (new Date().getTime() - startTime)/1000
      // discordHook.send(`Finish ${name || cmd} in ${runTime}s`).finally(resolve);
      resolve();
    } catch (error) {
      discordHook.send(`:red_circle:  Failed to run "${name || cmd}" for "${refName}: ${commitMessage}"`).finally(() => {
        process.exit(-1);
        reject(error)
      })
    }
  })
}

export async function uploadBuild(uploadFile, newName) {
  try {
    const {nextCloudUrl, nextCloudUsername, nextCloudPassword, folder, shareFolder} = cloudConfig;
    // replace all '/' to '-' in file name
    const finalName = newName.replaceAll('/', '-');
    const downloadLink = `${nextCloudUrl}/s/${shareFolder}/download?path=%2F&files=${finalName}`;
    const uploadUrl = `${nextCloudUrl}/remote.php/dav/files/${nextCloudUsername}/${folder}/${finalName}`;

    const file = await fs.readFileSync(uploadFile);

    const rs = await axios.put(uploadUrl, file, {
      auth: {
        username: nextCloudUsername, password: nextCloudPassword
      },
      headers: {'Content-Type': 'text/octet-stream'},
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    return downloadLink;
  } catch (e) {
    console.warn('NEXTCLOUD_CONFIG WRONG', e)
  }
}

export function getPackageInfo(packagePath = './package.json') {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), packagePath), 'utf8')
  );
}
