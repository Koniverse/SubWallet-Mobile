import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import { CaretRight, MinusCircle } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { Divider } from 'components/Divider';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { CustomToken, DeleteCustomTokenParams } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  item: CustomToken;
  isEditMode: boolean;
  onPress: () => void;
  handleSelected: (val: DeleteCustomTokenParams) => void;
  handleUnselected: (val: DeleteCustomTokenParams) => void;
}

const itemWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flex: 1,
  paddingTop: 12,
  paddingBottom: 11,
  paddingLeft: 16,
  paddingRight: 32,
};

const itemTextStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
  paddingLeft: 20,
  paddingRight: 36,
  width: '100%',
};

export const CustomTokenItem = ({ item, isEditMode, onPress, handleSelected, handleUnselected }: Props) => {
  const [isSelected, setSelected] = useState<boolean>(false);
  useEffect(() => {
    if (!isEditMode && isSelected) {
      setSelected(false);
    }
  }, [isEditMode, isSelected]);
  const handleCheck = useCallback(
    (checked: boolean) => {
      setSelected(checked);

      if (checked) {
        handleSelected({
          smartContract: item.smartContract,
          chain: item.chain,
          type: item.type,
        });
      } else {
        handleUnselected({
          smartContract: item.smartContract,
          chain: item.chain,
          type: item.type,
        });
      }
    },
    [handleSelected, handleUnselected, item.chain, item.smartContract, item.type],
  );

  const _onPressItem = useCallback(() => {
    if (isEditMode) {
      handleCheck(!isSelected);
    } else {
      onPress();
    }
  }, [handleCheck, isEditMode, isSelected, onPress]);

  return (
    <TouchableOpacity onPress={_onPressItem}>
      <View style={itemWrapperStyle}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          {getNetworkLogo(item.symbol || item.chain, 28)}
          <Text numberOfLines={1} style={itemTextStyle}>
            {item.name || item.symbol || ''}
          </Text>
        </View>
        {isEditMode ? (
          !isSelected ? (
            <MinusCircle size={20} weight={'bold'} color={ColorMap.disabled} style={{ margin: -2 }} />
          ) : (
            <View style={{ backgroundColor: ColorMap.light, borderRadius: 10 }}>
              <MinusCircle size={20} weight={'fill'} color={ColorMap.danger} style={{ margin: -2 }} />
            </View>
          )
        ) : (
          <CaretRight size={20} weight={'bold'} color={ColorMap.disabled} style={{ margin: -2 }} />
        )}
      </View>
      <Divider style={{ paddingLeft: 64, paddingRight: 16 }} color={ColorMap.dark2} />
    </TouchableOpacity>
  );
};
