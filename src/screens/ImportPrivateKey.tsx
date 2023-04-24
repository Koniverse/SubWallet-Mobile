import React, { useEffect, useRef, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ScrollView, StyleProp, View } from 'react-native';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { createAccountSuriV2, validateMetamaskPrivateKeyV2 } from 'messaging/index';
import { Textarea } from 'components/Textarea';
import { EVM_ACCOUNT_TYPE } from 'constants/index';
import { backToHome } from 'utils/navigation';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { ColorMap } from 'styles/color';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { Button, Icon } from 'components/design-system-ui';
import { FileArrowDown } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.privateKey;
}

export const ImportPrivateKey = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const [isBusy, setIsBusy] = useState(false);
  useHandlerHardwareBackPress(isBusy);
  const accountName = useGetDefaultAccountName();
  const timeOutRef = useRef<NodeJS.Timer>();
  const [privateKey, setPrivateKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState('');

  const _onImport = () => {
    setIsBusy(true);
    createAccountSuriV2({
      name: accountName,
      suri: privateKey.trim(),
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

  const privateKeyFormConfig: FormControlConfig = {
    privateKey: {
      name: i18n.common.privateKey,
      value: '',
      require: true,
      transformFunc: value => {
        return value.trim();
      },
    },
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(privateKeyFormConfig, {
    onSubmitForm: _onImport,
  });

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      if (privateKey) {
        setValidating(true);
        onUpdateErrors('privateKey')([]);

        timeOutRef.current = setTimeout(() => {
          validateMetamaskPrivateKeyV2(privateKey, [EVM_ACCOUNT_TYPE])
            .then(({ addressMap, autoAddPrefix }) => {
              if (amount) {
                if (autoAddPrefix) {
                  setAutoCorrect(`0x${privateKey}`);
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
  }, [onUpdateErrors, privateKey]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      focus('privateKey')();
    });

    return unsubscribe;
  }, [focus, navigation]);

  return (
    <SubScreenContainer title={i18n.title.importByPrivateKey} navigation={navigation} disabled={isBusy}>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ ...sharedStyles.layoutContainer }}>
          <Textarea
            placeholder={i18n.common.enterYourPrivateKey}
            placeholderTextColor={ColorMap.disabled}
            ref={formState.refs.privateKey}
            style={{ height: 94, marginBottom: 8, paddingTop: 16 }}
            onChangeText={(text: string) => {
              onChangeValue('privateKey')(text);
              setAutoCorrect('');
              setPrivateKey(text);
            }}
            value={autoCorrect || formState.data.privateKey}
            onSubmitEditing={onSubmitField('privateKey')}
            errorMessages={formState.errors.privateKey}
          />
        </ScrollView>

        <View style={footerAreaStyle}>
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
            disabled={!checkValidateForm(formState.isValidated) || validating}
            loading={validating || isBusy}
            onPress={_onImport}>
            {'Import account'}
          </Button>
        </View>
      </View>
    </SubScreenContainer>
  );
};
