import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { getTokenLogo } from 'utils/index';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import {FontMedium, FontSemiBold, FontSize2} from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown } from 'phosphor-react-native';

interface Props extends FieldBaseProps {
  logoKey: string;
  subLogoKey: string;
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value?: string;
}

const getTextStyle = (disabled: boolean): StyleProp<any> => {
  return {
    fontSize: 16,
    lineHeight: 24,
    ...FontSemiBold,
    paddingLeft: 8,
    paddingRight: 8,
    color: disabled ? ColorMap.disabled : ColorMap.light,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  paddingBottom: 12,
  justifyContent: 'space-between',
  paddingHorizontal: 16,
};

export const TokenSelectField = ({
  logoKey,
  subLogoKey,
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
          {getTokenLogo(logoKey, subLogoKey, 24)}
          <Text style={getTextStyle(!!disabled)}>{value}</Text>
        </View>

        {!!showIcon && <CaretDown size={20} color={ColorMap.disabled} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};
