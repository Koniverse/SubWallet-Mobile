import { RootNavigationProps } from 'types/routes';
import { updateAccountsWaitingStatus } from 'stores/updater';

export function backToHome(navigation: RootNavigationProps, isDispatchWaiting?: boolean) {
  if (isDispatchWaiting) {
    updateAccountsWaitingStatus(true);
  }

  navigation.navigate('Home');
}
