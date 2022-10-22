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
    lineHeight: 25,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 10,
    color: disabled ? ColorMap.disabled : ColorMap.light,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  height: 34,
};

const logoWrapperStyle: StyleProp<any> = {
  position: 'absolute',
  right: 16,
  bottom: 12,
};

export const NetworkField = ({ networkKey, disabled, showIcon, ...fieldBase }: Props) => {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={getTextStyle(!!disabled)}>{getNetworkName(networkKey, networkMap)}</Text>
          {!!showIcon && <CaretDown size={16} color={ColorMap.disabled} weight={'bold'} style={{ marginTop: 4 }} />}
        </View>

        <View style={logoWrapperStyle}>{getNetworkLogo(networkKey, 20)}</View>
      </View>
    </FieldBase>
  );
};
