import React from 'react';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainList/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainList/TokensTab';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../../types';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  onPressSearchButton?: () => void;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showedNetworks: string[];
  networkBalanceMaps: Record<string, BalanceInfo>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  onPressTokenItem: (tokenName: string, tokenSymbol: string, info?: AccountInfoByNetwork) => void;
  totalBalanceValue: BigN;
}

export const ChainListScreen = ({
  onPressSearchButton,
  accountInfoByNetworkMap,
  navigation,
  showedNetworks,
  networkBalanceMaps,
  onPressChainItem,
  onPressTokenItem,
  totalBalanceValue,
}: Props) => {
  const renderTabBar = (props: Tabs.MaterialTabBarProps<any>) => (
    <Tabs.MaterialTabBar
      {...props}
      // scrollEnabled
      activeColor={ColorMap.light}
      inactiveColor={ColorMap.light}
      indicatorStyle={{ backgroundColor: ColorMap.light, marginHorizontal: 16 }}
      tabStyle={{ backgroundColor: ColorMap.dark2 }}
      style={{ backgroundColor: ColorMap.dark2 }}
      labelStyle={{ ...sharedStyles.mediumText, ...FontSemiBold }}
    />
  );

  return (
    <MainScreenContainer navigation={navigation} onPressSearchButton={onPressSearchButton}>
      <Tabs.Container
        lazy
        allowHeaderOverscroll={true}
        renderTabBar={renderTabBar}
        renderHeader={() => {
          return <BalanceBlock balanceValue={totalBalanceValue} />;
        }}>
        <Tabs.Tab name="token" label="Token">
          <TokensTab
            accountInfoByNetworkMap={accountInfoByNetworkMap}
            networkBalanceMaps={networkBalanceMaps}
            onPressTokenItem={onPressTokenItem}
          />
        </Tabs.Tab>
        <Tabs.Tab name="chain" label="Chain">
          <ChainsTab
            onPressChainItem={onPressChainItem}
            networkKeys={showedNetworks}
            networkBalanceMaps={networkBalanceMaps}
            accountInfoByNetworkMap={accountInfoByNetworkMap}
          />
        </Tabs.Tab>
      </Tabs.Container>
    </MainScreenContainer>
  );
};
