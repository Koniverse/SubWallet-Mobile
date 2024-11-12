import React from 'react';
import { TonWalletContractVersion } from '@subwallet/keyring/types';
import { VoidFunction } from 'types/index';
import Web3Block from '../../design-system-ui/web3-block/Web3Block';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { CheckCircle } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export type TonWalletContractItemType = {
  version: TonWalletContractVersion;
  address: string;
  isSelected: boolean;
  chainSlug: string;
};

interface Props extends TonWalletContractItemType {
  onPress?: VoidFunction;
}

export const TonWalletContractItem = ({ version, address, isSelected, chainSlug, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyleSheet(theme);
  return (
    <Web3Block
      customStyle={{
        container: styles.container,
        right: { paddingLeft: 14, paddingRight: 10 },
      }}
      leftItem={<Logo network={chainSlug} shape={'circle'} size={28} />}
      middleItem={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
          <Typography.Text style={styles.version}>{version}</Typography.Text>
          <Typography.Text style={styles.address}>{toShort(address, 4, 5)}</Typography.Text>
        </View>
      }
      rightItem={
        <>
          {isSelected && <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />}
        </>
      }
      onPress={onPress}
    />
  );
};

const createStyleSheet = (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    version: {
      color: theme.colorWhite,
    },
    address: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      fontWeight: `${theme.fontWeightStrong}`,
      color: theme.colorTextTertiary,
    },
  });
};
