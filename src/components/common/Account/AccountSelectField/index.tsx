import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AccountSelectFieldStyles from './style';
import { CaretDown } from 'phosphor-react-native';
import { DisabledStyle } from 'styles/sharedStyles';
import { AccountProxyAvatarGroup } from 'components/design-system-ui/avatar/account-proxy-avatar-group';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

const AccountSelectField = ({ disabled, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = AccountSelectFieldStyles(theme);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const isAll = useMemo((): boolean => isAccountAll(currentAccountProxy?.id), [currentAccountProxy?.id]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} disabled={disabled} style={disabled && DisabledStyle}>
      <View style={_style.container}>
        {isAll ? <AccountProxyAvatarGroup /> : <AccountProxyAvatar size={20} value={currentAccountProxy?.id} />}
        <Typography.Text style={_style.accountNameStyle} ellipsis={true}>
          {isAll ? 'All accounts' : currentAccountProxy?.name}
        </Typography.Text>
        <Icon phosphorIcon={CaretDown} size={'xxs'} />
      </View>
    </TouchableOpacity>
  );
};

export default AccountSelectField;
