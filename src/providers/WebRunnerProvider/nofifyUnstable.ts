import { Alert, AlertButton, Linking } from 'react-native';
import i18n from 'utils/i18n/i18n';

let isNotified = false;

export function notifyUnstable() {
  if (isNotified) {
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
      style: 'destructive',
      onPress: () => {
        setTimeout(() => {
          isNotified = false;
        }, 60 * 60000);
      },
    },
  ];

  setTimeout(() => {
    Alert.alert(title, message, buttons);
  }, 6000);

  isNotified = true;
}
