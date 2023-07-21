import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import { PasswordField } from 'components/Field/Password';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl from 'hooks/screen/useFormControl';
import { CheckCircle } from 'phosphor-react-native';
import { keyringUnlock } from 'messaging/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './style';

interface Props {
  onPasswordComplete: VoidFunction;
  visible: boolean;
  onHideModal: VoidFunction;
}

export const UnlockModal: React.FC<Props> = (props: Props) => {
  const { visible, onPasswordComplete, onHideModal } = props;
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: validatePassword,
    },
  };

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = () => {
    const password = formState.data.password;
    setLoading(true);
    setTimeout(() => {
      keyringUnlock({
        password,
      })
        .then(data => {
          if (!data.status) {
            onUpdateErrors('password')([i18n.errorMessage.invalidMasterPassword]);
          } else {
            onPasswordComplete();
          }
        })
        .catch((e: Error) => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const { formState, onChangeValue, onSubmitField, focus, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const isDisabled = useMemo(() => {
    return loading || !formState.data.password || formState.errors.password.length > 0;
  }, [formState.data.password, formState.errors.password.length, loading]);

  const onChangePassword = useCallback(
    (value: string) => {
      if (!value) {
        onUpdateErrors('password')([i18n.warningMessage.requireMessage]);
      }
      onChangeValue('password')(value);
    },
    [onChangeValue, onUpdateErrors],
  );

  useEffect(() => {
    if (!visible) {
      onChangeValue('password')('');
      onUpdateErrors('password')([]);
    } else {
      focus('password')();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <SwModal
      modalVisible={visible}
      modalTitle={i18n.header.enterPassword}
      footer={
        <>
          <View style={styles.footer}>
            <Button
              loading={loading}
              disabled={isDisabled}
              icon={
                <Icon
                  phosphorIcon={CheckCircle}
                  size={'lg'}
                  weight={'fill'}
                  iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
                />
              }
              onPress={onSubmit}>
              {i18n.buttonTitles.apply}
            </Button>
          </View>
        </>
      }
      onBackButtonPress={onHideModal}
      onChangeModalVisible={onHideModal}>
      <View style={styles.field}>
        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={onChangePassword}
          errorMessages={formState.errors.password}
          onSubmitField={onSubmitField('password')}
          isBusy={loading}
        />
      </View>
    </SwModal>
  );
};
