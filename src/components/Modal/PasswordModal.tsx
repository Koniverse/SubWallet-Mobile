import { PasswordField } from 'components/Field/Password';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';
import { Button, SwModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ModalRefProps } from 'components/design-system-ui/modal/SwModal';

interface Props {
  visible: boolean;
  setModalVisible: (arg: boolean) => void;
  onConfirm: (password: string) => void;
  isBusy: boolean;
  errorArr: string[] | undefined;
  setErrorArr: (val: string[] | undefined) => void;
  onChangePassword?: (value: string) => void;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  width: '100%',
};

const PasswordContainerStyle: StyleProp<ViewStyle> = {
  backgroundColor: '#1a1a1a',
  borderRadius: 5,
  marginBottom: 8,
};

const PasswordModal = ({
  visible,
  onConfirm,
  isBusy,
  errorArr,
  setErrorArr,
  onChangePassword,
  setModalVisible,
}: Props) => {
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const swModalRef = useRef<ModalRefProps>(null);
  const formConfig: FormControlConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: validatePassword,
      require: true,
    },
  };

  const closeModal = () => modalBaseV2Ref?.current?.close();

  const onSubmit = useCallback(
    (formState: FormState) => {
      const password = formState.data.password;

      onConfirm(password);
    },
    [onConfirm],
  );

  const { formState, onChangeValue, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const handleChangePassword = useCallback(
    (val: string) => {
      setErrorArr(undefined);
      onChangePassword && onChangePassword(val);
      onChangeValue('password')(val);
    },
    [onChangePassword, onChangeValue, setErrorArr],
  );

  const onPress = useCallback(() => {
    const password = formState.data.password;
    onConfirm(password);
  }, [formState.data.password, onConfirm]);

  useEffect(() => {
    if (!visible) {
      setErrorArr([]);
      onChangeValue('password')('');
      onUpdateErrors('password')([]);
    } else {
      focus('password')();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const errors = [...formState.errors.password, ...(errorArr && errorArr.length ? errorArr : [])];

  return (
    <SwModal
      ref={swModalRef}
      modalBaseV2Ref={modalBaseV2Ref}
      isUseModalV2
      setVisible={setModalVisible}
      modalVisible={visible}
      modalTitle={i18n.common.enterYourPassword}
      onBackButtonPress={!isBusy ? closeModal : undefined}>
      <View style={ContainerStyle}>
        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={handleChangePassword}
          errorMessages={errors}
          onSubmitField={() => onSubmit(formState)}
          style={PasswordContainerStyle}
          isBusy={isBusy}
        />

        {!isNetConnected && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
        )}

        <Button
          style={{ marginVertical: 16 }}
          loading={isBusy}
          onPress={onPress}
          disabled={!formState.data.password || formState.errors.password.length > 0 || !isNetConnected || isBusy}>
          {i18n.common.confirm}
        </Button>
      </View>
    </SwModal>
  );
};

export default React.memo(PasswordModal);
