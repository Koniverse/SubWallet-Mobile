import React, { useContext, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { BarCodeReadEvent, RNCamera } from 'react-native-camera';
import { SubWalletStyle } from 'styles/index';
import { QrScannerContext } from 'providers/contexts';
import { QrValue } from 'types/QRScanner';

export const QrScanner = () => {
  const [lastFrame, setLastFrame] = useState<QrValue>(undefined);
  const [content, setContent] = useState<QrValue>('');
  const qrContext = useContext(QrScannerContext);
  let camera: RNCamera;

  const onBarCodeRead = async (event: BarCodeReadEvent): Promise<void> => {
    if (event.type !== RNCamera.Constants.BarCodeType.qr) {
      return;
    }

    if (event.rawData === lastFrame) {
      return;
    }

    setLastFrame(event.rawData);
    camera?.pausePreview();
    if (event.data === '') {
      setContent(event.rawData);
      qrContext.onScanned(event.rawData);
    } else {
      setContent(event.data);
      qrContext.onScanned(event.data);
    }
  };

  function onContinue() {
    setLastFrame(undefined);
    camera?.resumePreview();
  }

  function onOk() {
    qrContext.onClosed(lastFrame);
  }

  return (
    <View
      style={{
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      }}>
      <RNCamera
        ref={ref => {
          // @ts-ignore
          camera = ref;
        }}
        captureAudio={false}
        onBarCodeRead={onBarCodeRead}
        style={{ width: '100%' }}>
        <View style={{ width: '100%', height: '100%' }}>
          <View
            style={{
              ...SubWalletStyle.background.transparentDark,
              paddingTop: 12,
              paddingBottom: 12,
            }}>
            <Text style={{ textAlign: 'center' }}>QR Scanner</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <Text
              style={{
                ...SubWalletStyle.background.transparentDark,
                padding: 8,
              }}>
              {content}
            </Text>
            <Button title={'OK'} onPress={onOk} />
            <Button title={'Continue'} onPress={onContinue} />
          </View>
        </View>
      </RNCamera>
    </View>
  );
};
