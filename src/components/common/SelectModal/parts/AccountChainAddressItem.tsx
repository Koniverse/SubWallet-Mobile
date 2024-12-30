import React from 'react';
import { AccountChainAddress } from 'types/account';
import { VoidFunction } from 'types/index';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Logo, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { Copy, QrCode } from 'phosphor-react-native';

interface Props {
  item: AccountChainAddress;
  onPress?: VoidFunction;
  onPressCopyButton?: VoidFunction;
  onPressQrButton?: VoidFunction;
}

export const AccountChainAddressItem = ({ item, onPress, onPressCopyButton, onPressQrButton }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Logo network={item.slug} shape={'circle'} size={28} />

      <View style={styles.centerPart}>
        <Typography.Text ellipsis style={styles.chainName}>
          {item.name}
        </Typography.Text>
        <Typography.Text style={styles.address}>{toShort(item.address, 4, 5)}</Typography.Text>
      </View>

      <View style={styles.rightPart}>
        <Button
          type={'ghost'}
          size={'xs'}
          icon={<Icon phosphorIcon={QrCode} size={'sm'} iconColor={theme['gray-5']} />}
          onPress={onPressQrButton}
        />
        <Button
          type={'ghost'}
          size={'xs'}
          icon={<Icon phosphorIcon={Copy} size={'sm'} iconColor={theme['gray-5']} />}
          onPress={onPressCopyButton}
        />
      </View>
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colorBgSecondary,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingXXS,
      paddingVertical: theme.paddingXS - 2,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: theme.marginXS,
    },
    centerPart: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
      marginLeft: 10,
      paddingRight: theme.paddingXS,
    },
    chainName: {
      flexShrink: 1,
      color: theme.colorWhite,
    },
    address: {
      fontSize: 12,
      color: theme.colorTextLight4, // Replace with theme tokens
    },
    rightPart: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}
