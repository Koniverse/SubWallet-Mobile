import { Icon, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import Web3Block, { Web3BlockCustomStyle, Web3BlockProps } from '../Web3Block';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import createStyle from './styles';
import { CheckCircle } from 'phosphor-react-native';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { getBitcoinKeypairAttributes } from 'utils/account/account';

interface CustomStyle extends Web3BlockCustomStyle {
  address?: StyleProp<TextStyle>;
}

export interface AccountItemProps extends Omit<Web3BlockProps, 'customStyle'> {
  address: string;
  avatarValue?: string;
  avatarSize?: number;
  addressPreLength?: number;
  addressSufLength?: number;
  isSelected?: boolean;
  customStyle?: CustomStyle;
}

const AccountItem: React.FC<AccountItemProps> = (props: AccountItemProps) => {
  const {
    leftItem,
    rightItem,
    middleItem,
    address,
    avatarValue,
    avatarSize = 24,
    addressPreLength,
    addressSufLength,
    isSelected,
    customStyle,
    ...restProps
  } = props;
  const { address: addressStyle, container: containerStyle, ...restStyle } = customStyle || {};
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  const bitcoinAttributes = useMemo(() => {
    if (isBitcoinAddress(address)) {
      const keyPairType = getKeypairTypeByAddress(address);

      return getBitcoinKeypairAttributes(keyPairType);
    }

    return undefined;
  }, [address]);

  return (
    <Web3Block
      {...restProps}
      customStyle={{
        container: [styles.container, isSelected && styles.containerSelected, containerStyle],
        ...restStyle,
      }}
      leftItem={leftItem || <AccountProxyAvatar value={avatarValue || address} size={avatarSize} />}
      middleItem={
        middleItem || (
          <View>
            <Typography.Text style={[addressStyle]}>
              {toShort(address || '', addressPreLength, addressSufLength)}
            </Typography.Text>

            {!!bitcoinAttributes && !!bitcoinAttributes.schema ? (
              <Typography.Text>{bitcoinAttributes.label}</Typography.Text> //todo: add styles
            ) : null}
          </View>
        )
      }
      rightItem={
        rightItem || (
          <>
            {isSelected && <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />}
          </>
        )
      }
    />
  );
};

export default AccountItem;
