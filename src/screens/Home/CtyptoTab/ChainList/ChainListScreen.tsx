import React from 'react';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainList/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainList/TokensTab';
import { NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import { StyleProp, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../../types';
import { AccountInfoByNetwork } from 'types/ui-types';
import { ColorMap } from 'styles/color';

interface Props {
  totalValue: BigN;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
  currentAccountAddress: string;
  showedNetworks: string[];
  networkBalanceMaps: Record<string, BalanceInfo>;
  networkMetadataMap: Record<string, NetWorkMetadataDef>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  onPressSendFundBtn: () => void;
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

function getAccountInfoByNetwork(
  address: string,
  networkKey: string,
  networkMetadata: NetWorkMetadataDef,
): AccountInfoByNetwork {
  return {
    address,
    key: networkKey,
    networkKey,
    networkDisplayName: networkMetadata.chain,
    networkPrefix: networkMetadata.ss58Format,
    networkLogo: networkKey,
    networkIconTheme: networkMetadata.isEthereum ? 'ethereum' : networkMetadata.icon || 'polkadot',
    formattedAddress: address,
  };
}

function getAccountInfoByNetworkMap(
  address: string,
  networkKeys: string[],
  networkMetadataMap: Record<string, NetWorkMetadataDef>,
): Record<string, AccountInfoByNetwork> {
  const result: Record<string, AccountInfoByNetwork> = {};

  networkKeys.forEach(n => {
    if (networkMetadataMap[n]) {
      result[n] = getAccountInfoByNetwork(address, n, networkMetadataMap[n]);
    }
  });

  return result;
}

export const ChainListScreen = ({
  totalValue,
  navigation,
  onShoHideReceiveModal,
  receiveModalVisible,
  currentAccountAddress,
  showedNetworks,
  networkMetadataMap,
  networkBalanceMaps,
  onPressChainItem,
  onPressSendFundBtn,
}: Props) => {
  const accountInfoByNetworkMap: Record<string, AccountInfoByNetwork> = getAccountInfoByNetworkMap(
    currentAccountAddress,
    showedNetworks,
    networkMetadataMap,
  );

  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'tokens':
        return <TokensTab accountInfoByNetworkMap={accountInfoByNetworkMap} networkBalanceMaps={networkBalanceMaps} />;
      case 'chains':
      default:
        return (
          <ChainsTab
            onPressChainItem={onPressChainItem}
            networkBalanceMaps={networkBalanceMaps}
            networkKeys={showedNetworks}
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
