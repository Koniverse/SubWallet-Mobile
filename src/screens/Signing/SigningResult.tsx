import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SubmitButton } from 'components/SubmitButton';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

const QrSize = 250;

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 24,
};

const QrContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const QrStyle: StyleProp<ViewStyle> = {
  borderWidth: 2,
  borderColor: ColorMap.light,
  width: QrSize,
  height: QrSize,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 16,
  display: 'flex',
  flexDirection: 'row',
  marginVertical: 16,
};

const ButtonStyle: StyleProp<ViewStyle> = {
  flex: 1,
};

const SigningResult = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const { cleanup, state: scannerState } = useContext(ScannerContext);

  useHandlerHardwareBackPress(true);

  const { signedData } = scannerState;

  const goHome = useCallback(() => {
    cleanup();
    navigation.replace('Home');
  }, [cleanup, navigation]);

  return (
    <ContainerWithSubHeader onPressBack={() => {}} title={i18n.title.signTransaction} showLeftBtn={false}>
      <ScrollView style={WrapperStyle}>
        <View style={QrContainerStyle}>
          <View style={QrStyle}>
            <QRCode value={signedData} size={QrSize - 2 * 2} />
          </View>
        </View>
      </ScrollView>
      <View style={ActionContainerStyle}>
        <SubmitButton style={ButtonStyle} title={i18n.common.backToHome} onPress={goHome} />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(SigningResult);
