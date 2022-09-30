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

interface Props extends FieldBaseProps {
  networkKey: string;
  disabled?: boolean;
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
    paddingRight: 40,
    paddingBottom: 10,
    color: disabled ? ColorMap.disabled : ColorMap.light,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
};

const logoWrapperStyle: StyleProp<any> = {
  position: 'absolute',
  right: 16,
  bottom: 12,
};

export const NetworkField = ({ networkKey, disabled, ...fieldBase }: Props) => {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <Text style={getTextStyle(!!disabled)}>{getNetworkName(networkKey, networkMap)}</Text>
        <View style={logoWrapperStyle}>{getNetworkLogo(networkKey, 20)}</View>
      </View>
    </FieldBase>
  );
};
