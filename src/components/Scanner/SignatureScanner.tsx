import { isHex } from '@polkadot/util';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { ScannerStyles } from 'styles/scanner';
import { SigData } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { BarCodeReadEvent } from 'react-native-camera';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import ModalBase from 'components/Modal/Base/ModalBase';
import { QrCodeScanner } from 'components/QrCodeScanner';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  setVisible: (arg: boolean) => void;
  onSuccess: (result: SigData) => void | Promise<void>;
}

const QrAddressScanner = ({ visible, onSuccess, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [error, setError] = useState<string>('');
  const insets = useSafeAreaInsets();
  const onHideModal = () => setVisible(false);

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

  const onPressLibraryBtn = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    RNQRGenerator.detect({
      uri: result.assets && result.assets[0]?.uri,
    })
      .then(response => {
        const signature = `0x${response.values[0]}`;
        if (isHex(signature)) {
          setError('');
          onSuccess({
            signature: signature,
          });
        } else {
          const message = i18n.errorMessage.scanAgain;

          setError(message);
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <ModalBase
      isVisible={visible}
      style={{ flex: 1, width: '100%', margin: 0 }}
      isUseForceHidden={false}
      onBackButtonPress={onHideModal}>
      <View style={[ScannerStyles.SafeAreaStyle, { backgroundColor: theme.colorBgSecondary, paddingTop: insets.top }]} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={theme.colorBgSecondary} translucent={true} />
      <QrCodeScanner
        onPressCancel={onHideModal}
        onPressLibraryBtn={onPressLibraryBtn}
        onSuccess={handleRead}
        error={error}
      />
    </ModalBase>
  );
};

export default React.memo(QrAddressScanner);
