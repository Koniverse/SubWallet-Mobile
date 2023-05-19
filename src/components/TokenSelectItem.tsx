import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getTokenLogo } from 'utils/index';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { CheckCircle } from 'phosphor-react-native';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props extends TouchableOpacityProps {
  symbol: string;
  chain: string;
  logoKey: string;
  subLogoKey?: string;
  isSelected: boolean;
  onSelectNetwork: () => void;
  defaultItemKey?: string;
  iconSize?: number;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 14,
  alignItems: 'center',
  paddingHorizontal: 12,
  backgroundColor: '#1A1A1A',
  marginHorizontal: 16,
  marginBottom: 8,
  borderRadius: 8,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 8,
  color: ColorMap.light,
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
};

const subTextStyle: StyleProp<any> = {
  paddingLeft: 8,
  color: 'rgba(255, 255, 255, 0.45)',
  fontSize: 12,
  lineHeight: 20,
  ...FontMedium,
};

export const TokenSelectItem = ({
  symbol,
  chain,
  logoKey,
  subLogoKey,
  isSelected,
  onSelectNetwork,
  defaultItemKey,
  iconSize = 40,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <TouchableOpacity onPress={onSelectNetwork}>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          {getTokenLogo(logoKey, subLogoKey, iconSize, defaultItemKey)}
          <View>
            <Text style={itemTextStyle}>{symbol}</Text>
            <Text style={subTextStyle}>{chain}</Text>
          </View>
        </View>

        {isSelected && (
          <View
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: -theme.marginXS,
            }}>
            <Icon phosphorIcon={CheckCircle} weight={'fill'} size={'sm'} iconColor={theme.colorSuccess} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
