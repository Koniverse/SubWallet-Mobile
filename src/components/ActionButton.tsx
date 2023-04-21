import React from 'react';
import { StyleProp, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import Text from '../components/Text';
import { FontMedium } from 'styles/sharedStyles';
import { Button, Icon } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { IconProps } from 'phosphor-react-native';

interface Props extends TouchableOpacityProps {
  label?: string;
  icon: React.ElementType<IconProps>;
  buttonWrapperStyle?: StyleProp<ViewStyle>;
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
  const { label, icon, disabled, onPress, buttonWrapperStyle } = actionButtonProps;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={buttonWrapperStyle}>
        <Button
          shape={'squircle'}
          size={'sm'}
          disabled={!!disabled}
          icon={<Icon phosphorIcon={icon} weight={'bold'} />}
          // @ts-ignore
          onPress={() => onPress && onPress()}
        />
      </View>

      {!!label && <Text style={getButtonTextStyle(!!disabled, theme)}>{label}</Text>}
    </View>
  );
};

export default ActionButton;
