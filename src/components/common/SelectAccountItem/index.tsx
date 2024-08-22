import React, { useMemo } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Avatar, Button, Icon, Typography } from 'components/design-system-ui';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { CheckCircle, Eye, IconProps, PencilSimpleLine, QrCode, Swatches } from 'phosphor-react-native';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';
import { AccountSignMode } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import AvatarGroup from 'components/common/AvatarGroup';
import useAccountAvatarInfo from 'hooks/account/useAccountAvatarInfo';
import { KeypairType } from '@polkadot/util-crypto/types';

interface Props {
  address: string;
  accountName?: string;
  isSelected?: boolean;
  isAllAccount?: boolean;
  onPressDetailBtn?: () => void;
  onSelectAccount?: (selectAccount: string) => void;
  isShowEditBtn?: boolean;
  isShowMultiCheck?: boolean;
  avatarGroupStyle?: ViewStyle;
  isUseCustomAccountSign?: boolean;
  customAccountSignMode?: React.ElementType<IconProps>;
  genesisHash?: string | null;
  preventPrefix?: boolean;
  type?: KeypairType;
}

export const SelectAccountItem = ({
  address,
  accountName,
  isSelected,
  isAllAccount,
  onPressDetailBtn,
  onSelectAccount,
  isShowEditBtn = true,
  isShowMultiCheck = false,
  avatarGroupStyle,
  isUseCustomAccountSign,
  customAccountSignMode,
  genesisHash,
  preventPrefix,
  type: givenType,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { address: formattedAddress, prefix } = useAccountAvatarInfo(
    address ?? '',
    preventPrefix,
    genesisHash,
    givenType,
  );

  const signMode = useGetAccountSignModeByAddress(address);
  const accountSignModeIcon = useMemo((): React.ElementType<IconProps> | undefined => {
    switch (signMode) {
      case AccountSignMode.LEGACY_LEDGER:
      case AccountSignMode.GENERIC_LEDGER:
        return Swatches;
      case AccountSignMode.QR:
        return QrCode;
      case AccountSignMode.READ_ONLY:
        return Eye;
    }

    return undefined;
  }, [signMode]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        paddingVertical: 14,
        paddingLeft: 12,
        paddingRight: 4,
        backgroundColor: theme.colorBgSecondary,
        borderRadius: theme.borderRadiusLG,
        flex: 1,
      }}
      onPress={() => onSelectAccount && onSelectAccount(address)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
        {isAllAccount ? (
          <AvatarGroup avatarGroupStyle={avatarGroupStyle} />
        ) : (
          <Avatar
            identPrefix={prefix}
            value={formattedAddress}
            size={40}
            theme={isEthereumAddress(address) ? 'ethereum' : 'polkadot'}
          />
        )}

        <View style={{ paddingLeft: theme.paddingXS, justifyContent: 'center', flex: 1 }}>
          <Typography.Text
            style={{
              fontSize: theme.fontSizeLG,
              lineHeight: theme.fontSizeLG * theme.lineHeightLG,
              ...FontSemiBold,
              maxWidth: 200,
              color: theme.colorWhite,
              paddingRight: theme.paddingXS,
            }}
            ellipsis>
            {isAllAccount ? i18n.common.allAccounts : accountName}
          </Typography.Text>

          {!isAllAccount && (
            <Typography.Text
              ellipsis
              style={{
                fontSize: theme.fontSizeSM,
                lineHeight: theme.fontSizeSM * theme.lineHeightSM,
                ...FontMedium,
                color: theme.colorTextTertiary,
                paddingRight: 16,
                flex: 1,
              }}>
              {toShort(formattedAddress, 9, 9)}
            </Typography.Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
        {!isShowMultiCheck && isSelected && (
          <View style={{ paddingHorizontal: theme.paddingSM - 2 }}>
            <Icon phosphorIcon={CheckCircle} iconColor={theme.colorSuccess} size={'sm'} weight={'fill'} />
          </View>
        )}

        {!isUseCustomAccountSign && accountSignModeIcon && (
          <View style={{ paddingHorizontal: theme.paddingSM - 2 }}>
            <Icon phosphorIcon={accountSignModeIcon} size={'sm'} iconColor={theme.colorTextTertiary} />
          </View>
        )}

        {isUseCustomAccountSign && (
          <View style={{ paddingHorizontal: theme.paddingSM - 2 }}>
            <Icon phosphorIcon={customAccountSignMode} size={'sm'} iconColor={theme.colorTextTertiary} />
          </View>
        )}

        {!isAllAccount && isShowEditBtn && (
          <Button
            type={'ghost'}
            size={'xs'}
            icon={<Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={theme.colorTextTertiary} />}
            onPress={onPressDetailBtn}
          />
        )}

        {isShowMultiCheck && (
          <View style={{ paddingHorizontal: theme.paddingSM }}>
            <Icon
              phosphorIcon={CheckCircle}
              iconColor={isSelected ? theme.colorSuccess : theme.colorTextLight4}
              size={'sm'}
              weight={'fill'}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
