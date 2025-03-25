import React from 'react';
import { StyleSheet, Switch, View, ViewProps } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { DisabledStyle, FontSemiBold } from 'styles/sharedStyles';
import { BackgroundIcon, Typography } from './design-system-ui';
import { IconProps } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

interface Props extends ViewProps {
  label: string;
  isEnabled: boolean;
  onValueChange: () => void;
  disabled?: boolean;
  backgroundIcon?: React.ElementType<IconProps>;
  backgroundIconColor?: string;
  description?: string;
}

export const ToggleItem = ({
  label,
  isEnabled,
  onValueChange,
  style,
  disabled,
  backgroundIconColor,
  backgroundIcon,
  description,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme, !!description);
  return (
    <View style={[styles.toggleItemWrapperStyle, disabled && DisabledStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {backgroundIcon && (
          <BackgroundIcon
            phosphorIcon={backgroundIcon}
            size={'sm'}
            backgroundColor={backgroundIconColor}
            weight={'fill'}
            shape={'circle'}
          />
        )}
        <View style={styles.contentContainer}>
          <Text numberOfLines={1} style={[styles.toggleItemTextStyle, { color: theme.colorWhite }]}>
            {label}
          </Text>
          {!!description && (
            <Typography.Text size={'sm'} style={{ color: theme.colorTextTertiary }}>
              {description}
            </Typography.Text>
          )}
        </View>
      </View>

      <Switch
        ios_backgroundColor={ColorMap.switchInactiveButtonColor}
        value={isEnabled}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
};

function createStyle(theme: ThemeTypes, isHaveDescription: boolean) {
  return StyleSheet.create({
    toggleItemWrapperStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      paddingHorizontal: theme.paddingSM,
      marginBottom: theme.marginXS,
      width: '100%',
    },
    contentContainer: {
      flex: 1,
      paddingVertical: isHaveDescription ? 10 : 14,
    },
    toggleItemTextStyle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorWhite,
      ...FontSemiBold,
      maxWidth: 240,
    },
  });
}
