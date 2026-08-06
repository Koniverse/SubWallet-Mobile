import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { CheckCircleIcon } from 'phosphor-react-native';
import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { Icon, Typography } from 'components/design-system-ui';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';

export interface SubstrateProxyAccountItemExtended extends SubstrateProxyAccountItem {
  /** True for the proxied account itself rather than one of its delegates. */
  isMain?: boolean;
}

interface Props {
  substrateProxyAccount: SubstrateProxyAccountItemExtended;
  isSelected?: boolean;
  showUnselectIcon?: boolean;
  showCheckedIcon?: boolean;
  onPress?: VoidFunction;
}

export const SubstrateProxyAccountSelectorItem = ({
  isSelected,
  onPress,
  showCheckedIcon = true,
  showUnselectIcon,
  substrateProxyAccount,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const accountProxy = useGetAccountProxyById(substrateProxyAccount.proxyId);

  const onCopyAddress = useCallback(() => {
    Clipboard.setString(substrateProxyAccount.substrateProxyAddress);
    toast.show(i18n.substrateProxy.copiedToClipboard, { type: 'success' });
  }, [substrateProxyAccount.substrateProxyAddress, toast]);

  const checkedIconNode = (showUnselectIcon || isSelected) && (
    <Icon
      phosphorIcon={CheckCircleIcon}
      size={'sm'}
      weight={'fill'}
      iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
    />
  );

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={showCheckedIcon ? onPress : undefined}>
      <TouchableOpacity activeOpacity={1} onPress={onCopyAddress}>
        <AccountProxyAvatar
          size={32}
          value={substrateProxyAccount.proxyId || substrateProxyAccount.substrateProxyAddress}
        />
      </TouchableOpacity>

      <View style={styles.middlePart}>
        <View style={styles.identityRow}>
          <Typography.Text ellipsis style={[styles.name, !!accountProxy?.name && styles.nameHasAddress]}>
            {accountProxy?.name || toShort(substrateProxyAccount.substrateProxyAddress, 9, 9)}
          </Typography.Text>
          {!!accountProxy?.name && (
            <Typography.Text style={styles.address}>
              {`(${toShort(substrateProxyAccount.substrateProxyAddress, 4, 5)})`}
            </Typography.Text>
          )}
        </View>
        <Typography.Text
          size={'sm'}
          style={[styles.proxyType, substrateProxyAccount.isMain && styles.proxyTypeMain]}>
          {substrateProxyAccount.isMain
            ? i18n.substrateProxy.proxiedAccount
            : `${i18n.substrateProxy.proxyType}: ${substrateProxyAccount.substrateProxyType}`}
        </Typography.Text>
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
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingSM,
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
    proxyType: {
      ...FontMedium,
      color: '#D92079',
    },
    proxyTypeMain: {
      color: '#86C338',
    },
    rightPart: {
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -theme.marginXS,
    },
  });
}

export default SubstrateProxyAccountSelectorItem;
