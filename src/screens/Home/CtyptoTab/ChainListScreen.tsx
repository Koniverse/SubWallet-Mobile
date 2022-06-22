import React from 'react';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/TokensTab';
import { NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import { StyleProp, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../types';

interface Props {
  totalValue: BigN;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
  currentAccountAddress: string;
  showedNetworks: string[];
  networkBalanceMaps: Record<string, BalanceInfo>;
  networkMetadataMap: Record<string, NetWorkMetadataDef>;
  onPressChainItem: () => void;
}

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#222222',
  paddingTop: 21,
};

const ROUTES = [
  { key: 'chains', title: 'Chains' },
  { key: 'tokens', title: 'Tokens' },
];

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
}: Props) => {
  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'tokens':
        return <TokensTab />;
      case 'chains':
      default:
        return (
          <ChainsTab
            onPressChainItem={onPressChainItem}
            networkBalanceMaps={networkBalanceMaps}
            address={currentAccountAddress}
            networkKeys={showedNetworks}
            networkMetadataMap={networkMetadataMap}
          />
        );
    }
  };

  return (
    <MainScreenContainer navigation={navigation}>
      <>
        <View style={balanceContainer}>
          <BalancesVisibility value={totalValue} symbol={'$'} />

          <ActionButtonContainer openReceiveModal={() => onShoHideReceiveModal(true)} />
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

        <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => onShoHideReceiveModal(false)} />
      </>
    </MainScreenContainer>
  );
};
