import React from 'react';
import { TouchableOpacityProps, View } from 'react-native';
import Text from '../components/Text';
import { FontMedium } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Button, Icon } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { IconProps } from 'phosphor-react-native';

interface Props extends TouchableOpacityProps {
  label: string;
  icon: React.ElementType<IconProps>;
}

function getButtonTextStyle(disabled: boolean, theme: ThemeTypes) {
  return {
    color: disabled ? theme.colorTextLight4 : theme.colorTextLight1,
    fontSize: 15,
    lineHeight: 26,
    ...FontMedium,
    paddingTop: 8,
  };
}

const ActionButton = (actionButtonProps: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { label, icon, disabled } = actionButtonProps;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ paddingHorizontal: theme.paddingSM }}>
        <Button
          shape={'squircle'}
          size={'sm'}
          disabled={!!disabled}
          icon={<Icon phosphorIcon={icon} weight={'bold'} />}
        />
      </View>

      <Text style={getButtonTextStyle(!!disabled, theme)}>{label}</Text>
    </View>
  );
};

export default ActionButton;
