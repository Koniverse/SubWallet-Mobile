import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { Typography } from 'components/design-system-ui';
import { AccountChainTypeLogos } from 'components/AccountProxy/AccountChainTypeLogos';
import { SUPPORTED_ACCOUNT_CHAIN_TYPES } from '@subwallet/extension-base/types';
import { FontSemiBold } from 'styles/sharedStyles';

export type ResultAccountProxyItemType = {
  accountName: string;
  accountProxyId: string;
};

interface Props {
  accountName: string;
  accountProxyId: string;
}

const ResultAccountProxyItem: React.FC<Props> = ({ accountName, accountProxyId }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <View style={styles.container}>
      <AccountProxyAvatar size={24} value={accountProxyId} />

      <Typography.Text ellipsis={true} numberOfLines={1} style={{ color: theme.colorWhite, flex: 1, ...FontSemiBold }}>
        {accountName}
      </Typography.Text>

      <AccountChainTypeLogos chainTypes={SUPPORTED_ACCOUNT_CHAIN_TYPES} />
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
      alignItems: 'center',
      gap: theme.sizeSM,
    },
  });
}

export default ResultAccountProxyItem;
