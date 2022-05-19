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
      style={{
        backgroundColor: swThemeColor.background,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
      }}>
      <View style={{ flex: 1 }}>
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
      <Button title="Reload Background" onPress={reloadBackground} color={'secondary'} />
      <TouchableWithoutFeedback
        onPress={() => {
          navigationRef.navigate('AccountList');
        }}>
        <View style={{ padding: 4, paddingRight: 8 }}>
          <Avatar address={currentAccount?.address || ''} size={48} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
