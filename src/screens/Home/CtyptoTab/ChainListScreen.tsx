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

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
  currentAccountAddress: string;
  showedNetworks: string[];
  networkMetadataMap: Record<string, NetWorkMetadataDef>;
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
  navigation,
  onShoHideReceiveModal,
  receiveModalVisible,
  currentAccountAddress,
  showedNetworks,
  networkMetadataMap,
}: Props) => {
  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'chains':
        return (
          <ChainsTab
            address={currentAccountAddress}
            networkKeys={showedNetworks}
            networkMetadataMap={networkMetadataMap}
          />
        );
      case 'tokens':
        return <TokensTab />;
      default:
        return (
          <ChainsTab
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
          <BalancesVisibility />

          <ActionButtonContainer openReceiveModal={() => onShoHideReceiveModal(true)} />
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

        <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => onShoHideReceiveModal(false)} />
      </>
    </MainScreenContainer>
  );
};
