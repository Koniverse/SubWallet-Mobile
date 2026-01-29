import React, { useMemo, useState } from 'react';
import AccountItemBase from 'components/common/Account/Item/AccountItemBase';
import { Platform, StatusBar, View } from 'react-native';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { AccountProxyType } from '@subwallet/extension-base/types';
import Tooltip from 'react-native-walkthrough-tooltip';
import {
  CheckCircleIcon,
  EyeIcon,
  GitCommitIcon,
  NeedleIcon,
  QrCodeIcon,
  QuestionIcon,
  StrategyIcon,
  SwatchesIcon,
  WarningIcon,
} from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountProxyTypeIcon } from 'components/common/SelectAccountItem';
import { FontSemiBold } from 'styles/sharedStyles';
import { VoidFunction } from 'types/index';
import { AccountProxyExtra_ } from 'screens/Account/RestoreJson';
import { AccountChainTypeLogos } from 'components/AccountProxy/AccountChainTypeLogos';

interface Props {
  accountProxy: AccountProxyExtra_;
  isSelected: boolean;
  onPress: VoidFunction;
  disabled?: boolean;
}

export const ImportJsonAccountItem = (props: Props) => {
  const { accountProxy, isSelected, onPress, disabled } = props;
  const theme = useSubWalletTheme().swThemes;
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const accountProxyTypeIconProps = ((): AccountProxyTypeIcon | null => {
    if (accountProxy.accountType === AccountProxyType.UNIFIED) {
      return {
        value: StrategyIcon,
        iconColor: theme.colorSuccess,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.SOLO) {
      return {
        value: GitCommitIcon,
        iconColor: theme['blue-9'],
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.QR) {
      return {
        value: QrCodeIcon,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.READ_ONLY) {
      return {
        value: EyeIcon,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.LEDGER) {
      return {
        value: SwatchesIcon,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.INJECTED) {
      return {
        value: NeedleIcon,
        iconColor: theme.colorWhite,
        weight: 'fill',
      };
    }

    if (accountProxy.accountType === AccountProxyType.UNKNOWN) {
      return {
        value: QuestionIcon,
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

        <AccountChainTypeLogos chainTypes={accountProxy.chainTypes} />
      </View>
    ),
    [accountProxy.chainTypes, accountProxy.name, theme.colorWhite, theme.paddingXS],
  );

  const rightItems = useMemo(() => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeSM }}>
        {isDuplicated && (
          <Tooltip
            isVisible={tooltipVisible}
            disableShadow={true}
            placement={'bottom'}
            showChildInTooltip={false}
            topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
            contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
            closeOnBackgroundInteraction={true}
            onClose={() => setTooltipVisible(false)}
            content={
              <Typography.Text size={'sm'} style={{ color: theme.colorWhite, textAlign: 'center' }}>
                {'Duplicate account name'}
              </Typography.Text>
            }>
            <Button
              icon={
                <Icon
                  iconColor={isDuplicated ? theme.colorWarning : theme.colorTextLight4}
                  phosphorIcon={WarningIcon}
                  size="sm"
                  type="phosphor"
                  weight="fill"
                />
              }
              onPress={() => setTooltipVisible(true)}
              type={'ghost'}
              size={'xs'}
            />
          </Tooltip>
        )}

        <Icon
          iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
          phosphorIcon={CheckCircleIcon}
          size="sm"
          type="phosphor"
          weight="fill"
        />
      </View>
    );
  }, [
    isDuplicated,
    isSelected,
    theme.borderRadiusLG,
    theme.colorBgSpotlight,
    theme.colorSuccess,
    theme.colorTextLight4,
    theme.colorWarning,
    theme.colorWhite,
    theme.sizeSM,
    tooltipVisible,
  ]);

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
