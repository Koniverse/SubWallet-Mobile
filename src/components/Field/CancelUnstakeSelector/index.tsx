import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { Book, CaretDown, CheckCircle, Lightning, Spinner } from 'phosphor-react-native';
import { ActivityIndicator, Button, Icon, Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { UnstakingInfo, UnstakingStatus } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';

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
  paddingHorizontal: 16,
  paddingBottom: 12,
};

export const CancelUnstakeSelectorField = ({
  outerStyle,
  item,
  label,
  loading,
  placeholder = 'Selected pool',
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
          <Text>{placeholder}</Text>
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
