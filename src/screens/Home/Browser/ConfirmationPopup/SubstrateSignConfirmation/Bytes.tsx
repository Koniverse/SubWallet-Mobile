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

const itemWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
};

const labelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  flex: 1,
  maxWidth: 100,
  textAlign: 'right',
  paddingRight: 8,
  paddingLeft: 16,
};

const valueStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  flex: 1,
  paddingRight: 16,
};

export const Bytes = ({ bytes, url }: Props) => {
  const text = useMemo(() => (isAscii(bytes) ? u8aToString(u8aUnwrapBytes(bytes)) : bytes), [bytes]);

  return (
    <ScrollView style={{ width: '100%', marginTop: 16, marginBottom: 24 }}>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.from}</Text>
        <Text style={valueStyle}>{url}</Text>
      </View>
      <View style={itemWrapperStyle}>
        <Text style={labelStyle}>{i18n.common.bytes}</Text>
        <Text style={valueStyle}>{text}</Text>
      </View>
    </ScrollView>
  );
};
