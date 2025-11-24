import { isAccountAll } from '@subwallet/extension-base/utils';
import createStyle from './styles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import AccountItemBase, { AccountItemBaseProps } from '../AccountItemBase';
import { AccountJson } from '@subwallet/extension-base/types';
import { AccountProxyAvatarGroup } from 'components/design-system-ui/avatar/account-proxy-avatar-group';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { getBitcoinKeypairAttributes } from 'utils/account/account';
import { Typography } from 'components/design-system-ui';
import { FontBold } from 'styles/sharedStyles';

interface Props extends AccountItemBaseProps {
  direction?: 'vertical' | 'horizontal';
  accounts?: AccountJson[];
  fallbackName?: boolean;
  showAddress?: boolean;
  customNameStyle?: StyleProp<ViewStyle>;
}

const AccountItemWithName: React.FC<Props> = (props: Props) => {
  const {
    accountName,
    address,
    addressPreLength = 9,
    addressSufLength = 10,
    direction = 'horizontal',
    fallbackName = true,
    showAddress = true,
    customNameStyle,
  } = props;
  const isAll = isAccountAll(address);

  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  const bitcoinAttributes = useMemo(() => {
    if (isBitcoinAddress(address)) {
      const keyPairType = getKeypairTypeByAddress(address);

      return getBitcoinKeypairAttributes(keyPairType);
    }

    return undefined;
  }, [address]);

  const showFallback = useMemo(() => {
    if (isAll) {
      return false;
    } else {
      if (fallbackName) {
        return true;
      } else {
        return !!accountName;
      }
    }
  }, [accountName, fallbackName, isAll]);

  return (
    <AccountItemBase
      {...props}
      address={address}
      leftItem={isAll ? <AccountProxyAvatarGroup /> : props.leftItem}
      middleItem={
        <View style={{ paddingTop: theme.paddingSM - 2, paddingBottom: theme.paddingSM - 2 }}>
          <View
            style={[direction === 'horizontal' ? styles.contentDirectionHorizontal : styles.contentDirectionVertical]}>
            <Typography.Text style={[styles.accountName, customNameStyle]} ellipsis>
              {isAll ? i18n.common.allAccounts : accountName || toShort(address, addressPreLength, addressSufLength)}
            </Typography.Text>
            {!!bitcoinAttributes && !!bitcoinAttributes.schema ? (
              <Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: theme.fontSizeXS,
                    lineHeight: theme.fontSizeXS * theme.lineHeightXS,
                    color: theme.colorTextTertiary,
                    paddingHorizontal: theme.paddingXXS,
                    ...FontBold,
                  }}>
                  {'  -  '}
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: theme.fontSizeXS,
                    lineHeight: theme.fontSizeXS * theme.lineHeightXS,
                    color: theme[bitcoinAttributes.schema],
                    ...FontBold,
                  }}>
                  {bitcoinAttributes.label}
                </Typography.Text>
              </Typography.Text>
            ) : null}
          </View>
          {showFallback && address && showAddress && (
            <View>
              <Text style={[styles.accountAddress, direction === 'horizontal' && styles.accountAddressHorizontal]}>
                {toShort(address, addressPreLength, addressSufLength)}
              </Text>
            </View>
          )}
        </View>
      }
    />
  );
};

export default AccountItemWithName;
