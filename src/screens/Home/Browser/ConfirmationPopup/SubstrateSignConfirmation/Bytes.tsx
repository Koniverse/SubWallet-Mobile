import React, { useMemo } from 'react';

import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import { ScrollView, StyleProp, Text, View } from 'react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';

interface Props {
  bytes: string;
  url: string;
}

const labelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  flex: 1,
  paddingRight: 8,
};

const valueStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  flex: 1,
};

export const Bytes = ({ bytes, url }: Props) => {
  const text = useMemo(() => (isAscii(bytes) ? u8aToString(u8aUnwrapBytes(bytes)) : bytes), [bytes]);

  return (
    <ScrollView style={{ width: '100%', marginTop: 32, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
      <View>
        <Text style={labelStyle}>{i18n.common.from}</Text>
        <Text style={valueStyle}>{url}</Text>
      </View>
      <View>
        <Text style={labelStyle}>{i18n.common.bytes}</Text>
        <Text style={valueStyle}>{text}</Text>
      </View>
    </ScrollView>
  );
};
