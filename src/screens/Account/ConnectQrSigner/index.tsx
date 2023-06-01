// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageLogosMap } from 'assets/logo';
import { UnlockModal } from 'components/common/Modal/UnlockModal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, Image } from 'components/design-system-ui';
import { SWImageProps } from 'components/design-system-ui/image';
import DualLogo from 'components/Logo/DualLogo';
import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import { SCAN_TYPE } from 'constants/qr';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useModalScanner from 'hooks/qr/useModalScanner';
import useGoHome from 'hooks/screen/useGoHome';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createAccountExternalV2 } from 'messaging/index';
import { QrCode, X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ImageRequireSource, Text, View } from 'react-native';
import { Source } from 'react-native-fast-image';
import { useToast } from 'react-native-toast-notifications';
import { RootStackParamList } from 'routes/index';
import { QrAccount } from 'types/qr/attach';
import { backToHome } from 'utils/navigation';
import createStyle from './styles';
import i18n from 'utils/i18n/i18n';

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
  // useAutoNavigateToCreatePassword();

  const { description, logoUrl, subTitle, title } = props;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();

  const styles = useMemo(() => createStyle(theme), [theme]);
  const goHome = useGoHome();

  const onComplete = useCallback(() => {
    backToHome(goHome);
  }, [goHome]);
  const onBack = navigation.goBack;

  const accountName = useGetDefaultAccountName();

  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    (account: QrAccount) => {
      setLoading(true);

      setTimeout(() => {
        createAccountExternalV2({
          name: accountName,
          address: account.content,
          genesisHash: '',
          isEthereum: account.isEthereum,
          isAllowed: true,
          isReadOnly: false,
        })
          .then(errors => {
            if (errors.length) {
              toast.show(errors[0].message);
            } else {
              onComplete();
            }
          })
          .catch((error: Error) => {
            toast.show(error.message);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    },
    [accountName, onComplete, toast],
  );

  const { onOpenModal, onScan, isScanning, onHideModal } = useModalScanner(onSubmit);
  const {
    visible: unlockVisible,
    onPasswordComplete,
    onPress: onPressSubmit,
    onHideModal: onHidePasswordModal,
  } = useUnlockModal();

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
          {/*<Text style={styles.description}>*/}
          {/*  <Text>&nbsp;Follow&nbsp;</Text>*/}
          {/*  <Text style={styles.highLight}>this instructions</Text>*/}
          {/*  <Text>&nbsp; for more details</Text>*/}
          {/*</Text>*/}
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          icon={<Icon phosphorIcon={QrCode} weight="fill" />}
          onPress={onPressSubmit(onOpenModal)}
          loading={loading}>
          {loading ? i18n.buttonTitles.creating : i18n.buttonTitles.scanQrCode}
        </Button>
      </View>
      <QrAddressScanner visible={isScanning} onHideModal={onHideModal} onSuccess={onScan} type={SCAN_TYPE.QR_SIGNER} />
      <UnlockModal onPasswordComplete={onPasswordComplete} visible={unlockVisible} onHideModal={onHidePasswordModal} />
    </ContainerWithSubHeader>
    // </Layout.WithSubHeaderOnly>
  );
};

export default ConnectQrSigner;
