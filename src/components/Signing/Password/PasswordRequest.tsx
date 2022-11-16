import { Warning } from 'components/Warning';
import { SigningContext } from 'providers/SigningContext';
import { PasswordField } from 'components/Field/Password';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import React, { useCallback, useContext } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';
import { FontSemiBold, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { BaseSignProps } from 'types/signer';
import i18n from 'utils/i18n/i18n';

interface Props extends BaseSignProps {
  handlerStart: (password: string) => void;
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

const ButtonStyle: StyleProp<ViewStyle> = {
  marginTop: 16,
};

const PasswordContainerStyle: StyleProp<ViewStyle> = {
  backgroundColor: ColorMap.dark1,
  borderRadius: 5,
  marginBottom: 8,
};

const ErrorStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 16,
  marginTop: 16,
};

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
};

const getWrapperStyle = (canCancel: boolean): StyleProp<ViewStyle> => {
  return {
    ...MarginBottomForSubmitButton,
    marginHorizontal: canCancel ? 16 - 4 : 16,
    marginTop: 16,
  };
};

const getButtonStyle = (canCancel: boolean): StyleProp<ViewStyle> => {
  return {
    marginHorizontal: canCancel ? 4 : 0,
  };
};

const PasswordRequest = ({ handlerStart, baseProps: { cancelText, onCancel, submitText, buttonText } }: Props) => {
  const {
    onErrors,
    setIsVisible,
    setPasswordError,
    signingState: { errors: signingErrors, isCreating, passwordError, isVisible, isSubmitting },
  } = useContext(SigningContext);

  const onSubmit = useCallback(
    (formState: FormState) => {
      const password = formState.data.password;

      handlerStart(password);
    },
    [handlerStart],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, { onSubmitForm: onSubmit });

  const handleChangePassword = useCallback(
    (val: string) => {
      onErrors([]);
      setPasswordError(false);
      onChangeValue('password')(val);
    },
    [onChangeValue, onErrors, setPasswordError],
  );

  const openModal = useCallback(() => {
    setIsVisible(true);
  }, [setIsVisible]);

  const closeModal = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const onPress = useCallback(() => {
    const password = formState.data.password;

    handlerStart(password);
  }, [formState.data.password, handlerStart]);

  const errors = [...formState.errors.password, ...signingErrors];

  return (
    <>
      {signingErrors && (
        <View>
          {signingErrors.map((error, index) => {
            return <Warning style={ErrorStyle} key={index} message={error} isDanger />;
          })}
        </View>
      )}
      <View style={getWrapperStyle(!!onCancel)}>
        {onCancel && (
          <SubmitButton
            style={getButtonStyle(!!onCancel)}
            disabled={isCreating}
            title={cancelText ? cancelText : i18n.common.cancel}
            onPress={onCancel}
          />
        )}

        {isSubmitting ? (
          <SubmitButton
            style={getButtonStyle(!!onCancel)}
            disabled={true}
            title={submitText ? submitText : i18n.common.submitting}
            loadingLeftIcon={true}
          />
        ) : (
          <SubmitButton
            style={getButtonStyle(!!onCancel)}
            isBusy={isCreating}
            title={buttonText ? buttonText : i18n.common.approve}
            onPress={openModal}
          />
        )}
      </View>

      <SubWalletModal modalVisible={isVisible} onChangeModalVisible={!isSubmitting ? closeModal : undefined}>
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
            isBusy={isCreating}
          />
          <SubmitButton
            title={i18n.common.confirm}
            style={ButtonStyle}
            isBusy={isCreating}
            onPress={onPress}
            disabled={!formState.data.password || formState.errors.password.length > 0 || passwordError}
          />
        </View>
      </SubWalletModal>
    </>
  );
};

export default React.memo(PasswordRequest);
