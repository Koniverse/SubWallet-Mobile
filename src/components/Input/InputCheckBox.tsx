import React from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface Props {
  checked: boolean;
  onPress: () => void;
  disable?: boolean;
  label: string;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  marginLeft: -10.2,
  marginRight: -10,
  marginBottom: -5,
};

const ContainerProps: StyleProp<ViewStyle> = {
  backgroundColor: ColorMap.dark2,
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 5,
  marginBottom: 8,
  marginTop: 0,
  marginHorizontal: 0,
  borderWidth: 0,
};

const LabelStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const InputCheckBox = ({ checked, onPress, disable, label }: Props) => {
  return (
    <View style={WrapperStyle}>
      <CheckBox
        title={label}
        containerStyle={ContainerProps}
        textStyle={LabelStyle}
        activeOpacity={1}
        onPress={onPress}
        checked={checked}
        checkedIcon={'check-square'}
        checkedColor={ColorMap.light}
        uncheckedColor={ColorMap.light}
        disabled={disable}
        size={16}
      />
    </View>
  );
};

export default React.memo(InputCheckBox);
