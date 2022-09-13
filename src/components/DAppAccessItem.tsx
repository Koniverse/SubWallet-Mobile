import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
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

export const DAppAccessItem = ({ item, onPress }: Props) => {
  const hostName = getHostName(item.url);
  return (
    <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={onPress}>
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <Image source={{ uri: `https://icons.duckduckgo.com/ip2/${hostName}.ico`, width: 40, height: 40 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flex: 1, ...ContainerHorizontalPadding }}>
            <Text style={{ ...sharedStyles.mediumText, color: ColorMap.light, ...FontSemiBold }}>{item.origin}</Text>
            <Text numberOfLines={1} style={{ ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium }}>
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
