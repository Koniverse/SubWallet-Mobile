import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import reformatAddress, { getNetworkLogo, toShort } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface Props {
  address: string;
  name: string;
  networkKey?: string;
  networkPrefix?: number;
}

const avatarStyle: StyleProp<any> = {
  border: 0,
  marginRight: 6,
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
        <SubWalletAvatar address={address} size={18} style={avatarStyle} />
        <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled }}>
          <Text numberOfLines={1} style={{ maxWidth: 100 }}>
            {name}
          </Text>
          <Text>{` (${toShort(formattedAddress, 5, 5)})`}</Text>
        </Text>
      </View>

      {getNetworkLogo(networkKey || '', 20)}
    </View>
  );
};
