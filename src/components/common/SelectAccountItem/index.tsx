import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import {
  CheckCircle,
  Copy,
  Eye,
  GitCommit,
  GitMerge,
  IconProps,
  Needle,
  PencilSimpleLine,
  QrCode,
  Question,
  Strategy,
  Swatches,
} from 'phosphor-react-native';
import { AccountProxy, AccountProxyType } from '@subwallet/extension-base/types';
import { PhosphorIcon } from 'utils/campaign';
import { IconWeight } from 'phosphor-react-native/lib/typescript';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { AccountChainTypeLogos } from 'components/AccountProxy/AccountChainTypeLogos';
import { ThemeTypes } from 'styles/themes';

export type AccountProxyTypeIcon = {
  value: PhosphorIcon;
  iconColor: string;
  weight?: IconWeight;
};

interface Props {
  accountProxy: AccountProxy;
  isSelected?: boolean;
  isAllAccount?: boolean;
  onPressDetailBtn?: () => void;
  onPressCopyBtn?: () => void;
  onSelectAccount?: () => void;
  isShowEditBtn?: boolean;
  isShowCopyBtn?: boolean;
  isShowMultiCheck?: boolean;
  isUseCustomAccountSign?: boolean;
  customAccountSignMode?: React.ElementType<IconProps>;
  showDerivedPath?: boolean;
  showBottomPath?: boolean;
  avatarSize?: number;
  wrapperStyle?: ViewStyle;
  isShowTypeIcon?: boolean;
}

export const SelectAccountItem = ({
  accountProxy,
  isSelected,
  isAllAccount,
  onPressDetailBtn,
  onPressCopyBtn,
  onSelectAccount,
  isShowEditBtn = true,
  isShowCopyBtn = true,
  isShowMultiCheck = false,
  showBottomPath = true,
  isUseCustomAccountSign,
  customAccountSignMode,
  showDerivedPath,
  avatarSize,
  wrapperStyle,
  isShowTypeIcon = true,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);

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

  const _onPressCopyButton = () => {
    onPressCopyBtn?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.wrapperStyle, wrapperStyle]}
      onPress={() => onSelectAccount && onSelectAccount()}>
      <View style={styles.leftArea}>
        <View style={{ position: 'relative' }}>
          <AccountProxyAvatar size={avatarSize || 32} value={accountProxy.id} />
          {!!accountProxyTypeIconProps && isShowTypeIcon && (
            <View style={styles.accountProxyTypeIcon}>
              <Icon
                phosphorIcon={accountProxyTypeIconProps.value}
                size={'xxs'}
                weight={accountProxyTypeIconProps.weight}
                iconColor={accountProxyTypeIconProps.iconColor}
              />
            </View>
          )}
        </View>

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

          {showBottomPath && (
            <View style={{ height: 20, alignItems: 'center', flexDirection: 'row' }}>
              {showDerivedPath && !!accountProxy.parentId ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon phosphorIcon={GitMerge} weight={'fill'} size={'xxs'} iconColor={theme.colorTextLight4} />
                  <Typography.Text
                    size={'sm'}
                    style={{ color: theme.colorTextTertiary, marginTop: -(theme.marginXXS - 2) }}>
                    {accountProxy.suri || ''}
                  </Typography.Text>
                  <View style={{ paddingLeft: theme.sizeXXS }}>
                    <AccountChainTypeLogos chainTypes={accountProxy.chainTypes} />
                  </View>
                </View>
              ) : (
                <AccountChainTypeLogos chainTypes={accountProxy.chainTypes} />
              )}
            </View>
          )}
        </View>
      </View>
      <View style={styles.rightArea}>
        {!isShowMultiCheck && isSelected && (
          <View style={{ paddingHorizontal: theme.paddingSM - 2 }}>
            <Icon phosphorIcon={CheckCircle} iconColor={theme.colorSuccess} size={'sm'} weight={'fill'} />
          </View>
        )}

        {isUseCustomAccountSign && (
          <View style={{ paddingHorizontal: theme.paddingSM - 2 }}>
            <Icon phosphorIcon={customAccountSignMode} size={'sm'} iconColor={theme['gray-5']} />
          </View>
        )}

        {!isAllAccount && isShowCopyBtn && (
          <Button
            icon={<Icon phosphorIcon={Copy} size="sm" iconColor={theme['gray-5']} />}
            onPress={_onPressCopyButton}
            size="xs"
            type="ghost"
          />
        )}
        {!isAllAccount && isShowEditBtn && (
          <Button
            type={'ghost'}
            size={'xs'}
            icon={<Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={theme['gray-5']} />}
            onPress={onPressDetailBtn}
          />
        )}

        {isShowMultiCheck && (
          <View style={{ paddingHorizontal: theme.paddingSM }}>
            <Icon
              phosphorIcon={CheckCircle}
              iconColor={isSelected ? theme.colorSuccess : theme['gray-5']}
              size={'sm'}
              weight={'fill'}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    wrapperStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      paddingVertical: theme.paddingXS - 1,
      paddingLeft: 12,
      paddingRight: 4,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      flex: 1,
      marginBottom: theme.marginXS,
    },
    leftArea: { flexDirection: 'row', alignItems: 'center', flex: 2 },
    rightArea: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    accountProxyTypeIcon: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: theme.size,
      height: theme.size,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadiusLG,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
  });
}
