import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { DeviceEventEmitter, View } from 'react-native';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl from 'hooks/screen/useFormControl';
import { CheckCircle } from 'phosphor-react-native';
import { keyringUnlock } from 'messaging/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useDispatch, useSelector } from 'react-redux';
import { updatePasswordModalState } from 'stores/PasswordModalState';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { RootState } from 'stores/index';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

export const UnlockModal = () => {
  const { isShowModal, selectedAction } = useSelector((state: RootState) => state.passwordModalState);
  const theme = useSubWalletTheme().swThemes;
  const dispatch = useDispatch();
  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: validatePassword,
    },
  };

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    focus('password')();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHideModal = () => {
    dispatch(updatePasswordModalState(false));
  };

  const onSubmit = () => {
    const password = formState.data.password;
    setLoading(true);
    setTimeout(() => {
      keyringUnlock({
        password,
      })
        .then(data => {
          if (!data.status) {
            onUpdateErrors('password')(['Invalid password']);
          } else {
            onHideModal();
            onChangeValue('password')('');
            onUpdateErrors('password')(undefined);
            if (selectedAction) {
              setTimeout(() => {
                DeviceEventEmitter.emit(selectedAction);
              }, HIDE_MODAL_DURATION);
            }
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

  const onChangePassword = (value: string) => {
    if (!value) {
      onUpdateErrors('password')([i18n.warningMessage.requireMessage]);
    }
    onChangeValue('password')(value);
  };

  const renderFooter = () => {
    return (
      <>
        <View style={{ width: '100%', paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
          <Button
            loading={loading}
            disabled={isDisabled}
            icon={
              <Icon
                phosphorIcon={CheckCircle}
                size={'lg'}
                weight={'fill'}
                iconColor={loading || !formState.data.password ? theme.colorTextLight5 : theme.colorTextLight1}
              />
            }
            onPress={onSubmit}>
            {'Apply'}
          </Button>
        </View>
      </>
    );
  };

  return (
    <SwModal
      modalVisible={isShowModal}
      modalTitle={'Enter password'}
      footer={renderFooter()}
      onChangeModalVisible={() => dispatch(updatePasswordModalState(false))}>
      <View style={{ width: '100%' }}>
        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={onChangePassword}
          errorMessages={formState.errors.password}
          onSubmitField={onSubmitField('password')}
        />
      </View>
    </SwModal>
  );
};
