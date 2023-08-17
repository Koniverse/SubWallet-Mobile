import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import { AppInstaller } from '../NativeModules';
import { getBuildNumber } from 'react-native-device-info';

export function checkAppInstalledFromAPK() {
  AppInstaller.verifyInstallerId((installer: string | null) => {
    if (installer?.includes('packageinstaller')) {
      // Get lastest release version from github
      axios.get('https://api.github.com/repos/Koniverse/SubWallet-Mobile/releases/latest').then(res => {
        const remoteBuildNumber = res.data?.tag_name?.split('-')[1];
        const currentBuildNumber = parseInt(getBuildNumber(), 10);
        // TODO: Need show alert to ask user update/cancel
        // If release version is higher than current => download & update app
        if (remoteBuildNumber && remoteBuildNumber > currentBuildNumber) {
          RNFetchBlob.config({
            fileCache: true,
            path: `${RNFetchBlob.fs.dirs.DownloadDir}/${res.data?.assets[0].name}`,
          })
            .fetch('GET', res.data?.assets[0].browser_download_url)
            .then(result => {
              AppInstaller.install(result.path());
            });
        }
      });
    }
  });
}
