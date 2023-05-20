import { UnlockModal } from 'components/common/Modal/UnlockModal';
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
import { ColorMap } from 'styles/color';
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

export const ImportPrivateKey = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const accountName = useGetDefaultAccountName();
  const { visible, onPasswordComplete, onPress: onPressSubmit, onHideModal } = useUnlockModal();

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

  useHandlerHardwareBackPress(isBusy);

  const [validating, setValidating] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState('');

  const _onImport = () => {
    Keyboard.dismiss();
    setIsBusy(true);
    createAccountSuriV2({
      name: accountName,
      suri: autoCorrect.trim(),
      isAllowed: true,
      types: [EVM_ACCOUNT_TYPE],
    })
      .then(() => {
        backToHome(goHome, true);
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
      const trimPrivateKey = formState.data.privateKey.trim();

      if (trimPrivateKey) {
        setValidating(true);
        onUpdateErrors('privateKey')([]);

        timeOutRef.current = setTimeout(() => {
          validateMetamaskPrivateKeyV2(trimPrivateKey, [EVM_ACCOUNT_TYPE])
            .then(({ autoAddPrefix }) => {
              if (amount) {
                if (autoAddPrefix) {
                  setAutoCorrect(`0x${trimPrivateKey}`);
                }

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
  }, [onUpdateErrors, formState.data.privateKey]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      focus('privateKey')();
    });

    return unsubscribe;
  }, [focus, navigation]);

  return (
    <SubScreenContainer
      title={i18n.title.importByPrivateKey}
      navigation={navigation}
      disabled={isBusy}
      rightIcon={X}
      onPressRightIcon={goHome}
      disableRightButton={isBusy}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>
            To import an existing wallet, please enter the private key here
          </Typography.Text>
          <Textarea
            placeholder={i18n.common.enterYourPrivateKey}
            placeholderTextColor={ColorMap.disabled}
            ref={formState.refs.privateKey}
            style={styles.textArea}
            onChangeText={(text: string) => {
              onChangeValue('privateKey')(text);
              setAutoCorrect('');
            }}
            value={autoCorrect || formState.data.privateKey}
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
                iconColor={
                  !checkValidateForm(formState.isValidated) || validating
                    ? theme.colorTextLight5
                    : theme.colorTextLight1
                }
              />
            }
            disabled={!checkValidateForm(formState.isValidated) || validating || isBusy}
            loading={validating || isBusy}
            onPress={onPressSubmit(_onImport)}>
            {'Import account'}
          </Button>
        </View>
        <UnlockModal onPasswordComplete={onPasswordComplete} visible={visible} onHideModal={onHideModal} />
      </View>
    </SubScreenContainer>
  );
};
