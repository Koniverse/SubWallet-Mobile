import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useQrScanner } from 'hooks/useQrScanner';

export const CryptoTab = () => {
  const priceStore = useSelector((state: RootState) => state.price);
  const qrScanner = useQrScanner();
  const [scanVal, setScanVal] = useState<string | undefined>(undefined);

  return (
    <View
      style={{
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      }}>
      {Object.entries(priceStore.priceMap).map(([key, val]) => (
        <View key={key}>
          <Text>
            {key}: {val}
          </Text>
        </View>
      ))}
      <Button
        title="Open QR"
        onPress={() => {
          qrScanner.open({
            onClosed: val => {
              setScanVal(val.data as string);
            },
          });
        }}
      />
      <Text>Scaned Value: {scanVal}</Text>
    </View>
  );
};
