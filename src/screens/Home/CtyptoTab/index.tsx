import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import ActionButton from 'components/ActionButton';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { SceneMap } from 'react-native-tab-view';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/TokensTab';
import { useNavigation } from '@react-navigation/native';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import {SVGImages} from "assets/index";

const ROUTES = [
  { key: 'chains', title: 'Chains' },
  { key: 'tokens', title: 'Tokens' },
];

const renderScene = SceneMap({
  chains: ChainsTab,
  tokens: TokensTab,
});

const cryptoTabContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#222222',
  paddingBottom: 22,
};
const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 36,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
};

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const {
    accounts: { currentAccountAddress },
  } = useSelector((state: RootState) => state);

  return (
    <MainScreenContainer navigation={navigation}>
      <View>
        <View style={cryptoTabContainer}>
          <BalancesVisibility />
          <View style={actionButtonWrapper}>
            <ActionButton
              label="Receive"
              iconSize={24}
              iconName={'ReceiveIcon'}
              onPress={() => setReceiveModalVisible(true)}
            />
            <ActionButton label="Send" iconSize={24} iconName={'SendIcon'} />
            <ActionButton label="Swap" iconSize={24} iconName={'SwapIcon'} />
          </View>
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

        <ReceiveModal
          receiveModalVisible={receiveModalVisible}
          currentAccountAddress={currentAccountAddress}
          onChangeVisible={() => setReceiveModalVisible(false)}
        />
      </View>
    </MainScreenContainer>
  );
};
