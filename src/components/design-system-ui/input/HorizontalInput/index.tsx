import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import { TextInput, View, ViewStyle } from 'react-native';
import createStylesheet from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TextInputProps } from 'react-native/Libraries/Components/TextInput/TextInput';
import { TextStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { DisabledStyle } from 'styles/sharedStyles';
import { FieldHorizontal } from 'components/design-system-ui/field/HorizontalField';

export interface InputProps extends Omit<TextInputProps, 'style' | 'editable'> {
  label?: string;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  isError?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  leftPart?: React.ReactNode;
  leftPartStyle?: StyleProp<ViewStyle>;
  rightPart?: React.ReactNode;
  rightPartStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const HorizontalInput = (
  {
    label,
    isError,
    inputStyle,
    containerStyle,
    readonly,
    disabled,
    leftPart,
    rightPart,
    labelStyle,
    ...textInputProps
  }: InputProps,
  ref: ForwardedRef<TextInput>,
) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = useMemo(
    () => createStylesheet(theme, !!label, !!isError, readonly),
    [isError, label, readonly, theme],
  );

  return (
    <FieldHorizontal label={label} outerStyle={[disabled && DisabledStyle, containerStyle]} labelStyle={labelStyle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {!!leftPart && <View style={[stylesheet.leftPart]}>{leftPart}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colorTextLight4}
          {...textInputProps}
          style={[stylesheet.textInput, inputStyle]}
          editable={!disabled && !readonly}
        />

        {!!rightPart && <View style={[stylesheet.rightPart]}>{rightPart}</View>}
      </View>
    </FieldHorizontal>
  );
};

export default forwardRef(HorizontalInput);
