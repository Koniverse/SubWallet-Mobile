import React, { useMemo } from 'react';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import { View } from 'react-native';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { AccountChainType, AccountProxyType } from '@subwallet/extension-base/types';
import {
  CheckCircle,
  Eye,
  GitCommit,
  Needle,
  QrCode,
  Question,
  Strategy,
  Swatches,
  Warning,
} from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountProxyTypeIcon } from 'components/common/SelectAccountItem';
import { FontSemiBold } from 'styles/sharedStyles';
import { VoidFunction } from 'types/index';
import { AccountProxyExtra_ } from 'screens/Account/RestoreJson';

interface Props {
  accountProxy: AccountProxyExtra_;
  isSelected: boolean;
  onPress: VoidFunction;
  disabled?: boolean;
}

export const ImportJsonAccountItem = (props: Props) => {
  const { accountProxy, isSelected, onPress, disabled } = props;
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

  const isDuplicated = useMemo(() => {
    return (accountProxy.isExistName || accountProxy.isNameDuplicated) && !accountProxy.isExistAccount;
  }, [accountProxy.isExistAccount, accountProxy.isExistName, accountProxy.isNameDuplicated]);

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

  const rightItems = useMemo(() => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.paddingLG - 4 }}>
        {isDuplicated && (
          <Icon
            iconColor={isDuplicated ? theme.colorWarning : theme.colorTextLight4}
            phosphorIcon={Warning}
            size="sm"
            type="phosphor"
            weight="fill"
          />
        )}

        <Icon
          iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
          phosphorIcon={CheckCircle}
          size="sm"
          type="phosphor"
          weight="fill"
        />
      </View>
    );
  }, [isDuplicated, isSelected, theme.colorSuccess, theme.colorTextLight4, theme.colorWarning, theme.paddingLG]);

  return (
    <AccountItemBase
      customStyle={{
        container: [{ marginBottom: theme.marginXS, height: 58 }, disabled && { opacity: theme.opacityDisable }],
      }}
      disabled={disabled}
      onPress={onPress}
      isSelected={isSelected}
      address={''}
      leftItem={leftItemNode}
      middleItem={middleItemNode}
      rightItem={rightItems}
    />
  );
};
