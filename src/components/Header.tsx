import React, {ReactElement} from 'react';
import {Text, TouchableWithoutFeedback, View} from 'react-native';
import {useSubWalletTheme} from '../hooks/useSubWalletTheme';
import {useSVG} from '../hooks/useSVG';
import {RootStackParamList} from '../App';
import {NavigationContainerRefWithCurrent} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {RootState} from '../stores';

interface HeaderProps {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
}

export function Header({
  navigationRef,
}: HeaderProps): ReactElement<HeaderProps> {
  const swThemeColor = useSubWalletTheme().colors;
  const Logo = useSVG().Logo;
  const accountStore = useSelector((state: RootState) => state.accounts);
  const currentAccount = accountStore.currentAccount;

  return (
    <View
      style={{
        backgroundColor: swThemeColor.background,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
      }}>
      <View style={{flex: 1}}>
        <TouchableWithoutFeedback
          onPress={() => {
            navigationRef.navigate('Home');
          }}>
          <Logo.SubWallet width={48} height={48} />
        </TouchableWithoutFeedback>
      </View>
      <View style={{padding: 4}}>
        <Text>Select Network</Text>
      </View>
      <TouchableWithoutFeedback
        onPress={() => {
          navigationRef.navigate('AccountList');
        }}>
        <View style={{padding: 4, paddingRight: 8}}>
          <Text>{currentAccount?.name || '...'}</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
