import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { toShort } from 'utils/index';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontSemiBold } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown } from 'phosphor-react-native';
import { Avatar } from 'components/design-system-ui';
import { isEthereumAddress } from '@polkadot/util-crypto';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value: string;
  accountName: string;
}

const accountNameTextStyle: StyleProp<any> = {
  fontSize: 14,
  lineHeight: 22,
  ...FontSemiBold,
  color: 'rgba(255, 255, 255, 0.85)',
  paddingLeft: 8,
};

const getTextStyle = (disabled: boolean, color?: string): StyleProp<any> => {
  return {
    fontSize: 14,
    lineHeight: 22,
    ...FontSemiBold,
    paddingLeft: 8,
    paddingRight: 8,
    color: color || 'rgba(255, 255, 255, 0.45)',
  };
};

const getPlaceholderStyle = (): StyleProp<any> => {
  return {
    fontSize: 14,
    lineHeight: 22,
    ...FontSemiBold,
    paddingLeft: 8,
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
  paddingHorizontal: 12,
  height: 48,
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
          <Avatar value={value} size={label ? 20 : 24} theme={isEthereumAddress(value) ? 'ethereum' : 'polkadot'} />
          {!!value && <Text style={accountNameTextStyle}>{accountName}</Text>}
          {!!value && <Text style={getTextStyle(!!disabled)}>{`(${toShort(value, 4, 4)})`}</Text>}
          {!value && <Text style={getPlaceholderStyle()}>{i18n.header.selectAccount}</Text>}
        </View>

        {!!showIcon && <CaretDown size={20} color={ColorMap.disabled} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};
