import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CheckCircleIcon } from 'phosphor-react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { WrappedTransactionSigner } from 'types/wrappedTransaction';
import { getReformatedAddressRelatedToChain } from 'utils/account/account';
import { toShort } from 'utils/index';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  signerItem: WrappedTransactionSigner;
  chainSlug: string;
  isSelected?: boolean;
  showUnselectIcon?: boolean;
  showCheckedIcon?: boolean;
  onPress?: VoidFunction;
}

export const WrappedTransactionSignerSelectorItem = ({
  chainSlug,
  isSelected,
  onPress,
  showCheckedIcon = true,
  showUnselectIcon,
  signerItem,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const accountInfo = useGetAccountByAddress(signerItem.address);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const displayAddress = useMemo(() => {
    const chainInfo = chainInfoMap[chainSlug];

    if (!accountInfo || !chainInfo) {
      return signerItem.address;
    }

    return getReformatedAddressRelatedToChain(accountInfo, chainInfo) || signerItem.address;
  }, [accountInfo, chainInfoMap, chainSlug, signerItem.address]);

  // Describes *why* this account may sign: a multisig signatory, the proxied account
  // itself, or a proxy delegate of a given proxy type.
  const signerTypeLabel = useMemo<string>(() => {
    if (signerItem.kind === 'signatory') {
      return i18n.multisig.signatory;
    }

    if (signerItem.isProxiedAccount) {
      return i18n.multisig.proxiedAccount;
    }

    if (signerItem.substrateProxyType) {
      return `${i18n.multisig.proxyType}: ${signerItem.substrateProxyType}`;
    }

    return '';
  }, [signerItem]);

  const checkedIconNode = (showUnselectIcon || isSelected) && (
    <Icon
      phosphorIcon={CheckCircleIcon}
      size={'sm'}
      weight={'fill'}
      iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
    />
  );

  // The label is colour-coded by signer kind: signatory (geekblue), the proxied
  // account itself (green), a proxy delegate (magenta).
  const signerTypeStyle = useMemo(() => {
    if (signerItem.kind === 'signatory') {
      return styles.signerTypeSignatory;
    }

    if (signerItem.isProxiedAccount) {
      return styles.signerTypeMain;
    }

    return styles.signerTypeProxy;
  }, [signerItem, styles]);

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={showCheckedIcon ? onPress : undefined}>
      <AccountProxyAvatar size={32} value={signerItem.proxyId || signerItem.address} />

      <View style={styles.middlePart}>
        <View style={styles.identityRow}>
          <Typography.Text ellipsis style={[styles.name, !!accountInfo?.name && styles.nameHasAddress]}>
            {accountInfo?.name || toShort(displayAddress, 9, 9)}
          </Typography.Text>
          {!!accountInfo?.name && (
            <Typography.Text style={styles.address}>{`(${toShort(displayAddress, 4, 5)})`}</Typography.Text>
          )}
        </View>
        {!!signerTypeLabel && (
          <Typography.Text size={'sm'} style={signerTypeStyle}>
            {signerTypeLabel}
          </Typography.Text>
        )}
      </View>

      <View style={styles.rightPart}>{showCheckedIcon && checkedIconNode}</View>
    </TouchableOpacity>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeSM,
      padding: theme.paddingSM,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
    },
    middlePart: {
      flex: 1,
      gap: 2,
    },
    identityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    name: {
      ...FontSemiBold,
      color: theme.colorTextLight4,
      flexShrink: 1,
    },
    nameHasAddress: {
      color: theme.colorTextLight1,
    },
    address: {
      ...FontSemiBold,
      color: theme.colorTextLight4,
    },
    signerTypeProxy: {
      ...FontMedium,
      color: '#D92079',
    },
    signerTypeMain: {
      ...FontMedium,
      color: '#86C338',
    },
    signerTypeSignatory: {
      ...FontMedium,
      color: theme['geekblue-9'],
    },
    rightPart: {
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -theme.marginXS,
    },
  });
}

export default WrappedTransactionSignerSelectorItem;
