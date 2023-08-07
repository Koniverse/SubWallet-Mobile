import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import reformatAddress, { getNetworkLogo, toShort } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { Avatar } from 'components/design-system-ui';

interface Props {
  address: string;
  name: string;
  networkKey?: string;
  networkPrefix?: number;
}

const textStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

export const AccountInfoField = ({ address, name, networkKey, networkPrefix }: Props) => {
  const formattedAddress = networkPrefix ? reformatAddress(address, networkPrefix || -1) : address;

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: ColorMap.dark1,
        borderRadius: 5,
        alignItems: 'center',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Avatar value={address} size={18} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
          <Text numberOfLines={1} style={[{ maxWidth: 100 }, textStyle]}>
            {name}
          </Text>
          <Text style={textStyle}>{` (${toShort(formattedAddress, 5, 5)})`}</Text>
        </View>
      </View>

      {getNetworkLogo(networkKey || '', 20)}
    </View>
  );
};
