import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { CaretDown } from 'phosphor-react-native';
import { ActivityIndicator, Avatar, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { toShort } from 'utils/index';
import { isEthereumAddress } from '@polkadot/util-crypto';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  outerStyle?: StyleProp<any>;
  item?: NominationInfo;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const accountNameTextStyle: StyleProp<any> = {
  fontSize: 14,
  lineHeight: 22,
  ...FontSemiBold,
  color: 'rgba(255, 255, 255, 0.85)',
  maxWidth: 200,
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 9,
  paddingBottom: 12,
};

export const NominationSelectorField = ({
  outerStyle,
  item,
  label,
  loading,
  placeholder = i18n.stakingScreen.selectedCollator,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <FieldBase label={label} fieldBgc={theme.colorBgSecondary} {...fieldBase} outerStyle={outerStyle}>
      <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>
        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
          {item && item.validatorAddress && (
            <View style={{ paddingRight: 8 }}>
              <Avatar
                value={item?.validatorAddress || ''}
                size={24}
                theme={isEthereumAddress(item?.validatorAddress) ? 'ethereum' : 'polkadot'}
              />
            </View>
          )}
          <Text numberOfLines={1} style={accountNameTextStyle}>
            {item ? item.validatorIdentity || toShort(item.validatorAddress) : placeholder}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size={20} indicatorColor={theme.colorWhite} />
        ) : (
          <Icon phosphorIcon={CaretDown} size={'sm'} iconColor={theme.colorTextLight3} />
        )}
      </View>
    </FieldBase>
  );
};
