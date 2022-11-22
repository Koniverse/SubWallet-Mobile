import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { PasswordField } from 'components/Field/Password';
import { TextField } from 'components/Field/Text';
import { SubmitButton } from 'components/SubmitButton';
import { SCANNER_QR_STEP } from 'constants/qr';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { getNetworkJsonByInfo } from 'utils/network';

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

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
};

const SigningConfirm = () => {
  const navigation = useNavigation<RootNavigationProps>();

  useHandlerHardwareBackPress(true);

  const { cleanup, state: scannerState, signDataLegacy } = useContext(ScannerContext);

  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  const { senderAddress, step, isEthereumStructure, genesisHash, evmChainId } = scannerState;

  const account = useGetAccountByAddress(senderAddress || '');

  const network = useMemo(() => {
    const info: undefined | number | string = isEthereumStructure ? evmChainId : genesisHash;
    return getNetworkJsonByInfo(networkMap, isEthereumAddress(account?.address || ''), isEthereumStructure, info);
  }, [account?.address, evmChainId, genesisHash, isEthereumStructure, networkMap]);

  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const onSubmit = useCallback(
    (formState: FormState) => {
      const password = formState.data.password;

      setIsBusy(true);
      signDataLegacy(false, password)
        .catch(e => {
          if (e) {
            setError((e as Error).message);
          } else {
            setError(i18n.errorMessage.unknownError);
          }
        })
        .finally(() => {
          setIsBusy(false);
        });
    },
    [signDataLegacy],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, { onSubmitForm: onSubmit });

  const handleChangePassword = useCallback(
    (val: string) => {
      setError('');
      onChangeValue('password')(val);
    },
    [onChangeValue],
  );

  const onPressSubmit = useCallback(() => {
    onSubmit(formState);
  }, [formState, onSubmit]);

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
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.title.signTransaction} disabled={isBusy}>
      <>
        <ScrollView style={WrapperStyle}>
          <Text style={SubTitleTextStyle}>Approve request with this account</Text>
          <TextField text={account?.name || ''} disabled={true} label={i18n.common.accountName} />
          <AddressField
            address={account?.address || ''}
            disableText={true}
            label={i18n.common.accountAddress}
            showRightIcon={false}
            networkPrefix={network?.ss58Format}
          />
          <PasswordField
            ref={formState.refs.password}
            label={formState.labels.password}
            defaultValue={formState.data.password}
            isBusy={isBusy}
            onChangeText={handleChangePassword}
            errorMessages={error ? [error] : []}
            onSubmitField={onSubmitField('password')}
          />
        </ScrollView>
        <View style={ActionContainerStyle}>
          <SubmitButton
            backgroundColor={ColorMap.dark2}
            style={ButtonStyle}
            title={i18n.common.cancel}
            disabled={isBusy}
            onPress={goBack}
          />
          <SubmitButton style={ButtonStyle} title={i18n.common.approve} isBusy={isBusy} onPress={onPressSubmit} />
        </View>
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(SigningConfirm);
