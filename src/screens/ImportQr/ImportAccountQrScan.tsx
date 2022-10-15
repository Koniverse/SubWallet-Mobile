import { decodeAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import Text from 'components/Text';
import { Warning } from 'components/Warning';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { ArrowLeft } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, StatusBar, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RootNavigationProps } from 'routes/index';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { ColorMap } from 'styles/color';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { overlayColor, rectDimensions } from 'constants/scanner';
import { BarCodeReadEvent } from 'react-native-camera';

const WrapperContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
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

const BottomContentStyle: StyleProp<ViewStyle> = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 16,
};

const SUBSTRATE_PREFIX = 'substrate';
const ETHEREUM_PREFIX = 'ethereum';
const SECRET_PREFIX = 'secret';

const ACCEPT_PREFIXES = [SECRET_PREFIX];

const renderError = (prefix: string): string => {
  return `${i18n.warningMessage.invalidPrefix} '${ACCEPT_PREFIXES.join(' or ')}', found '${prefix}'`;
};

const ImportAccountQrScan = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const [error, setError] = useState<string>('');

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRead = useCallback(
    (event: BarCodeReadEvent) => {
      try {
        const data = event.data;
        const arr: string[] = data.split(':');

        let prefix = arr[0];
        let content = '';
        let genesisHash = '';
        let name: string[] = [];
        let isEthereum = false;

        if (prefix === SUBSTRATE_PREFIX || prefix === SECRET_PREFIX) {
          [prefix, content, genesisHash, ...name] = arr;
          if (prefix === SUBSTRATE_PREFIX) {
            setError(renderError(prefix));
            return;
          }
        } else if (prefix === ETHEREUM_PREFIX) {
          [prefix, content, ...name] = arr;
          genesisHash = '';
          content = content.substring(0, 42);
          isEthereum = true;
          setError(renderError(prefix));
          return;
        } else {
          setError(renderError(prefix));
          return;
        }

        const isAddress = prefix !== SECRET_PREFIX;

        if (isAddress && !isEthereum) {
          decodeAddress(content);
        }

        setError('');
        navigation.navigate('ImportAccountQr', {
          screen: 'ImportAccountQrConfirm',
          params: {
            content,
            genesisHash,
            isAddress,
            isEthereum,
            name: name.length ? name.join(':') : undefined,
          },
        });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [navigation],
  );

  return (
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
                <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.importByQr}</Text>
                <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} style={BackButtonStyle} onPress={handleGoBack}>
                  <ArrowLeft size={20} weight={'bold'} color={ColorMap.light} />
                </TouchableOpacity>
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
              {!!error && (
                <View style={BottomContentStyle}>
                  <Warning message={error} isDanger />
                </View>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
};

export default React.memo(ImportAccountQrScan);
