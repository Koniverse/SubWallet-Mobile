import React from 'react';
import { ActivityIndicator, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { CaretDown } from 'phosphor-react-native';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/AccountSettingButton';
import { AccountProxyAvatarGroup } from 'components/design-system-ui/avatar/account-proxy-avatar-group';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  style?: StyleProp<ViewStyle>;
}

export const AccountSettingButton = ({ navigation, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const { currentAccount, isReady, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const currentAccountAddress = currentAccount?.address || '';

  return (
    <TouchableOpacity
      style={[stylesheet.container, style]}
      onPress={() => {
        navigation.navigate('AccountsScreen', {});
      }}>
      {isAllAccount && <AccountProxyAvatarGroup />}
      {!isAllAccount && <AccountProxyAvatar value={currentAccountAddress} size={20} />}
      {!isReady && (
        <View style={stylesheet.placeholder}>
          <ActivityIndicator size={16} />
        </View>
      )}

      <Icon phosphorIcon={CaretDown} weight={'bold'} iconColor={theme['gray-5']} size={'xxs'} />
    </TouchableOpacity>
  );
};
