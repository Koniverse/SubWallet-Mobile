import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { CheckBoxesType } from 'types/ui-types';
import { getIcon } from 'utils/index';
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

export const Checkboxes = ({ dataList, onChangeCallback }: Props) => {
  const [valueMap, setValueMap] = useState<Record<string, boolean>>({});

  const _onChangeItemValue = (key: string) => {
    let checked = !!valueMap[key];
    setValueMap(prev => {
      const newMap = {
        ...prev,
        [key]: !checked,
      };

      const nextValues: string[] = [];

      Object.keys(newMap).forEach(k => {
        if (newMap[k]) {
          nextValues.push(k);
        }
      });

      onChangeCallback(nextValues);

      return newMap;
    });
  };

  const renderItem = (item: CheckBoxesType) => {
    return (
      <View key={item.value} style={checkBoxListContainer}>
        <CheckBox
          checked={!!valueMap[item.value]}
          onPress={() => {
            _onChangeItemValue(item.value);
          }}
          checkedIcon={getIcon('CheckBoxFilledIcon', 16, ColorMap.light)}
          uncheckedIcon={getIcon('CheckBoxIcon', 16, ColorMap.light)}
          containerStyle={checkBoxItemContainer}
        />

        {item.labelComponent}
      </View>
    );
  };

  return <View>{dataList.map(renderItem)}</View>;
};
