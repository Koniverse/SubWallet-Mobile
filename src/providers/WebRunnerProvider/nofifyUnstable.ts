import { Alert, AlertButton, Linking } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { mmkvStore } from 'utils/storage';

export function notifyUnstable() {
  const now = new Date().getTime();
  const appIsSetup = mmkvStore.getBoolean('app-is-setup');
  const nextNotifyTime = mmkvStore.getNumber('unstable-next-notify-time') || now;

  // If is first time install, or the next notify time is not reached, do not notify.
  if (!appIsSetup || nextNotifyTime > now) {
    return;
  }

  const title = i18n.notifyUnstable.title;
  const message = i18n.notifyUnstable.message;
  const buttons: AlertButton[] = [
    {
      text: i18n.notifyUnstable.buttonRead,
      onPress: () => {
        Linking.openURL(
          'https://docs.subwallet.app/main/mobile-app-user-guide/account-management/export-and-backup-an-account',
        );
      },
      style: 'default',
    },
    {
      text: i18n.notifyUnstable.buttonCancel,
      style: 'default',
      onPress: () => {
        // Remind again after 24 hours.
        mmkvStore.set('unstable-next-notify-time', new Date().getTime() + 86400000);
      },
    },
    {
      text: i18n.notifyUnstable.buttonReject,
      style: 'destructive',
      onPress: () => {
        mmkvStore.set('unstable-next-notify-time', 999999999999999);
      },
    },
  ];

  setTimeout(() => {
    Alert.alert(title, message, buttons);
  }, 9000);
}
