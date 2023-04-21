import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import React from 'react';
import { AccountType } from 'types/ui-types';
import { BN_ZERO } from 'utils/chainBalances';
import { StyleProp } from 'react-native';
import { DEVICE } from 'constants/index';
import { TokenBalanceItemType } from 'types/balance';

export const itemWrapperStyle: StyleProp<any> = {
  width: '100%',
  position: 'relative',
  borderRadius: 8,
  marginBottom: 8,
};

export const itemWrapperAppendixStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  position: 'absolute',
  left: 0,
  right: 0,
  height: DEVICE.height,
  top: '100%',
};

export const alwaysShowedKey = ['polkadot-NATIVE-DOT', 'kusama-NATIVE-KSM'];

export function isItemAllowedToShow(
  item: TokenBalanceItemType,
  accountType: AccountType,
  tokenGroupMap: Record<string, string[]>,
  isShowZeroBalance?: boolean,
): boolean {
  if (!isShowZeroBalance) {
    console.log('item.total.value', item.slug);
    if (BN_ZERO.eq(item.total.value)) {
      if (tokenGroupMap[item.slug]) {
        console.log('tokenGroupMap[item.slug]', tokenGroupMap[item.slug]);
        return tokenGroupMap[item.slug].some(k => alwaysShowedKey.includes(k));
      } else if (alwaysShowedKey.includes(item.slug)) {
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
