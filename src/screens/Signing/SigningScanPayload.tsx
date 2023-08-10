import { useNavigation } from '@react-navigation/native';
import Text from 'components/Text';
import { Warning } from 'components/Warning';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { SCANNER_QR_STEP } from 'constants/qr';
import { rectDimensions } from 'constants/scanner';
import usePayloadScanner from 'hooks/qr/usePayloadScanner';
import { ArrowLeft } from 'phosphor-react-native';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Bar as ProgressBar } from 'react-native-progress';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RootNavigationProps } from 'routes/index';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { ColorMap } from 'styles/color';
import { ScannerStyles } from 'styles/scanner';
import { FontMedium, FontSize0, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { convertHexColorToRGBA } from 'utils/color';
import i18n from 'utils/i18n/i18n';
import { Button } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  width: '100%',
  margin: 0,
};

const BackButtonStyle: StyleProp<ViewStyle> = {
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
  justifyContent: 'center',
  marginHorizontal: 16,
  flex: 1,
};

const BottomContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: convertHexColorToRGBA(ColorMap.dark1, 0.5),
};

const ProgressContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 24,
};

const ProgressTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontSize0,
  ...FontMedium,
  color: ColorMap.light,
  textAlign: 'right',
};

const ProgressButtonStyle: StyleProp<ViewStyle> = {
  marginTop: 24,
  borderWidth: 1,
  borderColor: ColorMap.borderButtonColor,
};

const SigningScanPayload = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const {
    state: { totalFrameCount, completedFramesCount, step },
    clearMultipartProgress,
  } = useContext(ScannerContext);

  const [error, setError] = useState('');

  const onScan = usePayloadScanner(setError);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onStartOver = useCallback(() => {
    setError('');
    clearMultipartProgress();
  }, [clearMultipartProgress]);

  useEffect(() => {
    if (step === SCANNER_QR_STEP.CONFIRM_STEP) {
      navigation.navigate('SigningAction', { screen: 'SigningConfirm' });
    }
  }, [navigation, step]);

  return (
    <View style={WrapperStyle}>
      <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={theme.colorBgSecondary} translucent={true} />
      <QRCodeScanner
        reactivate={true}
        reactivateTimeout={100}
        vibrate={false}
        showMarker={true}
        onRead={onScan}
        containerStyle={ScannerStyles.ContainerStyle}
        cameraStyle={ScannerStyles.CameraStyle}
        topViewStyle={ScannerStyles.ContainerStyle}
        customMarker={
          <View style={ScannerStyles.RectangleContainerStyle}>
            <View style={ScannerStyles.TopOverlayStyle}>
              <View style={[ScannerStyles.HeaderStyle, { backgroundColor: theme.colorBgSecondary }]}>
                <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanPayload}</Text>
                <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} style={BackButtonStyle} onPress={goBack}>
                  <ArrowLeft size={20} weight={'bold'} color={'#FFF'} />
                </TouchableOpacity>
              </View>
              <View style={ScannerStyles.HeaderSubTitleStyle}>
                <Text style={ScannerStyles.HeaderSubTitleTextStyle}>{i18n.common.scanQrPayload}</Text>
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
              {totalFrameCount > 1 && (
                <View style={BottomSubContentStyle}>
                  <View style={ProgressContainerStyle}>
                    <ProgressBar
                      progress={completedFramesCount / totalFrameCount}
                      width={rectDimensions}
                      borderRadius={40}
                      color={ColorMap.secondary}
                      unfilledColor={ColorMap.light}
                      borderColor={ColorMap.transparent}
                      borderWidth={0}
                      height={4}
                    />
                    <Text style={ProgressTextStyle}>
                      {completedFramesCount}/{totalFrameCount}
                    </Text>
                    <Button type={'secondary'} style={ProgressButtonStyle} onPress={onStartOver}>
                      {i18n.common.startOver}
                    </Button>
                  </View>
                </View>
              )}
              <View style={BottomSubContentStyle}>
                {!!error && <Warning style={BottomContentStyle} message={error} isDanger />}
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default React.memo(SigningScanPayload);
