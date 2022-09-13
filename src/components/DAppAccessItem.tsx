import React from 'react';
import { Image, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { Divider } from 'components/Divider';
import { getHostName } from 'utils/browser';
import { BUTTON_ACTIVE_OPACITY } from '../constant';

interface Props {
  item: AuthUrlInfo;
  onPress: () => void;
}

const itemWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  paddingVertical: 16,
};

const itemContentWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'space-between',
};

const itemMainTextStyle: StyleProp<any> = { ...sharedStyles.mediumText, color: ColorMap.light, ...FontSemiBold };
const itemSubTextStyle: StyleProp<any> = { ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium };

export const DAppAccessItem = ({ item, onPress }: Props) => {
  const hostName = getHostName(item.url);
  return (
    <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={onPress}>
      <View style={itemWrapperStyle}>
        <Image source={{ uri: `https://icons.duckduckgo.com/ip2/${hostName}.ico`, width: 40, height: 40 }} />
        <View style={itemContentWrapperStyle}>
          <View style={{ flex: 1, ...ContainerHorizontalPadding }}>
            <Text style={itemMainTextStyle}>{item.origin}</Text>
            <Text numberOfLines={1} style={itemSubTextStyle}>
              {item.url}
            </Text>
          </View>
          <CaretRight color={ColorMap.disabled} size={24} weight={'bold'} />
        </View>
      </View>
      <Divider style={{ paddingLeft: 56 }} color={ColorMap.dark2} />
    </TouchableOpacity>
  );
};
