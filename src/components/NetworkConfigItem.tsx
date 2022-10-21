import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import { IconButton } from 'components/IconButton';
import { DotsThree } from 'phosphor-react-native';
import { NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Divider } from 'components/Divider';

interface Props {
  item: NetworkJson;
  onPressConfigDetailButton: () => void;
}

const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const NetworkConfigItemWrapper: StyleProp<any> = {
  flexDirection: 'row',
  padding: 16,
  justifyContent: 'space-between',
  flex: 1,
};

export const NetworkConfigItem = ({ item, onPressConfigDetailButton }: Props) => {
  return (
    <>
      <View style={NetworkConfigItemWrapper}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          {getNetworkLogo(item.key, 40)}
          <View style={{ paddingHorizontal: 16, flex: 1 }}>
            <Text style={textStyle}>{item.chain}</Text>
            <Text numberOfLines={1} style={subTextStyle}>
              {item.customProviders ? item.customProviders[item.currentProvider] : item.providers[item.currentProvider]}
            </Text>
          </View>
        </View>

        <IconButton icon={DotsThree} color={ColorMap.disabled} onPress={onPressConfigDetailButton} />
      </View>
      <Divider style={{ paddingLeft: 72, paddingRight: 16 }} color={ColorMap.dark2} />
    </>
  );
};
