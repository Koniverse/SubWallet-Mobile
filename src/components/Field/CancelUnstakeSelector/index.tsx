import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { CaretDown, CheckCircle, Spinner } from 'phosphor-react-native';
import { ActivityIndicator, Icon, Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { UnstakingInfo, UnstakingStatus } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  outerStyle?: StyleProp<any>;
  item?: UnstakingInfo;
  loading?: boolean;
  placeholder?: string;
}

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 10,
  paddingHorizontal: 12,
  paddingBottom: 12,
};

const getPlaceholderStyle = (): StyleProp<any> => {
  return {
    fontSize: 14,
    lineHeight: 22,
    ...FontSemiBold,
    paddingRight: 8,
    color: '#FFF',
  };
};

export const CancelUnstakeSelectorField = ({
  outerStyle,
  item,
  label,
  loading,
  placeholder = i18n.stakingScreen.selectUnstakeRequest,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(item?.chain || '');
  return (
    <FieldBase label={label} fieldBgc={theme.colorBgSecondary} {...fieldBase} outerStyle={outerStyle}>
      <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>
        {item ? (
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <Icon
              iconColor={item.status === UnstakingStatus.CLAIMABLE ? theme.colorSuccess : theme.colorWarning}
              phosphorIcon={item.status === UnstakingStatus.CLAIMABLE ? CheckCircle : Spinner}
              size="sm"
              weight="fill"
            />
            <Number
              style={{ paddingLeft: 4 }}
              textStyle={{ ...FontMedium }}
              decimal={decimals}
              suffix={symbol}
              value={item.claimable}
            />
          </View>
        ) : (
          <Text style={getPlaceholderStyle()}>{placeholder}</Text>
        )}

        {loading ? (
          <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={20} indicatorColor={theme.colorWhite} />
          </View>
        ) : (
          <Icon phosphorIcon={CaretDown} size={'sm'} iconColor={theme.colorWhite} />
        )}
      </View>
    </FieldBase>
  );
};
