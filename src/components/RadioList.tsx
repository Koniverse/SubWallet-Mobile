import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import { CheckBoxesType } from 'types/ui-types';
import { CheckBox } from 'react-native-elements';
import { ColorMap } from 'styles/color';

interface Props {
  dataList: CheckBoxesType[];
  onChangeCallback: (selectedVal: string[]) => void;
}

const checkBoxListContainer: StyleProp<any> = {
  flexDirection: 'row',
  paddingVertical: 10,
  alignItems: 'center',
};
const checkBoxItemContainer: StyleProp<any> = {
  margin: 0,
  marginLeft: 0,
  marginRight: 0,
  borderWidth: 0,
  padding: 0,
};
const uncheckedIconStyle: StyleProp<any> = {
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: ColorMap.inputBackground,
  borderWidth: 1,
  borderColor: ColorMap.checkBoxBorderColor,
  borderStyle: 'solid',
};
const checkedIconWrapperStyle: StyleProp<any> = {
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: ColorMap.secondary,
  justifyContent: 'center',
  alignItems: 'center',
};
const checkedIconStyle: StyleProp<any> = {
  width: 6,
  height: 6,
  backgroundColor: ColorMap.light,
  borderRadius: 3,
};

export const RadioList = ({ dataList, onChangeCallback }: Props) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const _onChangeItemValue = (key: string) => {
    setSelectedValue(key);
  };

  const renderUncheckedIcon = () => {
    return <View style={uncheckedIconStyle} />;
  };

  const renderCheckedIcon = () => {
    return (
      <View style={checkedIconWrapperStyle}>
        <View style={checkedIconStyle} />
      </View>
    );
  };

  const renderItem = (item: CheckBoxesType) => {
    return (
      <View key={item.value} style={checkBoxListContainer}>
        <CheckBox
          checked={selectedValue === item.value}
          onPress={() => {
            _onChangeItemValue(item.value);
          }}
          checkedIcon={renderCheckedIcon()}
          uncheckedIcon={renderUncheckedIcon()}
          containerStyle={checkBoxItemContainer}
        />

        {item.labelComponent}
      </View>
    );
  };

  return <View>{dataList.map(renderItem)}</View>;
};
