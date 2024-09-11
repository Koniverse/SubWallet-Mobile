import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './style';
import { Typography } from 'components/design-system-ui';
import { CheckBoxIcon } from './check-box-icon';

interface Props extends TouchableOpacityProps {
  checked?: boolean;
  onIconPress?(): void;
  onLongIconPress?(): void;
  size?: number;
  checkedIcon?: React.ReactElement<{}>;
  uncheckedIcon?: React.ReactElement<{}>;
  checkedColor?: string;
  uncheckedColor?: string;
  Component?: typeof React.Component;
  iconRight?: boolean;
  title?: string | React.ReactElement<{}>;
  titleProps?: TextProps;
  center?: boolean;
  right?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  checkedTitle?: string;
  fontFamily?: string;
}

export const CheckBox = ({
  checked,
  onLongPress,
  onPress,
  right,
  center,
  containerStyle,
  wrapperStyle,
  iconRight,
  checkedIcon,
  uncheckedIcon,
  title,
  textStyle,
  fontFamily,
  checkedTitle,
  ...props
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const accessibilityState = {
    checked: !!checked,
  };

  return (
    <TouchableOpacity
      accessibilityRole={'checkbox'}
      accessibilityState={accessibilityState}
      testID={'checkbox'}
      onLongPress={onLongPress}
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.container,
        title && styles.containerHasTitle,
        containerStyle && containerStyle,
      ])}
      {...props}>
      <View
        style={StyleSheet.flatten([
          styles.wrapper,
          right && { justifyContent: 'flex-end' },
          center && { justifyContent: 'center' },
          wrapperStyle && wrapperStyle,
        ])}>
        {!iconRight && <CheckBoxIcon checked={checked} checkedIcon={checkedIcon} uncheckedIcon={uncheckedIcon} />}

        {React.isValidElement(title)
          ? title
          : title !== '' &&
            title && (
              <Typography.Text
                style={StyleSheet.flatten([
                  {
                    marginLeft: 10,
                    marginRight: 10,
                    color: theme.colorTextTertiary,
                  },
                  textStyle && textStyle,
                  fontFamily && { fontFamily },
                ])}>
                {checked ? checkedTitle || title : title}
              </Typography.Text>
            )}

        {iconRight && <CheckBoxIcon checked={checked} checkedIcon={checkedIcon} uncheckedIcon={uncheckedIcon} />}
      </View>
    </TouchableOpacity>
  );
};
