import {useSubWalletTheme} from "hooks/useSubWalletTheme";
import React, {useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {CheckBoxesType} from "types/ui-types";
import {CheckBox} from "react-native-elements";
import {getIcon} from "utils/index";

interface Props {
  dataList: CheckBoxesType[];
  onChangeCallback: (selectedVal: string[]) => void;
}

export const RadioList = ({ dataList, onChangeCallback }: Props) => {
  const theme = useSubWalletTheme().colors;
  const [selectedValue, setSelectedValue] = useState<string>('');

  const styles = useMemo(() => StyleSheet.create({
    checkBoxListContainer: {
      flexDirection: 'row',
      paddingVertical: 10,
      alignItems: 'center'
    },
    checkBoxItemContainer: {
      margin: 0,
      marginLeft: 0,
      marginRight: 0,
      borderWidth: 0,
      padding: 0
    },
    uncheckedIconStyle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.checkBoxBorderColor,
      borderStyle: 'solid'
    },
    checkedIconWrapperStyle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center'
    },
    checkedIconStyle: {
      width: 6,
      height: 6,
      backgroundColor: '#FFF',
      borderRadius: 3,
    }

  }), []);

  const _onChangeItemValue = (key: string) => {
    setSelectedValue(key);
  }

  const renderUncheckedIcon = () => {
    return (<View style={styles.uncheckedIconStyle} />);
  }

  const renderCheckedIcon = () => {
    return (
      <View style={styles.checkedIconWrapperStyle}>
        <View style={styles.checkedIconStyle} />
      </View>
    )
  }

  const renderItem = (item: CheckBoxesType) => {
    return (
      <View key={item.value} style={styles.checkBoxListContainer}>
        <CheckBox
          checked={selectedValue === item.value}
          onPress={() => {_onChangeItemValue(item.value)}}
          checkedIcon={renderCheckedIcon()}
          uncheckedIcon={renderUncheckedIcon()}
          containerStyle={styles.checkBoxItemContainer}
        />

        {item.labelComponent}
      </View>
    )
  }

  return (
    <View>
      {dataList.map(renderItem)}
    </View>
  );
}
