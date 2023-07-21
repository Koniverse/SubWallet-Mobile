import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import Text from 'components/Text';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { CaretLeft, ImageSquare } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { BarCodeReadEvent } from 'react-native-camera';
import i18n from 'utils/i18n/i18n';
import ModalBase from 'components/Modal/Base/ModalBase';
import { rectDimensions } from 'constants/scanner';
import { IconButton } from 'components/IconButton';
import { Warning } from 'components/Warning';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface AddressScannerProps {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  error?: string;
  isShowError?: boolean;
}

const CancelButtonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  left: 16,
  zIndex: 10,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

const LibraryButtonStyle: StyleProp<ViewStyle> = {
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
  justifyContent: 'flex-end',
  marginHorizontal: 16,
  flex: 1,
};

export const AddressScanner = ({
  onPressCancel,
  onChangeAddress,
  qrModalVisible,
  error,
  isShowError = false,
}: AddressScannerProps) => {
  const theme = useSubWalletTheme().swThemes;
  const onSuccess = (e: BarCodeReadEvent) => {
    try {
      onChangeAddress(e.data);
      !isShowError && onPressCancel();
    } catch (err) {
      console.log(err);
    }
  };

  const onPressLibraryBtn = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    RNQRGenerator.detect({
      uri: result.assets && result.assets[0]?.uri,
    })
      .then(response => {
        onChangeAddress(response.values[0]);
        !isShowError && onPressCancel();
      })
      .catch(err => console.log(err));
  };

  return (
    <ModalBase isVisible={qrModalVisible} style={{ flex: 1, width: '100%', margin: 0 }}>
      <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={theme.colorBgSecondary} translucent={true} />
      <QRCodeScanner
        reactivate={true}
        reactivateTimeout={5000}
        showMarker={true}
        onRead={e => {
          onSuccess(e);
        }}
        containerStyle={ScannerStyles.ContainerStyle}
        cameraStyle={ScannerStyles.CameraStyle}
        topViewStyle={ScannerStyles.ContainerStyle}
        customMarker={
          <View style={ScannerStyles.RectangleContainerStyle}>
            <View style={ScannerStyles.TopOverlayStyle}>
              <View style={[ScannerStyles.HeaderStyle, { backgroundColor: theme.colorBgSecondary }]}>
                <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanQrCode}</Text>
                <IconButton icon={CaretLeft} style={CancelButtonStyle} onPress={onPressCancel} />
                <IconButton
                  icon={() => <Icon phosphorIcon={ImageSquare} weight={'fill'} size={'sm'} />}
                  style={LibraryButtonStyle}
                  onPress={onPressLibraryBtn}
                />
              </View>
            </View>
            <View style={ScannerStyles.CenterOverlayStyle}>
              <View style={ScannerStyles.LeftAndRightOverlayStyle} />

              <View style={ScannerStyles.RectangleStyle}>
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
              <View style={BottomSubContentStyle}>{!!error && <Warning message={error} isDanger />}</View>
              <View style={BottomSubContentStyle} />
            </View>
          </View>
        }
      />
    </ModalBase>
  );
};
