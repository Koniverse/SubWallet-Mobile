import React, { useMemo } from 'react';

import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import { Text, View } from 'react-native';

interface Props {
  bytes: string;
  url: string;
}

export const Bytes = ({ bytes, url }: Props) => {
  const text = useMemo(() => (isAscii(bytes) ? u8aToString(u8aUnwrapBytes(bytes)) : bytes), [bytes]);

  //todo: i18n
  return (
    <View>
      <View>
        <Text>from</Text>
        <Text>{url}</Text>
      </View>
      <View>
        <Text>bytes</Text>
        <Text>{text}</Text>
      </View>
    </View>
  );
};
