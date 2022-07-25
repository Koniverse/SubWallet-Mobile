import React from 'react';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainList/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainList/TokensTab';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../../types';
import { AccountInfoByNetwork, BalanceContainerType } from 'types/ui-types';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';
interface Props {
  onPressSearchButton?: () => void;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showedNetworks: string[];
  networkBalanceMaps: Record<string, BalanceInfo>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  onPressTokenItem: (
    tokenName: string,
    tokenBalanceValue: BigN,
    tokenConvertedValue: BigN,
    tokenSymbol: string,
    info?: AccountInfoByNetwork,
    balanceInfo?: BalanceInfo,
  ) => void;
  balanceContainerProps: BalanceContainerType;
}

const ROUTES = [
  { key: 'tokens', title: 'Tokens' },
  { key: 'chains', title: 'Chains' },
];

export const ChainListScreen = ({
  onPressSearchButton,
  accountInfoByNetworkMap,
  navigation,
  showedNetworks,
  networkBalanceMaps,
  onPressChainItem,
  onPressTokenItem,
  balanceContainerProps,
}: Props) => {
  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'tokens':
        return (
          <TokensTab
            accountInfoByNetworkMap={accountInfoByNetworkMap}
            networkBalanceMaps={networkBalanceMaps}
            onPressTokenItem={onPressTokenItem}
          />
        );
      case 'chains':
      default:
        return (
          <ChainsTab
            onPressChainItem={onPressChainItem}
            networkKeys={showedNetworks}
            networkBalanceMaps={networkBalanceMaps}
            accountInfoByNetworkMap={accountInfoByNetworkMap}
          />
        );
    }
  };

  return (
    <MainScreenContainer navigation={navigation} onPressSearchButton={onPressSearchButton}>
      <>
        <BalanceBlock {...balanceContainerProps} />

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />
      </>
    </MainScreenContainer>
  );
};
