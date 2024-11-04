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
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createAccountExternalV2 } from 'messaging/index';
import { QrCode, X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ImageRequireSource, Linking, Text, View } from 'react-native';
import { Source } from 'react-native-fast-image';
import { useToast } from 'react-native-toast-notifications';
import { RootStackParamList } from 'routes/index';
import { QrAccount } from 'types/qr/attach';
import createStyle from './styles';
import i18n from 'utils/i18n/i18n';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AccountNameModal } from 'components/Modal/AccountNameModal';
import { AccountProxyType } from '@subwallet/extension-base/types';

interface Props {
  title: string;
  subTitle: string;
  description: string;
  instructionUrl: string;
  logoUrl: Source | ImageRequireSource;
}

const imageProps: Omit<SWImageProps, 'src'> = {
  squircleSize: 56,
  style: { width: 56, height: 56 },
  resizeMode: 'contain',
};

const ConnectQrSigner: React.FC<Props> = (props: Props) => {
  const { description, logoUrl, subTitle, title, instructionUrl } = props;
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const [scannedAccount, setScannedAccount] = useState<QrAccount>();
  const [accountNameModalVisible, setAccountNameModalVisible] = useState<boolean>(false);
  const styles = useMemo(() => createStyle(theme), [theme]);
  const goHome = useGoHome();

  const onComplete = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);
  const onBack = navigation.goBack;

  const [loading, setLoading] = useState(false);

  const accountAddressValidator = useCallback(
    (_scannedAccount: QrAccount) => {
      if (_scannedAccount?.content) {
        for (const account of accounts) {
          // todo: Recheck this logic with master account
          if (isSameAddress(account.address, _scannedAccount.content)) {
            return Promise.reject(new Error('Account already exists'));
          }
        }
      }

      return Promise.resolve();
    },
    [accounts],
  );

  const onPreSubmit = (account: QrAccount) => {
    onHideModal();
    accountAddressValidator(account)
      .then(() => {
        setScannedAccount(account);
        setAccountNameModalVisible(true);
      })
      .catch((error: Error) => {
        toast.show(error.message, { type: 'danger' });
      });
  };

  const onSubmit = useCallback(
    (name: string) => {
      if (scannedAccount) {
        setLoading(true);

        setTimeout(() => {
          createAccountExternalV2({
            name,
            address: scannedAccount.content,
            genesisHash: '',
            isAllowed: true,
            isReadOnly: false,
          })
            .then(errors => {
              if (errors.length) {
                toast.show(errors[0].message, { type: 'danger' });
              } else {
                onComplete();
              }
            })
            .catch((error: Error) => {
              toast.show(error.message, { type: 'danger' });
            })
            .finally(() => {
              setLoading(false);
            });
        }, 300);
      }
    },
    [onComplete, scannedAccount, toast],
  );

  const { onOpenModal, onScan, isScanning, onHideModal, setIsScanning } = useModalScanner(onPreSubmit);
  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  return (
    <ContainerWithSubHeader title={title} onPressBack={onBack} rightIcon={X} onPressRightIcon={goHome}>
      <View style={styles.body}>
        <Text style={styles.subTitle}>{subTitle}</Text>
        <View>
          <DualLogo
            leftLogo={<Image {...imageProps} src={ImageLogosMap.subwallet} />}
            rightLogo={<Image {...imageProps} src={logoUrl} />}
          />
        </View>
        <View>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.description}>
            <Text>{i18n.attachAccount.readThisInstructionForMoreDetailsP1}</Text>
            <Text style={styles.highLight} onPress={() => Linking.openURL(instructionUrl)}>
              {i18n.attachAccount.readThisInstructionForMoreDetailsP2}
            </Text>
            <Text>{i18n.attachAccount.readThisInstructionForMoreDetailsP3}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          disabled={loading}
          icon={<Icon phosphorIcon={QrCode} weight="fill" />}
          onPress={onPressSubmit(onOpenModal)}
          loading={loading}>
          {loading ? i18n.buttonTitles.creating : i18n.buttonTitles.scanQrCode}
        </Button>
      </View>
      <QrAddressScanner
        visible={isScanning}
        onHideModal={onHideModal}
        onSuccess={onScan}
        type={SCAN_TYPE.QR_SIGNER}
        setQrModalVisible={setIsScanning}
      />
      <>
        {accountNameModalVisible && (
          <AccountNameModal
            modalVisible={accountNameModalVisible}
            setModalVisible={setAccountNameModalVisible}
            accountType={AccountProxyType.QR}
            isLoading={loading}
            onSubmit={onSubmit}
          />
        )}
      </>
    </ContainerWithSubHeader>
  );
};

export default ConnectQrSigner;
