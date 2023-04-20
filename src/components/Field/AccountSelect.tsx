import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { toShort } from 'utils/index';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown } from 'phosphor-react-native';
import { Avatar } from 'components/design-system-ui';

interface Props extends FieldBaseProps {
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value: string;
  accountName: string;
}

const accountNameTextStyle: StyleProp<any> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
  color: 'rgba(255, 255, 255, 0.85)',
  paddingLeft: 8,
};

const getTextStyle = (disabled: boolean): StyleProp<any> => {
  return {
    fontSize: 14,
    lineHeight: 22,
    ...FontMedium,
    paddingLeft: 4,
    paddingRight: 8,
    color: 'rgba(255, 255, 255, 0.45)',
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 10,
  paddingBottom: 12,
  justifyContent: 'space-between',
  paddingHorizontal: 16,
};

export const AccountSelectField = ({
  accountName,
  disabled,
  showIcon,
  outerStyle,
  value,
  label,
  ...fieldBase
}: Props) => {
  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar value={value} size={24} />
          <Text style={accountNameTextStyle}>{accountName}</Text>
          {!!value && <Text style={getTextStyle(!!disabled)}>{`(${toShort(value, 4, 4)})`}</Text>}
        </View>

        {!!showIcon && <CaretDown size={20} color={ColorMap.disabled} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};
