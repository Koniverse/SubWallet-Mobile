import React, { useMemo } from 'react';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import { View } from 'react-native';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { AccountChainType, AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { Eye, GitCommit, Needle, QrCode, Question, Strategy, Swatches } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountProxyTypeIcon } from 'components/common/SelectAccountItem';
import { FontSemiBold } from 'styles/sharedStyles';
import { VoidFunction } from 'types/index';

interface Props {
  accountProxy: AccountProxy;
  isSelected: boolean;
  onPress: VoidFunction;
}

export const ImportJsonAccountItem = (props: Props) => {
  const { accountProxy, isSelected, onPress } = props;
  const theme = useSubWalletTheme().swThemes;
  const chainTypeLogoMap = useMemo(() => {
    return {
      [AccountChainType.SUBSTRATE]: 'polkadot',
      [AccountChainType.ETHEREUM]: 'ethereum',
      [AccountChainType.BITCOIN]: 'bitcoin',
      [AccountChainType.TON]: 'ton',
    };
  }, []);

  const accountProxyTypeIconProps = ((): AccountProxyTypeIcon | null => {
    if (accountProxy.accountType === AccountProxyType.UNIFIED) {
      return {
        value: Strategy,
        iconColor: theme.colorSuccess,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.SOLO) {
      return {
        value: GitCommit,
        iconColor: theme['blue-9'],
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.QR) {
      return {
        value: QrCode,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.READ_ONLY) {
      return {
        value: Eye,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.LEDGER) {
      return {
        value: Swatches,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.INJECTED) {
      return {
        value: Needle,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.UNKNOWN) {
      return {
        value: Question,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    return null;
  })();

  const leftItemNode = useMemo(
    () => (
      <View style={{ position: 'relative' }}>
        <AccountProxyAvatar size={32} value={accountProxy.id} />
        {!!accountProxyTypeIconProps && (
          <View
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: theme.size,
              height: theme.size,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: theme.borderRadiusLG,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
            }}>
            <Icon
              phosphorIcon={accountProxyTypeIconProps.value}
              size={'xxs'}
              weight={accountProxyTypeIconProps.weight}
              iconColor={accountProxyTypeIconProps.iconColor}
            />
          </View>
        )}
      </View>
    ),
    [accountProxy.id, accountProxyTypeIconProps, theme.borderRadiusLG, theme.size],
  );

  const middleItemNode = useMemo(
    () => (
      <View style={{ paddingLeft: theme.paddingXS, justifyContent: 'center', flex: 1, gap: 2 }}>
        <Typography.Text
          style={{
            ...FontSemiBold,
            maxWidth: 200,
            color: theme.colorWhite,
            paddingRight: theme.paddingXS,
          }}
          ellipsis>
          {accountProxy.name}
        </Typography.Text>

        <View style={{ height: 20, alignItems: 'center', flexDirection: 'row' }}>
          {accountProxy.chainTypes.map((nt, index) => (
            <View style={index !== 0 && { marginLeft: -4 }}>
              <Logo network={chainTypeLogoMap[nt]} size={16} shape={'circle'} />
            </View>
          ))}
        </View>
      </View>
    ),
    [accountProxy.chainTypes, accountProxy.name, chainTypeLogoMap, theme.colorWhite, theme.paddingXS],
  );

  return (
    <AccountItemBase
      customStyle={{ container: { marginBottom: theme.marginXS, height: 58 } }}
      onPress={onPress}
      isSelected={isSelected}
      address={''}
      leftItem={leftItemNode}
      middleItem={middleItemNode}
    />
  );
};
