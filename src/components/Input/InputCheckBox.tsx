import React, { Suspense } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { ColorMap } from 'styles/color';
import { FontMedium } from 'styles/sharedStyles';
import { SVGImages } from 'assets/index';

interface Props {
  checked: boolean;
  onPress: () => void;
  disable?: boolean;
  checkBoxSize?: number;
  label: string;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  marginLeft: -10.2,
  marginRight: -10,
  // marginBottom: -5,
};

const ContainerProps: StyleProp<ViewStyle> = {
  backgroundColor: 'transparent',
  paddingHorizontal: 0,
  paddingVertical: 12,
  // borderRadius: 5,
  marginBottom: 0,
  marginTop: 0,
  marginHorizontal: 0,
  borderWidth: 0,
};

const LabelStyle: StyleProp<TextStyle> = {
  fontSize: 14,
  lineHeight: 22,
  ...FontMedium,
  fontWeight: '600',
  color: '#fff',
};

const InputCheckBox = ({ checked, onPress, disable, label, checkBoxSize = 20 }: Props) => {
  const UncheckedIcon = (
    <Suspense>
      <SVGImages.CheckBoxIcon width={checkBoxSize} height={checkBoxSize} />
    </Suspense>
  );

  const CheckedIcon = (
    <Suspense>
      <SVGImages.CheckBoxFilledIcon width={checkBoxSize} height={checkBoxSize} />
    </Suspense>
  );
  return (
    <View style={WrapperStyle}>
      <CheckBox
        title={label}
        containerStyle={ContainerProps}
        textStyle={LabelStyle}
        activeOpacity={1}
        onPress={onPress}
        checked={checked}
        uncheckedIcon={UncheckedIcon}
        checkedIcon={CheckedIcon}
        checkedColor={ColorMap.light}
        uncheckedColor={ColorMap.light}
        disabled={disable}
        size={checkBoxSize}
      />
    </View>
  );
};

export default React.memo(InputCheckBox);
