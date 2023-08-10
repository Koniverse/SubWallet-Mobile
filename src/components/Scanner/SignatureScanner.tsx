import { isHex } from '@polkadot/util';
import Text from 'components/Text';
import { Warning } from 'components/Warning';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { ColorMap } from 'styles/color';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { SigData } from 'types/signer';
import { convertHexColorToRGBA } from 'utils/color';
import i18n from 'utils/i18n/i18n';
import { rectDimensions } from 'constants/scanner';
import { BarCodeReadEvent } from 'react-native-camera';
import { X } from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  setVisible: (arg: boolean) => void;
  onSuccess: (result: SigData) => void | Promise<void>;
}

const CancelButtonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  right: 16,
  zIndex: 10,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
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

const QrAddressScanner = ({ visible, onSuccess, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [error, setError] = useState<string>('');
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const onHideModal = () => modalBaseV2Ref?.current?.close();

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
        } else {
          const message = i18n.errorMessage.scanAgain;

          setError(message);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [onSuccess],
  );

  useEffect(() => {
    if (!visible) {
      setError('');
    }
  }, [visible]);

  return (
    <SwFullSizeModal
      modalVisible={visible}
      setVisible={setVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      onBackButtonPress={onHideModal}>
      <SafeAreaView edges={['top']} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={theme.colorBgSecondary} translucent={true} />
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
              <View style={[ScannerStyles.HeaderStyle, { backgroundColor: theme.colorBgSecondary }]}>
                <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.approveRequest}</Text>
                <IconButton icon={X} style={CancelButtonStyle} onPress={onHideModal} />
              </View>
              <View style={ScannerStyles.HeaderSubTitleStyle}>
                <Text style={ScannerStyles.HeaderSubTitleTextStyle}>{i18n.common.scanForApprove}</Text>
              </View>
            </View>
            <View style={ScannerStyles.CenterOverlayStyle}>
              <View style={[ScannerStyles.LeftAndRightOverlayStyle]} />

              <View style={ScannerStyles.RectangleStyle}>
                <BarcodeFinder
                  width={rectDimensions}
                  height={rectDimensions}
                  borderColor={ColorMap.light}
                  borderWidth={2}
                />
              </View>

              <View style={[ScannerStyles.LeftAndRightOverlayStyle]} />
            </View>
            <View style={ScannerStyles.BottomOverlayStyle}>
              <View style={BottomSubContentStyle}>
                {!!error && <Warning style={BottomContentStyle} message={error} isDanger />}
              </View>
            </View>
          </View>
        }
      />
    </SwFullSizeModal>
  );
};

export default React.memo(QrAddressScanner);
