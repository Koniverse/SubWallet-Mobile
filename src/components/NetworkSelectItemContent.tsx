import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { getNetworkLogo } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold } from 'styles/sharedStyles';
import { CheckCircle } from 'phosphor-react-native';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  itemName: string;
  itemKey: string;
  isSelected?: boolean;
  defaultItemKey?: string;
  showSeparator?: boolean;
  iconSize?: number;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  height: 52,
  paddingLeft: 12,
  paddingRight: 12,
  alignItems: 'center',
  marginHorizontal: 16,
  backgroundColor: '#1A1A1A',
  borderRadius: 8,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const itemSeparator: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 1,
  marginLeft: 64,
  marginRight: 16,
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 8,
  color: ColorMap.light,
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
};

const logoWrapperStyle: StyleProp<any> = {
  backgroundColor: 'transparent',
  borderRadius: 28,
};

export const NetworkSelectItemContent = ({
  itemKey,
  itemName,
  isSelected,
  defaultItemKey,
  showSeparator = true,
  iconSize = 28,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <View style={logoWrapperStyle}>{getNetworkLogo(itemKey, iconSize, defaultItemKey)}</View>
          <Text style={itemTextStyle}>{itemName}</Text>
        </View>

        {isSelected && (
          <View style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', marginRight: -8 }}>
            <Icon phosphorIcon={CheckCircle} size={'sm'} weight={'fill'} iconColor={theme.colorSuccess} />
          </View>
        )}
      </View>

      {showSeparator && <View style={itemSeparator} />}
    </View>
  );
};
