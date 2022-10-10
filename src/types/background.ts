import { CronServiceType, SubscriptionServiceType } from '@subwallet/extension-base/background/KoniTypes';

// todo: remove these types below after extension-koni-base export them

export interface RequestCronAndSubscriptionAction {
  subscriptionServices: SubscriptionServiceType[];
  cronServices: CronServiceType[];
}
