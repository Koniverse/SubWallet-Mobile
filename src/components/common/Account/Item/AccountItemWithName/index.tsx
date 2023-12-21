import { isAccountAll } from '@subwallet/extension-base/utils';
import createStyle from './styles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import AccountItemBase, { AccountItemBaseProps } from '../AccountItemBase';
import { AccountJson } from '@subwallet/extension-base/background/types';
import AvatarGroup from 'components/common/AvatarGroup';

interface Props extends AccountItemBaseProps {
  direction?: 'vertical' | 'horizontal';
  accounts?: AccountJson[];
}

const AccountItemWithName: React.FC<Props> = (props: Props) => {
  const {
    avatarSize,
    accountName,
    address,
    addressPreLength = 4,
    addressSufLength = 4,
    direction = 'horizontal',
  } = props;
  const isAll = isAccountAll(address);

  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <AccountItemBase
      {...props}
      address={address}
      leftItem={isAll ? <AvatarGroup avatarSize={avatarSize} /> : props.leftItem}
      middleItem={
        <View
          style={[direction === 'horizontal' ? styles.contentDirectionHorizontal : styles.contentDirectionVertical]}>
          <Text style={styles.accountName} numberOfLines={1}>
            {isAll ? i18n.common.allAccounts : accountName || toShort(address, addressPreLength, addressSufLength)}
          </Text>
          {!isAll && (
            <Text style={[styles.accountAddress, direction === 'horizontal' && styles.accountAddressHorizontal]}>
              {direction === 'horizontal' && '('}
              {toShort(address, addressPreLength, addressSufLength)}
              {direction === 'horizontal' && ')'}
            </Text>
          )}
        </View>
      }
    />
  );
};

export default AccountItemWithName;
