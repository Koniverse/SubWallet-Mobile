import { mobileBackup, mobileRestore } from 'messaging/index';
import { MMKV } from 'react-native-mmkv';
import { Storage } from 'redux-persist';
import { addLazy } from '@subwallet/extension-base/utils/lazy';

const storage = new MMKV();

export const mmkvStore = storage;

export const mmkvReduxStore: Storage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  getItem: key => {
    const value = storage.getString(key);
    return Promise.resolve(value || null);
  },
  removeItem: key => {
    storage.delete(key);
    return Promise.resolve();
  },
};

export const BACKUP_BLACKLIST: string[] = ['mobile(storage.backup)'];
export const BACKUP_WHITELIST: string[] = [
  // Chain events
  'pri(chainService.upsertChain)',
  'pri(chainService.enableChains)',
  'pri(chainService.enableChain)',
  'pri(chainService.disableChains)',
  'pri(chainService.disableChain)',
  'pri(chainService.removeChain)',
  'pri(chainService.deleteCustomAsset)',
  'pri(chainService.upsertCustomAsset)',
  'pri(chainService.resetDefaultChains)',
  'pri(chainService.disableAllChains)',

  // Assets events
  'pri(assetSetting.update)',
  // 'pri(mantaPay.enable)',
  // 'pri(mantaPay.disable)',
  // 'pri(mantaPay.initSyncMantaPay)',

  // Account events
  'pri(authorize.approveV2)',
  'pri(authorize.changeSiteAll)',
  'pri(authorize.changeSite)',
  'pri(authorize.changeSitePerAccount)',
  'pri(authorize.changeSitePerSite)',
  'pri(authorize.changeSiteBlock)',
  'pri(authorize.forgetSite)',
  'pri(authorize.forgetAllSite)',
  'pri(authorize.rejectV2)',
  'pri(authorize.toggle)',
  'pri(accounts.create.suriV2)',
  'pri(accounts.create.externalV2)',
  'pri(accounts.create.hardwareV2)',
  'pri(accounts.create.hardwareMultiple)',
  'pri(accounts.create.withSecret)',
  'pri(accounts.forget)',
  // 'pri(accounts.inject.add)',
  // 'pri(accounts.inject.remove)',
  'pri(derivation.createV2)',
  'pri(json.restoreV2)',
  'pri(json.batchRestoreV2)',
  'pri(accounts.updateCurrentAddress)',
  'pri(currentAccount.saveAddress)',
  'pri(accounts.saveRecent)',
  'pri(accounts.editContact)',
  'pri(accounts.deleteContact)',

  // Settings events
  'pri(settings.changeBalancesVisibility)',
  'pri(settings.saveAccountAllLogo)',
  'pri(settings.saveTheme)',
  'pri(settings.saveBrowserConfirmationType)',
  'pri(settings.saveCamera)',
  'pri(settings.saveAutoLockTime)',
  'pri(settings.saveUnlockType)',
  'pri(settings.saveEnableChainPatrol)',
  'pri(settings.saveLanguage)',
  'pri(settings.saveShowZeroBalance)',
  'pri(settings.saveShowBalance)',

  // Confirmation events
  'pri(confirmations.complete)',

  // Keyring events
  'pri(keyring.change)',
  'pri(keyring.migrate)',
  'pri(keyring.reset)',
  'pri(signing.approve.passwordV2)',
  'pri(derivation.create.multiple)',
  'pri(derivation.createV3)',
  // 'pri(transactions.subscribe)',
  // 'pri(notifications.subscribe)',
  'pub(token.add)',

  // WalletConnect events
  'pri(walletConnect.session.approve)',
  'pri(walletConnect.session.disconnect)',

  // Others
  'pri(campaign.banner.complete)',
];

export const needBackup = (message: string): boolean => {
  return BACKUP_WHITELIST.includes(message);
};

// Backup and restore data
export const backupStorageData = (forceBackup: boolean = false, markAppIsSetup: boolean = true) => {
  mobileBackup()
    .then(response => {
      if (typeof response.storage !== 'string') {
        return;
      }
      const preBackupData = JSON.parse(response.storage);
      const isAccount = Object.keys(preBackupData).find((item: string) => item.startsWith('account:'));
      if ((isAccount && preBackupData['keyring:subwallet']) || forceBackup) {
        const lastBackupTime = new Date();
        mmkvStore.set('backup-indexedDB', response.indexedDB);
        mmkvStore.set('backup-localstorage', response.storage);
        mmkvStore.set('webRunnerLastBackupTime', lastBackupTime.toString());
        mmkvStore.set('webRunnerLastBackupTimestamp', lastBackupTime.getTime());
        mmkvStore.set('app-is-setup', markAppIsSetup);
        // console.debug('** Backup storage data success');
      }
    })
    .catch(e => console.debug('** Backup storage data error:', e));
};

export const triggerBackup = (message = '*** Backup storage') => {
  addLazy(
    'backupStorageData',
    () => {
      console.debug(message);
      backupStorageData();
    },
    3000,
    9000,
    false,
  );
};

export const triggerBackupOnInit = () => {
  const lastBackupTimestamp = mmkvStore.getNumber('webRunnerLastBackupTimestamp');
  // Backup logic with device not ios 17
  if (!lastBackupTimestamp) {
    triggerBackup('*** Backup storage on init');
  }
};

export const restoreStorageData = () => {
  // Todo: Consider to remove this condition
  // if (!isIOS17) {
  //   // Restore empty storage
  //   mobileRestore({}).catch(console.error);
  //   return;
  // }

  const indexedDB = mmkvStore.getString('backup-indexedDB');
  const localstorage = mmkvStore.getString('backup-localstorage');
  mobileRestore({ indexedDB, storage: localstorage })
    .then(() => {
      console.debug('** Restore storage data success');
      mmkvStore.set('webRunnerLastRestoreTime', new Date().toString());
    })
    .catch(e => console.debug('** Restore storage data error:', e));
};

// MKT Campaign flags for iOS 17 when reset data happen
const bannerSlugKey = 'bannerSlugs';
export const setBannerSlugs = (newSlug: string) => {
  const bannerSlugs = getBannerSlugs() || [];
  bannerSlugs.push(newSlug);
  mmkvStore.set(bannerSlugKey, JSON.stringify(bannerSlugs));
};
export const getBannerSlugs = () => {
  let bannerSlugs = mmkvStore.getString(bannerSlugKey);
  try {
    bannerSlugs = JSON.parse(bannerSlugs ?? '');
  } catch (error) {
    bannerSlugs = undefined;
  }

  return bannerSlugs as string[] | undefined;
};

export const tokenDetailBannerKey = 'hideTokenDetailBanner';
export const setHideBanner = (key: string, value: string) => {
  const campaignId = getHideBanner(key) || [];
  campaignId.push(value);
  mmkvStore.set(key, JSON.stringify(campaignId));
};
export const getHideBanner = (key: string) => {
  let campaignId = mmkvStore.getString(key);
  try {
    campaignId = JSON.parse(campaignId ?? '');
  } catch (error) {
    campaignId = undefined;
  }

  return campaignId as string[] | undefined;
};
