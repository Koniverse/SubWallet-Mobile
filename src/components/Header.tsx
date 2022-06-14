import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSVG } from 'hooks/useSVG';
import { RootStackParamList } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { WebViewContext } from 'providers/contexts';
import { useToast } from 'react-native-toast-notifications';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { SpaceStyle } from 'styles/space';
import { toShort } from 'utils/index';
import { sharedStyles } from 'styles/sharedStyles';
import { MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const Header = ({ navigation }: Props) => {
  // const navigation = useNavigation();
  const swThemeColor = useSubWalletTheme().colors;
  const Logo = useSVG().Logo;
  const accountStore = useSelector((state: RootState) => state.accounts);
  const currentAccount = accountStore.currentAccount;
  const toast = useToast();
  const webview = useContext(WebViewContext);
  const reloadBackground = () => {
    toast.show('Start reload');
    webview.viewRef?.current?.reload();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        accountName: {
          ...sharedStyles.mediumText,
          color: swThemeColor.textColor,
          fontWeight: '600',
          paddingLeft: 16,
          maxWidth: 100,
        },
        accountAddress: {
          ...sharedStyles.mainText,
          color: swThemeColor.textColor2,
          paddingLeft: 4,
        },
        actionButtonStyle: {
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [swThemeColor],
  );

  return (
    <View
      style={[
        SpaceStyle.oneContainer,
        {
          backgroundColor: '#222222',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          paddingBottom: 8,
        },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AccountsScreen');
          }}>
          <View>
            <SubWalletAvatar address={currentAccount?.address || ''} size={48} />
          </View>
        </TouchableOpacity>
        <Text style={styles.accountName} numberOfLines={1}>
          {currentAccount ? currentAccount.name : ''}
        </Text>
        <Text style={styles.accountAddress}>{`(${toShort(currentAccount?.address || '', 4, 4)})`}</Text>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.actionButtonStyle}>
          <SlidersHorizontal size={20} color={'#FFF'} weight={'bold'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonStyle}>
          <MagnifyingGlass size={20} color={'#FFF'} weight={'bold'} />
        </TouchableOpacity>
      </View>
      {/*<View style={{ flex: 1, marginLeft: -8 }}>*/}
      {/*  <TouchableWithoutFeedback*/}
      {/*    onPress={() => {*/}
      {/*      navigationRef.navigate('Home');*/}
      {/*    }}>*/}
      {/*    {*/}
      {/*      // @ts-ignore*/}
      {/*      <Logo.SubWallet width={48} height={48} />*/}
      {/*    }*/}
      {/*  </TouchableWithoutFeedback>*/}
      {/*</View>*/}
      {/*<Button style={{ marginRight: 16 }} title="Reload Background" onPress={reloadBackground} color={'secondary'} />*/}
    </View>
  );
};
