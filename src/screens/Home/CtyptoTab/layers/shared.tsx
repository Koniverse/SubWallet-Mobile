import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import React from 'react';
import { AccountType, TokenBalanceItemType } from 'types/ui-types';
import { BN_ZERO } from 'utils/chainBalances';

export const alwaysShowedKey = ['dot', 'ksm', 'polkadot|DOT', 'kusama|KSM'];

export function isItemAllowedToShow(
  item: TokenBalanceItemType,
  accountType: AccountType,
  isShowZeroBalance?: boolean,
): boolean {
  if (!isShowZeroBalance) {
    if (BN_ZERO.eq(item.balanceValue)) {
      if (alwaysShowedKey.includes(item.id)) {
        return accountType !== 'ETHEREUM';
      }

      return false;
    }
  }

  return true;
}

export const renderTabBar = (props: Tabs.MaterialTabBarProps<any>) => (
  <Tabs.MaterialTabBar
    {...props}
    activeColor={ColorMap.light}
    inactiveColor={ColorMap.light}
    indicatorStyle={{ backgroundColor: ColorMap.light, marginHorizontal: 16 }}
    tabStyle={{ backgroundColor: ColorMap.dark2 }}
    style={{ backgroundColor: ColorMap.dark2 }}
    labelStyle={{ ...sharedStyles.mediumText, ...FontSemiBold }}
  />
);
