import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { Image, StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontSemiBold } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value: string;
  source?: any;
  serviceName: string;
}

const accountNameTextStyle: StyleProp<any> = {
  fontSize: 14,
  lineHeight: 22,
  ...FontSemiBold,
  color: 'rgba(255, 255, 255, 0.85)',
};

const getPlaceholderStyle = (): StyleProp<any> => {
  return {
    fontSize: 14,
    lineHeight: 22,
    ...FontSemiBold,
    color: '#FFF',
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 10,
  paddingBottom: 12,
  justifyContent: 'space-between',
  paddingHorizontal: 12,
  height: 48,
};

export const ServiceSelectField = ({
  serviceName,
  showIcon,
  outerStyle,
  value,
  label,
  source,
  ...fieldBase
}: Props) => {
  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!!value && <Image source={source} style={{ width: 24, height: 24, marginRight: 8 }} />}
          {!!value && <Text style={accountNameTextStyle}>{serviceName}</Text>}
          {!value && <Text style={getPlaceholderStyle()}>{i18n.placeholder.selectService}</Text>}
        </View>

        {!!showIcon && <CaretDown size={20} color={ColorMap.disabled} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};
