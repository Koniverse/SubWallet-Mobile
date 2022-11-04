import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import React from 'react';
import { AccountType, TokenBalanceItemType } from 'types/ui-types';
import { BN_ZERO } from 'utils/chainBalances';
import { StyleProp } from 'react-native';
import { DEVICE } from 'constants/index';

export const itemWrapperStyle: StyleProp<any> = {
  width: '100%',
  backgroundColor: ColorMap.dark1,
  position: 'relative',
};

export const itemWrapperAppendixStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  position: 'absolute',
  left: 0,
  right: 0,
  height: DEVICE.height,
  top: '100%',
  marginTop: 8,
};

export const alwaysShowedKey = ['polkadot|DOT', 'kusama|KSM'];

export function isItemAllowedToShow(
  item: TokenBalanceItemType,
  accountType: AccountType,
  tokenGroupMap: Record<string, string[]>,
  isShowZeroBalance?: boolean,
): boolean {
  if (!isShowZeroBalance) {
    if (BN_ZERO.eq(item.balanceValue)) {
      if (tokenGroupMap[item.id]) {
        return tokenGroupMap[item.id].some(k => alwaysShowedKey.includes(k));
      } else if (alwaysShowedKey.includes(item.id)) {
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
