import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import ActionButton from 'components/ActionButton';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SceneMap } from 'react-native-tab-view';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/TokensTab';
import { useNavigation } from '@react-navigation/native';
import { MainScreenContainer } from 'components/MainScreenContainer';
import { RootNavigationProps } from 'types/routes';
import {PasswordInput} from "components/PasswordInput";

const ROUTES = [
  { key: 'chains', title: 'Chains' },
  { key: 'tokens', title: 'Tokens' },
];

const renderScene = SceneMap({
  chains: ChainsTab,
  tokens: TokensTab,
});

export const CryptoTab = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        cryptoTabContainer: {
          paddingHorizontal: 16,
          alignItems: 'center',
          backgroundColor: '#222222',
        },
        actionButtonWrapper: {
          paddingTop: 36,
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
        },
      }),
    [],
  );
  return (
    <MainScreenContainer navigation={navigation}>
      <View>
        <View style={styles.cryptoTabContainer}>
          <BalancesVisibility />
          <View style={styles.actionButtonWrapper}>
            <ActionButton label="Receive" iconSize={24} iconName={'ReceiveIcon'} />
            <ActionButton label="Send" iconSize={24} iconName={'SendIcon'} />
            <ActionButton label="Swap" iconSize={24} iconName={'SwapIcon'} />
          </View>

          <PasswordInput label={'password for this account'} />
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />
      </View>
    </MainScreenContainer>
  );
};
