import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Keyboard, ScrollView, View } from 'react-native';
import { createAccountSuriV2, validateMetamaskPrivateKeyV2 } from 'messaging/index';
import { Textarea } from 'components/Textarea';
import { EVM_ACCOUNT_TYPE } from 'constants/index';
import { backToHome } from 'utils/navigation';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { FileArrowDown, X } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './styles';

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.privateKey;
}

function autoFormatPrivateKey(privateKey: string) {
  const key = privateKey.trim();

  if (key.startsWith('0x')) {
    return key;
  } else {
    return `0x${key}`;
  }
}

export const ImportPrivateKey = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const accountName = useGetDefaultAccountName();
  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  const privateKeyFormConfig: FormControlConfig = {
    privateKey: {
      name: i18n.common.privateKey,
      value: '',
      require: true,
    },
  };

  const timeOutRef = useRef<NodeJS.Timer>();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [isBusy, setIsBusy] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useHandlerHardwareBackPress(isBusy);

  const [validating, setValidating] = useState(false);

  const _onImport = () => {
    Keyboard.dismiss();
    setIsBusy(true);
    createAccountSuriV2({
      name: accountName,
      suri: autoFormatPrivateKey(formState.data.privateKey),
      isAllowed: true,
      types: [EVM_ACCOUNT_TYPE],
    })
      .then(() => {
        backToHome(goHome);
      })
      .catch((e: Error) => {
        setIsBusy(false);
        console.log(e);
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(privateKeyFormConfig, {
    onSubmitForm: onPressSubmit(_onImport),
  });

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      const key = autoFormatPrivateKey(formState.data.privateKey);

      if (key) {
        setValidating(false);
        setIsEmpty(true);
        onUpdateErrors('privateKey')([]);

        if (key !== '0x') {
          timeOutRef.current = setTimeout(() => {
            setValidating(true);
            setIsEmpty(false);
            validateMetamaskPrivateKeyV2(key, [EVM_ACCOUNT_TYPE])
              .then(() => {
                if (amount) {
                  onUpdateErrors('privateKey')([]);
                }
              })
              .catch((e: Error) => {
                if (amount) {
                  onUpdateErrors('privateKey')([e.message]);
                }
              })
              .finally(() => {
                if (amount) {
                  setValidating(false);
                }
              });
          }, 300);
        } else {
          setIsEmpty(true);
        }
      }
    }
  }, [onUpdateErrors, formState.data.privateKey, onChangeValue]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      focus('privateKey')();
    });

    return unsubscribe;
  }, [focus, navigation]);

  const canSubmit = !checkValidateForm(formState.isValidated) || validating || isBusy || isEmpty;

  return (
    <SubScreenContainer
      title={i18n.header.importByPrivateKey}
      navigation={navigation}
      disabled={isBusy}
      rightIcon={X}
      onPressRightIcon={goHome}
      disableRightButton={isBusy}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>{i18n.importAccount.importPrivateKeyMessage}</Typography.Text>
          <Textarea
            placeholder={i18n.placeholder.enterPrivateKey}
            placeholderTextColor={theme.colorTextTertiary}
            ref={formState.refs.privateKey}
            style={styles.textArea}
            onChangeText={(text: string) => {
              onChangeValue('privateKey')(text);
            }}
            value={formState.data.privateKey}
            onSubmitEditing={onSubmitField('privateKey')}
            errorMessages={formState.errors.privateKey}
            editable={!isBusy}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            icon={
              <Icon
                phosphorIcon={FileArrowDown}
                size={'lg'}
                weight={'fill'}
                iconColor={canSubmit ? theme.colorTextLight5 : theme.colorTextLight1}
              />
            }
            disabled={canSubmit}
            loading={validating || isBusy}
            onPress={onPressSubmit(_onImport)}>
            {i18n.buttonTitles.importAccount}
          </Button>
        </View>
      </View>
    </SubScreenContainer>
  );
};
