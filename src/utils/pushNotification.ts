import { getTimeZone } from 'react-native-localize';
import { OneSignal } from 'react-native-onesignal';

const timezone = getTimeZone();

export function createNotificationConfig(language: string) {
  OneSignal.Notifications.requestPermission(true);
  OneSignal.User.setLanguage(language);
  OneSignal.User.addTag('timezone', timezone);
}
