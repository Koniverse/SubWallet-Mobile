import { Icon, Tag, Typography, Web3Block } from 'components/design-system-ui';
import { Switch, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { GearSix, Info } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { SET_CLAIM_PERMISSIONS } from 'constants/earning/EarningDataRaw';
import { FontSemiBold } from 'styles/sharedStyles';
import { PalletNominationPoolsClaimPermission } from '@subwallet/extension-base/types';

interface Props {
  value: PalletNominationPoolsClaimPermission;
  onValueChange: (value: boolean) => void;
  openManageAutoClaimModal: () => void;
  disabled?: boolean;
}

export const EarningAutoClaimItem = ({ value, onValueChange, openManageAutoClaimModal, disabled }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View style={{ backgroundColor: theme.colorBgSecondary, borderRadius: theme.borderRadiusLG }}>
      <Web3Block
        customStyle={{
          container: { paddingVertical: theme.sizeSM - 2 },
          right: { paddingRight: theme.paddingXS },
        }}
        leftItem={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
            <Typography.Text style={{ color: theme.colorWhite }}>{'Auto claim'}</Typography.Text>
            <Icon phosphorIcon={Info} weight={'fill'} iconColor={theme.colorWhite} size={'xs'} />
          </View>
        }
        middleItem={<></>}
        rightItem={
          <Switch
            ios_backgroundColor={ColorMap.switchInactiveButtonColor}
            value={value !== PalletNominationPoolsClaimPermission.PERMISSIONED}
            onValueChange={onValueChange}
            disabled={disabled}
          />
        }
      />
      {value !== PalletNominationPoolsClaimPermission.PERMISSIONED && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.sizeSM,
          }}>
          <Tag
            bgType={'default'}
            color={SET_CLAIM_PERMISSIONS[value].bgColor}
            icon={
              <Icon
                size={'xxs'}
                iconColor={SET_CLAIM_PERMISSIONS[value].iconColor}
                phosphorIcon={getBannerButtonIcon(SET_CLAIM_PERMISSIONS[value].icon) as PhosphorIcon}
                weight={'fill'}
              />
            }>
            {SET_CLAIM_PERMISSIONS[value].title}
          </Tag>
          <TouchableOpacity
            onPress={openManageAutoClaimModal}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.sizeXXS,
              height: 40,
              justifyContent: 'center',
            }}>
            <Icon weight={'bold'} size={'sm'} phosphorIcon={GearSix} iconColor={theme['gray-5']} />
            <Typography.Text style={{ color: theme.colorTextLight3, ...FontSemiBold }}>
              {'Manage auto claim'}
            </Typography.Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
