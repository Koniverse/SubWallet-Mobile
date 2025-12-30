import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SVGImages } from 'assets/index';
import { Keyboard, Linking, StyleSheet, View } from 'react-native';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { InputConnectUrl } from 'components/Input/InputConnectUrl';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { Warning } from 'components/Warning';
import { addConnection } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';
import { XCircle } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { mmkvStore } from 'utils/storage';

const validateUri = (uri: string) => {
  const error = validWalletConnectUri(uri);
  if (error) {
    return [error];
  } else {
    return [];
  }
};

const faqUrl =
  'https://docs.subwallet.app/main/extension-user-guide/faqs#i-see-connection-unsuccessful-pop-up-when-connecting-to-dapp-via-walletconnect';

interface ConnectionError {
  message: string;
  isConnectionBlockedError?: boolean;
}

const connectionErrorDefault: ConnectionError = {
  message: 'Connection unsuccessful. Review our user guide and try connecting again.',
};
const keyRecords = 'unsuccessful_connect_wc_modal';
let idTimeOut: NodeJS.Timeout;
const getTimeOutRecords = () => {
  return JSON.parse(mmkvStore.getString('general.time-out-record') || '{}') as Record<string, number>;
};

export const ConnectWalletConnect = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [isShowQrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<ConnectionError>(connectionErrorDefault);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);

  const formConfig = useMemo((): FormControlConfig => {
    return {
      uri: {
        name: 'URI',
        value: '',
        require: true,
        validateFunc: validateUri,
      },
    };
  }, []);

  const convertWCErrorMessage = useCallback((e: Error): ConnectionError => {
    const message = e.message.toLowerCase();
    let newStandardMessage = 'Connection unsuccessful. Review our user guide and try connecting again.';
    let isConnectionBlockedError = false;

    if (message.includes('socket hang up') || message.includes('stalled') || message.includes('interrupted')) {
      newStandardMessage =
        'Turn off VPN/ad blocker apps, reload the dApp, and try again. If the issue persists, contact support at agent@subwallet.app';
      isConnectionBlockedError = true;
    }

    if (message.includes('failed for host')) {
      newStandardMessage =
        'Turn off some networks on the wallet or close any privacy protection apps (e.g. VPN, ad blocker apps) and try again. If the issue persists, contact support at agent@subwallet.app';
      isConnectionBlockedError = true;
    }

    return { message: newStandardMessage, isConnectionBlockedError };
  }, []);

  const reOpenModalWhenTimeOut = useCallback(() => {
    const timeOutRecord = getTimeOutRecords();

    if (timeOutRecord[keyRecords]) {
      setLoading(false);
      setErrorModalVisible(false);
    }
  }, []);

  useEffect(() => {
    const timeOutRecord = getTimeOutRecords();

    if (loading && !errorModalVisible && !timeOutRecord[keyRecords]) {
      idTimeOut = setTimeout(reOpenModalWhenTimeOut, 20000);
      mmkvStore.set('general.time-out-record', JSON.stringify({ ...timeOutRecord, [keyRecords]: idTimeOut }));
    } else if (timeOutRecord[keyRecords]) {
      setLoading(false);
    }
  }, [errorModalVisible, loading, reOpenModalWhenTimeOut]);

  const onPressFAQ = useCallback((isDismiss: boolean) => {
    return () => {
      const timeOutRecord = getTimeOutRecords();

      clearTimeout(idTimeOut);
      delete timeOutRecord[keyRecords];
      !isDismiss && Linking.openURL(faqUrl);
      setErrorModalVisible(false);
      mmkvStore.set('general.time-out-record', JSON.stringify(timeOutRecord));
    };
  }, []);

  const onSubmit = () => {
    const currentUri = formState.data.uri;
    if (!currentUri) {
      return;
    }
    setLoading(true);

    addConnection({ uri: currentUri })
      .then(() => {
        setLoading(false);
        navigation.goBack();
      })
      .catch(e => {
        const errMessage = (e as Error).message;
        const message = errMessage.includes('Pairing already exists')
          ? i18n.errorMessage.connectionAlreadyExist
          : i18n.errorMessage.failToAddConnection;
        setConnectionError(convertWCErrorMessage(e));
        toast.hideAll();
        toast.show(message, { type: 'danger' });
        setLoading(false);
      });
  };

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const footerErrorModal = useMemo(() => {
    if (connectionError?.isConnectionBlockedError) {
      return <Button onPress={onPressFAQ(true)}>{'I understand'}</Button>;
    }

    return (
      <View>
        <Button onPress={onPressFAQ(true)} type={'secondary'}>
          {'Dismiss'}
        </Button>
        <Button onPress={onPressFAQ(false)} type={'secondary'}>
          {'Review guide'}
        </Button>
        <Button />
      </View>
    );
  }, [connectionError?.isConnectionBlockedError, onPressFAQ]);

  return (
    <ContainerWithSubHeader onPressBack={() => navigation.navigate('Home')} title={i18n.header.walletConnect}>
      <View style={styles.contentWrapper}>
        <Typography.Text style={styles.messageText}>{i18n.message.connectWalletConnectMessage}</Typography.Text>

        <View style={styles.pageIconStyle}>
          <PageIcon
            customIcon={<SVGImages.WalletConnect width={64} height={64} color={theme.colorPrimary} />}
            color={theme.colorPrimary}
          />
        </View>

        <InputConnectUrl
          ref={formState.refs.uri}
          containerStyle={{ marginBottom: theme.sizeSM }}
          label={formState.labels.uri}
          value={formState.data.uri}
          onChangeText={onChangeValue('uri')}
          isValidValue={formState.isValidated.uri}
          placeholder={i18n.placeholder.connectWalletPlaceholder}
          disabled={loading}
          onSubmitEditing={formState.errors.uri.length > 0 ? () => Keyboard.dismiss() : onSubmitField('uri')}
          isShowQrModalVisible={isShowQrModalVisible}
          setQrModalVisible={setQrModalVisible}
          setLoading={setLoading}
        />

        {formState.errors.uri.length > 0 &&
          formState.errors.uri.map((message, index) => <Warning isDanger message={message} key={index} />)}
      </View>
      <Button
        disabled={!formState.isValidated.uri || loading}
        loading={loading}
        style={styles.connectButtonStyle}
        onPress={onSubmit}
        icon={
          <SVGImages.WalletConnect
            width={24}
            height={24}
            color={!formState.isValidated.uri || loading ? theme.colorTextLight5 : theme.colorWhite}
          />
        }>
        {i18n.common.connect}
      </Button>

      <SwModal
        modalVisible={errorModalVisible}
        onChangeModalVisible={() => setErrorModalVisible(false)}
        setVisible={setErrorModalVisible}
        footer={footerErrorModal}
        modalTitle={'Connection unsuccessful'}>
        <>
          <PageIcon icon={XCircle} color={theme.colorError} />
          <Typography.Text>{connectionError.message}</Typography.Text>
        </>
      </SwModal>
    </ContainerWithSubHeader>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    contentWrapper: { paddingHorizontal: theme.padding, flex: 1, paddingTop: theme.padding },
    messageText: { ...FontMedium, color: theme.colorTextTertiary, textAlign: 'center', paddingHorizontal: 32 },
    pageIconStyle: { alignItems: 'center', paddingTop: 40, paddingBottom: 48 },
    connectButtonStyle: { marginHorizontal: 16, marginBottom: 16 },
  });
}
