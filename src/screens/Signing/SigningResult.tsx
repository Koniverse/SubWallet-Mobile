import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SubmitButton } from 'components/SubmitButton';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { CaretRight } from 'phosphor-react-native';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import ResultDetail from 'screens/Signing/Detail';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

const QrSize = 250;

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 24,
};

const ScrollViewContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
};

const ContentContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
  justifyContent: 'center',
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

const SubTitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  marginTop: 16,
  textAlign: 'center',
};

const ViewDetailContainerButtonStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 20,
};

const ViewDetailButtonStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const ViewDetailIconStyle: StyleProp<ViewStyle> = {
  marginLeft: 4,
};

const ViewDetailTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const SigningResult = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const { cleanup, state: scannerState } = useContext(ScannerContext);
  const { type } = scannerState;

  const [isVisible, setIsVisible] = useState(false);

  useHandlerHardwareBackPress(true);

  const closeModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const openModal = useCallback(() => {
    setIsVisible(true);
  }, []);

  const goHome = useCallback(() => {
    cleanup();
    navigation.replace('Home');
  }, [cleanup, navigation]);

  return (
    <ContainerWithSubHeader
      onPressBack={goHome}
      title={type === 'message' ? i18n.title.signMessage : i18n.title.signTransaction}>
      <ScrollView style={WrapperStyle} contentContainerStyle={ScrollViewContainerStyle}>
        <Text style={SubTitleTextStyle}>
          {type === 'message' ? i18n.common.scanSignatureToSignMessage : i18n.common.scanSignatureToSignTransaction}
        </Text>
        <View style={ContentContainerStyle}>
          <View style={QrContainerStyle}>
            <View style={QrStyle} />
          </View>
          <View style={ViewDetailContainerButtonStyle}>
            <TouchableOpacity style={ViewDetailButtonStyle} onPress={openModal}>
              <Text style={ViewDetailTextStyle}>{i18n.common.viewDetails}</Text>
              <CaretRight color={ColorMap.disabled} size={16} style={ViewDetailIconStyle} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={ActionContainerStyle}>
        <SubmitButton style={ButtonStyle} title={i18n.common.backToHome} onPress={goHome} />
      </View>
      <ResultDetail isVisible={isVisible} onClose={closeModal} />
    </ContainerWithSubHeader>
  );
};
// will delete
export default React.memo(SigningResult);
