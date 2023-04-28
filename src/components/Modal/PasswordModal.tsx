import { PasswordField } from 'components/Field/Password';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import React, { useCallback, useContext } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';
import { Button } from 'components/design-system-ui';

interface Props {
  visible: boolean;
  closeModal: () => void;
  onConfirm: (password: string) => void;
  isBusy: boolean;
  errorArr: string[] | undefined;
  setErrorArr: (val: string[] | undefined) => void;
  onChangePassword?: (value: string) => void;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  width: '100%',
};

const TitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  textAlign: 'center',
  color: ColorMap.light,
  marginBottom: 24,
};

const PasswordContainerStyle: StyleProp<ViewStyle> = {
  backgroundColor: ColorMap.dark1,
  borderRadius: 5,
  marginBottom: 8,
};

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
};

const PasswordModal = ({ closeModal, visible, onConfirm, isBusy, errorArr, setErrorArr, onChangePassword }: Props) => {
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const onSubmit = useCallback(
    (formState: FormState) => {
      const password = formState.data.password;

      onConfirm(password);
    },
    [onConfirm],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, { onSubmitForm: onSubmit });

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

  const errors = [...formState.errors.password, ...(errorArr && errorArr.length ? errorArr : [])];

  return (
    <SubWalletModal modalVisible={visible} onChangeModalVisible={!isBusy ? closeModal : undefined}>
      <View style={ContainerStyle}>
        <Text style={TitleTextStyle}>{i18n.common.enterYourPassword}</Text>
        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={handleChangePassword}
          errorMessages={errors}
          onSubmitField={onSubmitField('password')}
          style={PasswordContainerStyle}
          isBusy={isBusy}
        />

        {!isNetConnected && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
        )}

        <Button
          style={{ marginTop: 16 }}
          loading={isBusy}
          onPress={onPress}
          disabled={!formState.data.password || formState.errors.password.length > 0 || !isNetConnected}>
          {i18n.common.confirm}
        </Button>
      </View>
    </SubWalletModal>
  );
};

export default React.memo(PasswordModal);
