import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import React from 'react';

export const alwaysShowedKey = ['dot', 'ksm', 'polkadot|DOT', 'kusama|KSM'];

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