import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckBoxesType } from 'types/ui-types';
import { getIcon } from 'utils/index';

interface Props {
  dataList: CheckBoxesType[];
  onChangeCallback: (selectedVal: string[]) => void;
}

export const Checkboxes = ({ dataList, onChangeCallback }: Props) => {
  const theme = useSubWalletTheme().colors;
  const [valueMap, setValueMap] = useState<Record<string, boolean>>({});

  const styles = useMemo(
    () =>
      StyleSheet.create({
        checkBoxListContainer: {
          flexDirection: 'row',
          paddingVertical: 10,
          alignItems: 'center',
        },
        checkBoxItemContainer: {
          margin: 0,
          marginLeft: 0,
          marginRight: 0,
          borderWidth: 0,
          padding: 0,
        },
      }),
    [],
  );

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
      <View key={item.value} style={styles.checkBoxListContainer}>
        <CheckBox
          checked={!!valueMap[item.value]}
          onPress={() => {
            _onChangeItemValue(item.value);
          }}
          checkedIcon={getIcon('CheckBoxFilledIcon', 16, '#FFF')}
          uncheckedIcon={getIcon('CheckBoxIcon', 16, '#FFF')}
          containerStyle={{
            margin: 0,
            marginLeft: 0,
            marginRight: 0,
            borderWidth: 0,
            padding: 0,
          }}
        />

        {item.labelComponent}
      </View>
    );
  };

  return <View>{dataList.map(renderItem)}</View>;
};
