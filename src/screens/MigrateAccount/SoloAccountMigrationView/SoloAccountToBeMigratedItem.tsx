import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { Logo, Typography } from 'components/design-system-ui';
import { SoloAccountToBeMigrated } from '@subwallet/extension-base/background/KoniTypes';
import { getChainTypeLogoMap } from 'utils/account/account';
import { toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

type Props = SoloAccountToBeMigrated;

export const SoloAccountToBeMigratedItem = ({ address, chainType, name, proxyId }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const chainTypeLogoMap = useMemo(() => {
    return getChainTypeLogoMap();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <AccountProxyAvatar size={28} value={proxyId} />
        <View style={styles.subLogoWrapper}>
          <Logo size={16} network={chainTypeLogoMap[chainType]} />
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <Typography.Text style={styles.accountText}>{name}</Typography.Text>
        <Typography.Text size={'sm'} style={styles.addressText}>
          {toShort(address, 4, 5)}
        </Typography.Text>
      </View>
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingSM,
      flexDirection: 'row',
      gap: theme.sizeXXS + 2,
    },
    avatarWrapper: { position: 'relative' },
    subLogoWrapper: { position: 'absolute', right: 0, bottom: 0 },
    contentWrapper: { flexDirection: 'row', gap: theme.sizeXXS, alignItems: 'center' },
    accountText: { color: theme.colorWhite, ...FontSemiBold },
    addressText: { color: theme.colorTextTertiary },
  });
}
