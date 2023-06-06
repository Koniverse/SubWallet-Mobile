import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import { TextInput, View, ViewStyle } from 'react-native';
import createStylesheet from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TextInputProps } from 'react-native/Libraries/Components/TextInput/TextInput';
import Field from 'components/design-system-ui/field';
import { TextStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { DisabledStyle } from 'styles/sharedStyles';

type PartBlock = {
  content: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

interface Props extends Omit<TextInputProps, 'style' | 'editable'> {
  label?: string;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  isError?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  leftPart?: PartBlock;
  rightPart?: PartBlock;
}

const Input = (
  { label, isError, inputStyle, containerStyle, readonly, disabled, leftPart, rightPart, ...textInputProps }: Props,
  ref: ForwardedRef<TextInput>,
) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = useMemo(
    () => createStylesheet(theme, !!label, !!isError, readonly),
    [isError, label, readonly, theme],
  );

  return (
    <Field label={label} style={[disabled && DisabledStyle, containerStyle]} labelStyle={stylesheet.label}>
      {!!leftPart && <View style={[stylesheet.leftPart, leftPart.style]}>{leftPart.content}</View>}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colorTextLight4}
        {...textInputProps}
        style={[stylesheet.textInput, inputStyle]}
        editable={!disabled && !readonly}
      />

      {!!rightPart && <View style={[stylesheet.rightPart, rightPart.style]}>{rightPart.content}</View>}
    </Field>
  );
};

export default forwardRef(Input);
