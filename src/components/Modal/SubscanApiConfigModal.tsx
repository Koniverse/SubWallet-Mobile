import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getSubscanApiKey, saveSubscanApiKey } from 'messaging/settings';
import { useToast } from 'react-native-toast-notifications';
import { Button, SwModal, Typography } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { PasswordField } from 'components/Field/Password';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ModalRefProps } from 'components/design-system-ui/modal/SwModal';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onClose: () => void;
}

export const SubscanApiConfigModal = ({ modalVisible, setModalVisible }: Props) => {
  const formConfig: FormControlConfig = {
    apiKey: {
      name: 'Enter key',
      value: '',
      require: true,
    },
  };
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const swModalRef = useRef<ModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const [subscanApiKey, setSubscanApiKey] = useState<string>('');
  const { hideAll, show } = useToast();

  const [savedSubscanApiKey, setSavedSubscanApiKey] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const normalizedSaved = useMemo(() => savedSubscanApiKey.trim(), [savedSubscanApiKey]);
  const normalizedCurrent = useMemo(() => subscanApiKey.trim(), [subscanApiKey]);
  const isSaveDisabled = useMemo(
    () => !normalizedCurrent || normalizedCurrent === normalizedSaved || isLoading,
    [isLoading, normalizedCurrent, normalizedSaved],
  );

  const onClose = useCallback(() => {
    if (isLoading) {
      return;
    }

    setSubscanApiKey(savedSubscanApiKey);
    setModalVisible(false);
  }, [isLoading, savedSubscanApiKey, setModalVisible]);

  const onSave = useCallback(
    (formState: FormState) => {
      if (isSaveDisabled) {
        return;
      }

      const normalizedInput = formState.data.apiKey.trim();
      setIsLoading(true);

      saveSubscanApiKey({ apiKey: normalizedInput })
        .then(() => {
          setSavedSubscanApiKey(normalizedInput);
          setSubscanApiKey(normalizedInput);
          setModalVisible(false);
          hideAll();
          show('Subscan API key saved', { type: 'success' });
        })
        .catch(error => {
          console.error(error);
          hideAll();
          show('Failed to save Subscan API key', { type: 'danger' });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [hideAll, isSaveDisabled, setModalVisible, show],
  );

  const { formState, onChangeValue, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSave,
  });

  const handleChangeText = useCallback(
    (val: string) => {
      onUpdateErrors('apiKey')([]);
      setSubscanApiKey(val);
      onChangeValue('apiKey')(val);
    },
    [onChangeValue, onUpdateErrors],
  );

  const onPressSaveBtn = useCallback(() => {
    onSave(formState);
  }, [formState, onSave]);

  useEffect(() => {
    let isSync = true;

    if (modalVisible) {
      setIsLoading(true);

      getSubscanApiKey()
        .then(value => {
          if (!isSync) {
            return;
          }

          const apiKey = value || '';

          if (apiKey) {
            onChangeValue('apiKey')(apiKey);
            setSavedSubscanApiKey(apiKey);
            setSubscanApiKey(apiKey);
          }
        })
        .catch(error => {
          if (!isSync) {
            return;
          }

          console.error(error);
          show('Failed to load Subscan API key', { type: 'danger' });
        })
        .finally(() => {
          if (isSync) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isSync = false;
    };
  }, [modalVisible, onChangeValue, show]);
  const styles = createStyle(theme);
  return (
    <SwModal
      ref={swModalRef}
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      setVisible={setModalVisible}
      modalVisible={modalVisible}
      modalTitle={'Your API key'}
      onBackButtonPress={!isLoading ? onClose : undefined}>
      <View style={styles.container}>
        <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center', paddingBottom: theme.padding }}>
          {'Enter your Subscan API key below to track real-time wallet activity updates in-app'}
        </Typography.Text>

        <PasswordField
          ref={formState.refs.apiKey}
          label={formState.labels.apiKey}
          defaultValue={formState.data.apiKey}
          onChangeText={handleChangeText}
          errorMessages={formState.errors.apiKey}
          onSubmitField={() => onSave(formState)}
          style={styles.apiKeyContainer}
          isBusy={isLoading}
        />

        <Button
          style={{ marginTop: formState.errors.length ? 0 : 8 }}
          loading={isLoading}
          onPress={onPressSaveBtn}
          disabled={!formState.data.apiKey || formState.errors.apiKey.length > 0 || isSaveDisabled}>
          {i18n.common.confirm}
        </Button>
      </View>
    </SwModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    apiKeyContainer: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: 5,
      marginBottom: 8,
    },
    container: {
      width: '100%',
    },
  });
}
