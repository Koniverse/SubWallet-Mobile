import { isHex } from '@polkadot/util';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import Text from 'components/Text';
import { Warning } from 'components/Warning';
import { DEVICE } from 'constants/index';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { ColorMap } from 'styles/color';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { SigData } from 'types/signer';
import { convertHexColorToRGBA } from 'utils/color';
import i18n from 'utils/i18n/i18n';
import { overlayColor, rectDimensions } from 'constants/scanner';
import { BarCodeReadEvent } from 'react-native-camera';

interface Props {
  visible: boolean;
  subTitle?: string;
  onHideModal: () => void;
  onSuccess: (result: SigData) => void | Promise<void>;
}

const WrapperContainerStyle: StyleProp<ViewStyle> = {
  height: DEVICE.height - 60,
  zIndex: -1,
};

const BottomSubContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 16,
  flex: 1,
};

const BottomContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: convertHexColorToRGBA(ColorMap.dark1, 0.5),
};

const QrAddressScanner = ({ visible, onHideModal, onSuccess, subTitle }: Props) => {
  const [error, setError] = useState<string>('');

  const handleRead = useCallback(
    (event: BarCodeReadEvent) => {
      try {
        const data = event.data;
        const signature = `0x${data}`;

        if (isHex(signature)) {
          setError('');
          onSuccess({
            signature: signature,
          });
          onHideModal();
        } else {
          const message = i18n.errorMessage.scanAgain;

          setError(message);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [onHideModal, onSuccess],
  );

  useEffect(() => {
    if (!visible) {
      setError('');
    }
  }, [visible]);

  return (
    <SubWalletModal modalVisible={visible} onModalHide={onHideModal} onChangeModalVisible={onHideModal}>
      <View style={WrapperContainerStyle}>
        <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={overlayColor} translucent={true} />
        <QRCodeScanner
          reactivate={true}
          reactivateTimeout={5000}
          showMarker={true}
          onRead={handleRead}
          containerStyle={ScannerStyles.ContainerStyle}
          cameraStyle={ScannerStyles.CameraStyle}
          topViewStyle={ScannerStyles.ContainerStyle}
          customMarker={
            <View style={ScannerStyles.RectangleContainerStyle}>
              <View style={ScannerStyles.TopOverlayStyle}>
                <View style={ScannerStyles.HeaderStyle}>
                  <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.approveRequest}</Text>
                </View>
                <View style={ScannerStyles.HeaderSubTitleStyle}>
                  {subTitle && <Text style={ScannerStyles.HeaderSubTitleTextStyle}>{i18n.common.scanForApprove}</Text>}
                </View>
              </View>
              <View style={ScannerStyles.CenterOverlayStyle}>
                <View style={ScannerStyles.LeftAndRightOverlayStyle} />

                <View style={[ScannerStyles.RectangleStyle]}>
                  <BarcodeFinder
                    width={rectDimensions}
                    height={rectDimensions}
                    borderColor={ColorMap.light}
                    borderWidth={2}
                  />
                </View>

                <View style={ScannerStyles.LeftAndRightOverlayStyle} />
              </View>
              <View style={ScannerStyles.BottomOverlayStyle}>
                <View style={BottomSubContentStyle}>
                  {!!error && <Warning style={BottomContentStyle} message={error} isDanger />}
                </View>
              </View>
            </View>
          }
        />
      </View>
    </SubWalletModal>
  );
};

export default React.memo(QrAddressScanner);
