import React, { useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SVGImages } from 'assets/index';
import { Keyboard, View } from 'react-native';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { InputConnectUrl } from 'components/Input/InputConnectUrl';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { Warning } from 'components/Warning';
import { addConnection } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';

const validateUri = (uri: string) => {
  const error = validWalletConnectUri(uri);
  if (error) {
    return [error];
  } else {
    return [];
  }
};

export const ConnectWalletConnect = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [loading, setLoading] = useState(false);
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const [isShowQrModalVisible, setQrModalVisible] = useState<boolean>(false);

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

        toast.hideAll();
        toast.show(message, { type: 'danger' });
        setLoading(false);
      });
  };

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  return (
    <ContainerWithSubHeader onPressBack={() => navigation.navigate('Home')} title={i18n.header.walletConnect}>
      <View style={{ paddingHorizontal: theme.padding, flex: 1, paddingTop: theme.padding }}>
        <Typography.Text
          style={{ ...FontMedium, color: theme.colorTextTertiary, textAlign: 'center', paddingHorizontal: 32 }}>
          {i18n.message.connectWalletConnectMessage}
        </Typography.Text>

        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 48 }}>
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
        style={{ marginHorizontal: 16, marginBottom: 16 }}
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
    </ContainerWithSubHeader>
  );
};
