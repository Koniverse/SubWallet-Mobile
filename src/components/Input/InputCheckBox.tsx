import React, { Suspense, useMemo } from 'react';
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
  labelStyle?: StyleProp<TextStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  label: string;
  style?: StyleProp<ViewStyle>;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  marginLeft: -10.2,
  marginRight: -10,
  // marginBottom: -5,
};

const WrapperStyle: StyleProp<ViewStyle> = {
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

const InputCheckBox = ({
  checked,
  onPress,
  disable,
  label,
  labelStyle,
  wrapperStyle,
  checkBoxSize = 20,
  style,
}: Props) => {
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

  const containerStyle = useMemo(() => {
    return [ContainerStyle, style];
  }, [style]);

  const checkBoxTextStyle = useMemo(() => {
    return [LabelStyle, labelStyle];
  }, [labelStyle]);

  const checkBoxWrapperStyle = useMemo(() => {
    return [WrapperStyle, wrapperStyle];
  }, [wrapperStyle]);

  return (
    <View style={containerStyle}>
      <CheckBox
        title={label}
        containerStyle={checkBoxWrapperStyle}
        textStyle={checkBoxTextStyle}
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
