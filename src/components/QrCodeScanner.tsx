import React, { useEffect, useRef, useState } from 'react';
import { ScannerStyles } from 'styles/scanner';
import { AppState, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from 'components/Text';
import i18n from 'utils/i18n/i18n';
import { IconButton } from 'components/IconButton';
import { CaretLeftIcon, ImageSquareIcon } from 'phosphor-react-native';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { Warning } from 'components/Warning';
import { Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const CancelButtonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  left: 16,
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
  onSuccess: (value: string) => void;
}

export const QrCodeScanner = ({ error, onPressLibraryBtn, onPressCancel, onSuccess }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(true);
  const scannedRef = useRef(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      setIsActive(state === 'active');
    });

    return () => sub.remove();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (scannedRef.current) {
        return;
      }

      const value = codes[0]?.value;

      if (value) {
        scannedRef.current = true;
        onSuccess(value);

        setTimeout(() => {
          scannedRef.current = false;
        }, 5000);
      }
    }
  })

  // if (!device) {
  //   return null;
  // }

  return (
    <View style={{ width: '100%', height: '100%' }}>
      {device && <Camera  device={device} isActive={isActive} style={StyleSheet.absoluteFill} codeScanner={codeScanner} />}

      <View style={ScannerStyles.RectangleContainerStyle}>
        <View style={ScannerStyles.TopOverlayStyle}>
          <SafeAreaView edges={['top']} />
          <View style={ScannerStyles.HeaderStyle}>
            <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanQrCode}</Text>

            <IconButton icon={CaretLeftIcon} size={24} style={CancelButtonStyle} onPress={onPressCancel} />
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
              icon={<Icon phosphorIcon={ImageSquareIcon} weight="fill" />}
              type="secondary"
              onPress={onPressLibraryBtn}>
              {i18n.buttonTitles.uploadFromPhotos}
            </Button>
          )}

          <View style={BottomSubContentStyle} />
        </View>
      </View>
    </View>
  );
};
