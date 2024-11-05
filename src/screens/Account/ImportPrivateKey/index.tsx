import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Keyboard, ScrollView, View } from 'react-native';
import { createAccountSuriV2, validateAccountName, validateMetamaskPrivateKeyV2 } from 'messaging/index';
import { Textarea } from 'components/Textarea';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { FileArrowDown, X } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './styles';
import InputText from 'components/Input/InputText';
import { KeypairType } from '@subwallet/keyring/types';

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.privateKey && isValidated.accountName;
}

export const ImportPrivateKey = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const { onPress: onPressSubmit } = useUnlockModal(navigation);
  const [type, setType] = useState<string>('');

  const accountNameValidator = useCallback((value: string) => {
    let result: string[] = [];
    if (value) {
      validateAccountName({ name: value })
        .then(({ isValid }) => {
          if (!isValid) {
            result = ['Account name already in use'];
          }
        })
        .catch(() => {
          result = ['Account name invalid'];
        });
    }

    return result;
  }, []);

  const privateKeyFormConfig = useMemo(
    (): FormControlConfig => ({
      privateKey: {
        name: i18n.common.privateKey,
        value: '',
        require: true,
      },
      accountName: {
        name: 'Account name',
        value: '',
        require: true,
        validateFunc: (value: string) => {
          return accountNameValidator(value);
        },
      },
    }),
    [accountNameValidator],
  );

  const timeOutRef = useRef<NodeJS.Timeout>();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [isBusy, setIsBusy] = useState(false);

  useHandlerHardwareBackPress(isBusy);

  const [validating, setValidating] = useState(false);

  const _onImport = () => {
    Keyboard.dismiss();
    setIsBusy(true);
    createAccountSuriV2({
      name: formState.data.accountName.trim(),
      suri: formState.data.privateKey,
      type: type as KeypairType,
      isAllowed: true,
    })
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
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
      const privateKey = formState.data.privateKey;

      if (privateKey?.trim()) {
        setValidating(false);
        onUpdateErrors('privateKey')([]);

        timeOutRef.current = setTimeout(() => {
          setValidating(true);
          validateMetamaskPrivateKeyV2(privateKey)
            .then(({ autoAddPrefix, keyTypes }) => {
              if (amount) {
                if (autoAddPrefix) {
                  onChangeValue('privateKey')(`0x${privateKey}`);
                }

                setType(keyTypes[0]);
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
      }
    }
  }, [onUpdateErrors, formState.data.privateKey, onChangeValue]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      focus('privateKey')();
    });

    return unsubscribe;
  }, [focus, navigation]);

  const canSubmit = !checkValidateForm(formState.isValidated) || validating || isBusy;

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

          <InputText
            ref={formState.refs.accountName}
            label={'Account name'}
            placeholder={'Enter the account name'}
            onChangeText={onChangeValue('accountName')}
            onSubmitField={() => {
              onSubmitField('accountName', formState.data.accountName)();
            }}
            errorMessages={formState.errors.accountName}
            value={formState.data.accountName}
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
