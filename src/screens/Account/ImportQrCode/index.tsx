// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageLogosMap } from 'assets/logo';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, Image } from 'components/design-system-ui';
import { SWImageProps } from 'components/design-system-ui/image';
import DualLogo from 'components/Logo/DualLogo';
import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import { SCAN_TYPE } from 'constants/qr';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useModalScanner from 'hooks/qr/useModalScanner';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { checkPublicAndPrivateKey, createAccountWithSecret } from 'messaging/index';
import { QrCode, Scan } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { RootStackParamList } from 'routes/index';
import { QrAccount } from 'types/qr/attach';
import createStyle from './styles';
import i18n from 'utils/i18n/i18n';
import { IMPORT_QR_CODE_URL } from 'constants/index';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { AccountNameModal } from 'components/Modal/AccountNameModal';
import { AccountProxyType } from '@subwallet/extension-base/types';

type Props = {};

const checkAccount = (qrAccount: QrAccount): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    checkPublicAndPrivateKey(qrAccount.genesisHash, qrAccount.content)
      .then(({ errorMessage, isEthereum, isValid }) => {
        if (isValid) {
          resolve(isEthereum);
        } else {
          reject(new Error(errorMessage || 'Invalid qr'));
        }
      })
      .catch((e: Error) => {
        reject(e);
      });
  });
};

const imageProps: Omit<SWImageProps, 'src'> = {
  squircleSize: 56,
  style: { width: 56, height: 56 },
  resizeMode: 'contain',
};

const ImportQrCode: React.FC<Props> = (props: Props) => {
  const {} = props;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const [accountNameModalVisible, setAccountNameModalVisible] = useState<boolean>(false);
  const [scannedAccount, setScannedAccount] = useState<QrAccount>();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const onComplete = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  const onBack = navigation.goBack;

  const [loading, setLoading] = useState(false);

  const accountAddressValidator = useCallback((_scannedAccount: QrAccount) => {
    const { promise, reject, resolve } = createPromiseHandler<void>();

    if (_scannedAccount) {
      setTimeout(() => {
        checkAccount(_scannedAccount)
          .then(isEthereum => {
            setScannedAccount({
              ..._scannedAccount,
              isEthereum,
            });

            resolve();
          })
          .catch((error: Error) => {
            reject(error);
          });
      }, 300);
    } else {
      reject(new Error('Invalid QR code'));
    }

    return promise;
  }, []);

  const onPreSubmit = (preSubmitAccount: QrAccount) => {
    onHideModal();
    accountAddressValidator(preSubmitAccount)
      .then(() => {
        setTimeout(() => {
          setAccountNameModalVisible(true);
        }, 1000);
      })
      .catch((error: Error) => {
        toast.show(error.message, { type: 'danger' });
        setLoading(false);
      });
  };

  const onSubmit = useCallback(
    (name: string) => {
      setLoading(true);

      if (scannedAccount) {
        createAccountWithSecret({
          name,
          isAllow: true,
          secretKey: scannedAccount.content,
          publicKey: scannedAccount.genesisHash,
          isEthereum: scannedAccount.isEthereum,
        })
          .then(({ errors, success }) => {
            if (success) {
              onComplete();
            } else {
              toast.show(errors[0].message, { type: 'danger' });
            }
          })
          .catch((error: Error) => {
            toast.show(error.message, { type: 'danger' });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [onComplete, scannedAccount, toast],
  );

  const { onOpenModal, onScan, isScanning, onHideModal, setIsScanning } = useModalScanner(onPreSubmit);
  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  return (
    <ContainerWithSubHeader title={i18n.header.importByQRCode} onPressBack={onBack}>
      <View style={styles.body}>
        <Text style={styles.subTitle}>{i18n.importAccount.importQrCodeMessage1}</Text>
        <View>
          <DualLogo
            leftLogo={<Image {...imageProps} src={ImageLogosMap.subwallet} />}
            linkIcon={<Icon phosphorIcon={Scan} size="md" />}
            rightLogo={<Image {...imageProps} src={ImageLogosMap.__qr_code__} />}
          />
        </View>
        <View>
          <Text style={styles.description}>
            <Text>{i18n.importAccount.importQrCodeMessage2}</Text>
            <Text style={styles.highLight} onPress={() => Linking.openURL(IMPORT_QR_CODE_URL)}>
              {' '}
              {i18n.attachAccount.readThisInstructionForMoreDetailsP2}
            </Text>
            <Text>{i18n.attachAccount.readThisInstructionForMoreDetailsP3}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          icon={<Icon phosphorIcon={QrCode} weight="fill" />}
          onPress={onPressSubmit(onOpenModal)}
          loading={loading}
          disabled={loading}>
          {loading ? i18n.buttonTitles.creating : i18n.buttonTitles.scanQrCode}
        </Button>
      </View>
      <QrAddressScanner
        visible={isScanning}
        onHideModal={onHideModal}
        onSuccess={onScan}
        type={SCAN_TYPE.SECRET}
        setQrModalVisible={setIsScanning}
      />
      <>
        {accountNameModalVisible && (
          <AccountNameModal
            modalVisible={accountNameModalVisible}
            setModalVisible={setAccountNameModalVisible}
            accountType={AccountProxyType.SOLO}
            isLoading={loading}
            onSubmit={onSubmit}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};

export default ImportQrCode;
