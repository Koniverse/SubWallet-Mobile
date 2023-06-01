import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { TextField } from 'components/Field/Text';
import { SCANNER_QR_STEP } from 'constants/qr';
import useGetAccountAndNetworkScanned from 'hooks/screen/Signing/useGetAccountAndNetworkScanned';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import PasswordModal from 'components/Modal/PasswordModal';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { Button } from 'components/design-system-ui';

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
};

const SubTitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
  marginTop: 16,
  marginBottom: 24,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 16 - 4,
  display: 'flex',
  flexDirection: 'row',
  marginVertical: 16,
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 4,
  flex: 1,
};

const SigningConfirm = () => {
  const navigation = useNavigation<RootNavigationProps>();

  useHandlerHardwareBackPress(true);

  const {
    cleanup,
    state: { step, type },
    signDataLegacy,
  } = useContext(ScannerContext);

  const { account, network } = useGetAccountAndNetworkScanned();
  const [isBusy, setIsBusy] = useState(false);
  const [isVisible, setVisible] = useState<boolean>(false);
  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);

  const onSubmit = (password: string) => {
    setIsBusy(true);
    setVisible(false);
    signDataLegacy(false, password)
      .catch(e => {
        if (e) {
          setErrorArr([(e as Error).message]);
        } else {
          setErrorArr([i18n.errorMessage.unknownError]);
        }
        setIsBusy(false);
        setTimeout(() => setVisible(true), HIDE_MODAL_DURATION);
      })
      .finally(() => {
        setIsBusy(false);
      });
  };

  const goBack = useCallback(() => {
    cleanup();
    navigation.goBack();
  }, [cleanup, navigation]);

  useEffect(() => {
    if (!account) {
      cleanup();
      navigation.goBack();
    }
  }, [account, cleanup, navigation]);

  useEffect(() => {
    if (step === SCANNER_QR_STEP.FINAL_STEP) {
      navigation.navigate('SigningAction', { screen: 'SigningResult' });
    }
  }, [navigation, step]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={type === 'message' ? i18n.title.signMessage : i18n.title.signTransaction}
      disabled={isBusy}>
      <>
        <ScrollView style={WrapperStyle}>
          <Text style={SubTitleTextStyle}>{i18n.signingAction.approveRequestThisAcc}</Text>
          <TextField text={account?.name || ''} disabled={true} label={i18n.common.accountName} />
          <AddressField
            address={account?.address || ''}
            disableText={true}
            label={i18n.common.accountAddress}
            showRightIcon={false}
            networkPrefix={network?.ss58Format}
          />
        </ScrollView>
        <View style={ActionContainerStyle}>
          <Button type={'secondary'} style={ButtonStyle} disabled={isBusy} onPress={goBack}>
            {i18n.common.cancel}
          </Button>
          <Button style={ButtonStyle} loading={isBusy} onPress={() => setVisible(true)}>
            {i18n.buttonTitles.approve}
          </Button>
        </View>

        <PasswordModal
          visible={isVisible}
          closeModal={() => setVisible(false)}
          isBusy={isBusy}
          onConfirm={onSubmit}
          errorArr={errorArr}
          setErrorArr={setErrorArr}
        />
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(SigningConfirm);
