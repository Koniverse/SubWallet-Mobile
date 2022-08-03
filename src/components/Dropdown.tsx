import React, { useMemo } from 'react';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import { StyleSheet } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { ColorMap } from 'styles/color';

interface Props {
  placeholder?: string;
  items: Item[];
  value?: any;
  onValueChange: (value: any, index: number) => void;
}

export const Dropdown = ({ placeholder, items, onValueChange, value }: Props) => {
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
  );
};
