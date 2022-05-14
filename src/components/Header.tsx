import React, {ReactElement, ReactNode} from 'react';
import {Text, TouchableWithoutFeedback, View} from 'react-native';
import {useSubWalletTheme} from '../hooks/useSubWalletTheme';
import {useSVG} from '../hooks/useSVG';
import {NavigationContainerRefWithCurrent} from '@react-navigation/core/src/types';
import {RootStackParamList} from '../App';

interface HeaderProps {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
}

export function Header({
  navigationRef,
}: HeaderProps): ReactElement<HeaderProps> {
  const swThemeColor = useSubWalletTheme().colors;
  const Logo = useSVG().Logo;

  return (
    <View
      style={{
        backgroundColor: swThemeColor.background,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingLeft: 2,
      }}>
      <View style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={() => {navigationRef.navigate('Home')}}>
          <Logo.SubWallet width={48} height={48} />
        </TouchableWithoutFeedback>
      </View>
      <View style={{padding: 4}}>
        <Text>Select Network</Text>
      </View>
      <View style={{padding: 4}}>
        <Text>Accounts</Text>
      </View>
    </View>
  );
}
