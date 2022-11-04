import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getNetworkLogo } from 'utils/index';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown } from 'phosphor-react-native';

interface Props extends FieldBaseProps {
  networkKey: string;
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value?: string;
}

const getNetworkName = (networkKey: string, networkMap: Record<string, NetworkJson>) => {
  if (!networkMap[networkKey]) {
    return networkKey;
  }

  return networkMap[networkKey].chain;
};

const getTextStyle = (disabled: boolean): StyleProp<any> => {
  return {
    ...FontSize2,
    ...FontMedium,
    paddingLeft: 4,
    paddingRight: 8,
    color: disabled ? ColorMap.disabled : ColorMap.light,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  height: 34,
  flexDirection: 'row',
  alignItems: 'center',
  paddingBottom: 10,
  justifyContent: 'space-between',
  paddingHorizontal: 16,
};

export const NetworkSelectField = ({ networkKey, disabled, showIcon, outerStyle, value, ...fieldBase }: Props) => {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  return (
    <FieldBase {...fieldBase} outerStyle={outerStyle}>
      <View style={blockContentStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {getNetworkLogo(value || networkKey, 20, networkKey)}
          <Text style={getTextStyle(!!disabled)}>{value || getNetworkName(networkKey, networkMap)}</Text>
        </View>

        {!!showIcon && <CaretDown size={20} color={ColorMap.disabled} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};
