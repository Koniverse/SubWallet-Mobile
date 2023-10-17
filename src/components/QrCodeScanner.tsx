import React from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { ScannerStyles } from 'styles/scanner';
import { StyleProp, View, ViewStyle } from 'react-native';
import Text from 'components/Text';
import i18n from 'utils/i18n/i18n';
import { IconButton } from 'components/IconButton';
import { CaretLeft, ImageSquare, Info } from 'phosphor-react-native';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { Warning } from 'components/Warning';
import { Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { BarCodeReadEvent } from 'react-native-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface Props {
  error?: string;
  onPressLibraryBtn?: () => Promise<void>;
  onPressCancel: () => void;
  onSuccess: (e: BarCodeReadEvent) => void;
}

export const QrCodeScanner = ({ error, onPressLibraryBtn, onPressCancel, onSuccess }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
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
            <SafeAreaView edges={['top']} />
            <View style={[ScannerStyles.HeaderStyle]}>
              <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanQrCode}</Text>
              <IconButton icon={CaretLeft} size={24} style={CancelButtonStyle} onPress={onPressCancel} />
              <IconButton icon={Info} size={24} style={LibraryButtonStyle} />
            </View>
          </View>
          <View style={ScannerStyles.CenterOverlayStyle}>
            <View style={ScannerStyles.LeftAndRightOverlayStyle} />

            <View style={ScannerStyles.RectangleStyle}>
              <BarcodeFinder />
            </View>

            <View style={ScannerStyles.LeftAndRightOverlayStyle} />
          </View>
          <View style={ScannerStyles.BottomOverlayStyle}>
            <View style={[BottomSubContentStyle, { marginBottom: theme.padding }]}>
              {!!error && <Warning message={error} isDanger />}
            </View>
            {onPressLibraryBtn && (
              <Button
                icon={<Icon phosphorIcon={ImageSquare} weight={'fill'} />}
                type={'secondary'}
                onPress={onPressLibraryBtn}>
                {i18n.buttonTitles.uploadFromPhotos}
              </Button>
            )}
            <View style={BottomSubContentStyle} />
          </View>
        </View>
      }
    />
  );
};
