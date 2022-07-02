import React from 'react';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainList/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainList/TokensTab';
import { StyleProp, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../../types';
import { AccountInfoByNetwork } from 'types/ui-types';
import { ColorMap } from 'styles/color';
interface Props {
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  totalValue: BigN;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
  showedNetworks: string[];
  networkBalanceMaps: Record<string, BalanceInfo>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  onPressSendFundBtn: () => void;
  onPressTokenItem: (
    tokenName: string,
    tokenBalanceValue: BigN,
    tokenConvertedValue: BigN,
    tokenSymbol: string,
    info?: AccountInfoByNetwork,
    balanceInfo?: BalanceInfo,
  ) => void;
}

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: ColorMap.dark2,
  paddingTop: 21,
};

const ROUTES = [
  { key: 'chains', title: 'Chains' },
  { key: 'tokens', title: 'Tokens' },
];

export const ChainListScreen = ({
  accountInfoByNetworkMap,
  totalValue,
  navigation,
  onShoHideReceiveModal,
  receiveModalVisible,
  showedNetworks,
  networkBalanceMaps,
  onPressChainItem,
  onPressSendFundBtn,
  onPressTokenItem,
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
    <MainScreenContainer navigation={navigation}>
      <>
        <View style={balanceContainer}>
          <BalancesVisibility value={totalValue} symbol={'$'} />

          <ActionButtonContainer
            onPressSendFundBtn={onPressSendFundBtn}
            openReceiveModal={() => onShoHideReceiveModal(true)}
          />
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

        <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => onShoHideReceiveModal(false)} />
      </>
    </MainScreenContainer>
  );
};
