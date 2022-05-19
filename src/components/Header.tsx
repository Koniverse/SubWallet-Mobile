import React, { ReactElement, useContext } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSVG } from 'hooks/useSVG';
import { RootStackParamList } from 'types/routes';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { WebViewContext } from 'providers/contexts';
import { useToast } from 'react-native-toast-notifications';
import { Button } from 'components/Button';
import { Avatar } from 'components/Avatar';
import { SpaceStyle } from 'styles/space';

interface HeaderProps {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
}

export const Header = ({ navigationRef }: HeaderProps): ReactElement<HeaderProps> => {
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

  return (
    <View
      style={[
        SpaceStyle.oneContainer,
        {
          backgroundColor: swThemeColor.background,
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 8,
          paddingBottom: 8,
        },
      ]}>
      <View style={{ flex: 1, marginLeft: -8 }}>
        <TouchableWithoutFeedback
          onPress={() => {
            navigationRef.navigate('Home');
          }}>
          {
            // @ts-ignore
            <Logo.SubWallet width={48} height={48} />
          }
        </TouchableWithoutFeedback>
      </View>
      <Button style={{ marginRight: 16 }} title="Reload Background" onPress={reloadBackground} color={'secondary'} />
      <TouchableWithoutFeedback
        onPress={() => {
          navigationRef.navigate('AccountList');
        }}>
        <View>
          <Avatar address={currentAccount?.address || ''} size={48} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
