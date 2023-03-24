import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Avatar, Icon, Typography } from 'components/design-system-ui';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import AvatarGroup from '../AvatarGroup';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AccountSelectFieldStyles from './style';
import { CaretDown } from 'phosphor-react-native';

interface Props {
  onPress: () => void;
}

const AccountSelectField = ({ onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = AccountSelectFieldStyles(theme);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const isAll = useMemo((): boolean => !!currentAccount && isAccountAll(currentAccount.address), [currentAccount]);
  // TODO: reformat address when have new network info

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={_style.container}>
        {isAll ? (
          <AvatarGroup />
        ) : (
          <Avatar
            value={currentAccount?.address || ''}
            size={20}
            identPrefix={42}
            theme={currentAccount?.type === 'ethereum' ? 'ethereum' : 'polkadot'}
          />
        )}
        <Typography.Text style={_style.accountNameStyle} ellipsis={true}>
          {isAll ? 'All accounts' : currentAccount?.name}
        </Typography.Text>
        {!isAll && <Text style={_style.accountAddressStyle}>{`(...${currentAccount?.address.slice(-3)})`}</Text>}
        <Icon phosphorIcon={CaretDown} size={'xxs'} />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AccountSelectField;
