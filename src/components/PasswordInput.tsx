import React, {useState} from 'react';
import {StyleProp, Text, TextInput, TextInputProps, TouchableOpacity, View} from 'react-native';
import { FontSize0, sharedStyles, FontMedium } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';
import {Eye, EyeSlash} from "phosphor-react-native";
import {BUTTON_ACTIVE_OPACITY} from "../constant";

interface InputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<any>;
  textTransform?: string;
}

const getInputContainerStyle: StyleProp<any> = (style: StyleProp<any> = {}) => {
  return {
    borderRadius: 5,
    backgroundColor: ColorMap.dark1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    height: 64,
    ...style,
  };
};

const getInputLabelStyle: StyleProp<any> = (textTransform?: string) => {
  return {
    textTransform: textTransform,
    ...sharedStyles.smallText,
    ...FontSize0,
    color: ColorMap.disabled,
  };
};

const inputStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  lineHeight: 0,
  paddingTop: 5,
  paddingBottom: 5,
  flex: 1,
  paddingRight: 16,
  ...FontMedium,
  color: ColorMap.light,
  textAlignVertical: 'top',
};

export const PasswordInput = (inputProps: InputProps) => {
  const [isShowPassword, setShowPassword] = useState<boolean>(false);
  const { containerStyle, label, textTransform = 'none' } = inputProps;
  const theme = useSubWalletTheme().colors;

  return (
    <View style={getInputContainerStyle(containerStyle)}>
      <Text style={getInputLabelStyle(textTransform)}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={inputStyle}
          placeholderTextColor={theme.textColor2}
          selectionColor={theme.textColor2}
          secureTextEntry={!isShowPassword}
          {...inputProps}
        />

        {isShowPassword ? (
          <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setShowPassword(false)}>
            <EyeSlash color={ColorMap.light} weight={'bold'} size={20} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={() => setShowPassword(true)}>
            <Eye color={ColorMap.light} weight={'bold'} size={20} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
