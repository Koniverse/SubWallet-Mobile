import { useCallback, useEffect, useState } from 'react';
import { AppInstaller } from '../NativeModules';
import axios from 'axios/index';
import RNFetchBlob from 'rn-fetch-blob';
import { Linking, Platform } from 'react-native';
import { APPSTORE_URL, GITHUB_REPOS_URL, PLAYSTORE_URL } from 'constants/index';
import { mmkvStore } from 'utils/storage';
import { getBuildNumber } from 'react-native-device-info';

export const useInstallation = (
  showUpdateModal: (value: boolean) => void,
  setUpdateAppData: (data: { title: string; data: string }[]) => void,
) => {
  const [installType, setInstallType] = useState<'store' | 'apk' | undefined>(undefined);
  const [showProgressModal, setShowProgressBarModal] = useState<boolean>(false);
  const [progressNumb, setProgressNumb] = useState<number>(0);
  const [currentData, setCurrentData] = useState<any>(undefined);
  const [latestBuildNumber, setLatestBuildNumber] = useState<any>(0);
  const installLatestAppFromAPK = useCallback((response: any) => {
    RNFetchBlob.config({
      fileCache: true,
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/${response.assets[0].name}`,
    })
      .fetch('GET', response.assets[0].browser_download_url)
      .progress({ count: 20 }, (received, total) => {
        const a = received / total;
        setProgressNumb(a);
      })
      .then(result => {
        AppInstaller.install(result.path());
      })
      .finally(() => {
        setShowProgressBarModal(false);
      });
  }, []);

  const onPressCancel = useCallback(() => {
    mmkvStore.set('storedBuildNumber', latestBuildNumber);
    showUpdateModal(false);
  }, [latestBuildNumber, showUpdateModal]);

  const onPressUpdate = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL(APPSTORE_URL);
    } else {
      if (installType === 'apk') {
        setShowProgressBarModal(true);
        installLatestAppFromAPK(currentData);
      } else if (installType === 'store') {
        Linking.openURL(PLAYSTORE_URL);
      }
    }

    showUpdateModal(false);
  }, [currentData, installLatestAppFromAPK, installType, showUpdateModal]);

  useEffect(() => {
    // Get lastest release version from github
    axios.get(GITHUB_REPOS_URL).then(res => {
      const remoteBuildNumber = res.data[0]?.tag_name?.split('-')[1];
      const currentBuildNumber = parseInt(getBuildNumber(), 10);
      const storedBuildNumber = mmkvStore.getNumber('storedBuildNumber');
      setLatestBuildNumber(remoteBuildNumber);
      // @ts-ignore
      const data = res.data
        ? res.data.map(item => {
            const result = item.body.split(/[\r\n]+/).slice(1, -1);
            return { title: item.name, data: result.join('\n') };
          })
        : [];
      setCurrentData(res.data[0]);
      // If release version is higher than current => download & update app
      if (remoteBuildNumber) {
        if (storedBuildNumber && storedBuildNumber === currentBuildNumber) {
          return;
        }

        if (remoteBuildNumber > currentBuildNumber) {
          setUpdateAppData(data.slice(0, remoteBuildNumber - currentBuildNumber));
          showUpdateModal(true);
          if (Platform.OS === 'android') {
            AppInstaller.verifyInstallerId((installer: string | null) => {
              if (installer?.includes('packageinstaller')) {
                setInstallType('apk');
              } else {
                setInstallType('store');
              }
            });
          }
        }
      }
    });
  }, [setUpdateAppData, showUpdateModal]);

  return { onPressUpdate, setShowProgressBarModal, showProgressModal, progressNumb, onPressCancel };
};
