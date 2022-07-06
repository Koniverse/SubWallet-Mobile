import React, { useContext, useState } from 'react';
import { Text, View } from 'react-native';
import { BarCodeReadEvent, RNCamera } from 'react-native-camera';
import { QrScannerContext } from 'providers/contexts';
import { QrValue } from 'types/QRScanner';
import { Background } from 'styles/color';
import { Button } from 'components/Button';

interface Props {
  setContent: (data: QrValue) => void;
}

export const QrScanner = ({ setContent }: Props) => {
  const [lastFrame, setLastFrame] = useState<QrValue>(undefined);
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
    setContent(undefined);
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
        width: '100%',
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
          <View style={[Background.transparentDark, { paddingTop: 12, paddingBottom: 12 }]}>
            <Text style={{ textAlign: 'center' }}>QR Scanner</Text>
          </View>
          <View style={{ position: 'absolute', bottom: 18, width: '100%' }}>
            <View style={[Background.transparentDark, { flexDirection: 'row', padding: 20 }]}>
              <Button style={{ flex: 1, marginRight: 8 }} color="secondary" title={'OK'} onPress={onOk} />
              <Button style={{ flex: 1 }} title={'Continue'} onPress={onContinue} />
            </View>
          </View>
        </View>
      </RNCamera>
    </View>
  );
};
