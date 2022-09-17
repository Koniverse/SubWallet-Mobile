import React, { useMemo } from 'react';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { ColorMap } from 'styles/color';

interface Props {
  placeholder?: string;
  items: Item[];
  label?: string;
  value?: any;
  onValueChange: (value: any, index: number) => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  paddingBottom: 0,
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
};

const LabelStyle: StyleProp<TextStyle> = {
  ...FontSize0,
  ...FontMedium,
  lineHeight: 25,
  paddingHorizontal: 16,
  paddingTop: 4,
  color: ColorMap.disabled,
};

export const Dropdown = ({ placeholder, items, onValueChange, value, label }: Props) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputIOS: {
          ...sharedStyles.textInput,
          backgroundColor: ColorMap.dark2,
          color: ColorMap.light,
        },
        inputAndroid: {
          ...sharedStyles.textInput,
          backgroundColor: ColorMap.dark2,
          color: ColorMap.light,
        },
        iconContainer: {
          top: 16,
          right: 12,
        },
      }),
    [],
  );
  return (
    <View style={WrapperStyle}>
      <Text style={LabelStyle}>{label}</Text>
      <RNPickerSelect
        style={styles}
        items={items}
        useNativeAndroidPickerStyle={false}
        onValueChange={onValueChange}
        value={value}
        placeholder={placeholder ? { label: placeholder, value: '' } : {}}
        Icon={() => {
          return <FontAwesomeIcon icon={faChevronDown} size={16} color={ColorMap.light} />;
        }}
      />
    </View>
  );
};
