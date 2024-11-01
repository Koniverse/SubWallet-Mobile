import React from 'react';
import { TonWalletContractVersion } from '@subwallet/keyring/types';
import { VoidFunction } from 'types/index';
import Web3Block from '../../design-system-ui/web3-block/Web3Block';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { CheckCircle } from 'phosphor-react-native';
import { StyleSheet } from 'react-native';
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

export const TonWalletContractItem = ({ version, address, isSelected, chainSlug }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyleSheet(theme);
  return (
    <Web3Block
      customStyle={{
        container: [styles.container, isSelected && styles.containerSelected],
      }}
      leftItem={<Logo network={chainSlug} shape={'circle'} size={28} />}
      middleItem={
        <>
          <Typography.Text>{version}</Typography.Text>
          <Typography.Text>{toShort(address, 4, 5)}</Typography.Text>
        </>
      }
      rightItem={
        <>
          {isSelected && <Icon phosphorIcon={CheckCircle} size="sm" iconColor={theme.colorSecondary} weight="fill" />}
        </>
      }
    />
  );
};

const createStyleSheet = (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    containerSelected: {
      backgroundColor: theme.colorBgInput,
    },
    address: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.lineHeightLG,
      fontWeight: `${theme.fontWeightStrong}`,
      color: theme.colorTextLight1,
    },
  });
};
