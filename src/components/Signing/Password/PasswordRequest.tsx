import { WebRunnerContext } from 'providers/contexts';
import { SigningContext } from 'providers/SigningContext';
import { PasswordField } from 'components/Field/Password';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import React, { useCallback, useContext } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';
import { FontSemiBold, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { BaseSignProps } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { SwModal } from 'components/design-system-ui';

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
const getWrapperStyle = (canCancel: boolean): StyleProp<ViewStyle> => {
  return {
    ...MarginBottomForSubmitButton,
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: canCancel ? -4 : 0,
    marginTop: 16,
  };
};

const getButtonStyle = (canCancel: boolean, style?: StyleProp<ViewStyle>): StyleProp<ViewStyle> => {
  return {
    marginHorizontal: canCancel ? 4 : 0,
    flex: 1,
    ...(style as Object),
  };
};

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
};

const PasswordRequest = ({
  handlerStart,
  baseProps: { cancelText, onCancel, submitText, buttonText, extraLoading },
}: Props) => {
  const {
    onErrors,
    setIsVisible,
    setPasswordError,
    signingState: { errors: signingErrors, isCreating, passwordError, isVisible, isSubmitting },
  } = useContext(SigningContext);

  const { isNetConnected } = useContext(WebRunnerContext);

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
      <View style={getWrapperStyle(!!onCancel)}>
        {onCancel && (
          <SubmitButton
            backgroundColor={ColorMap.dark2}
            disabledColor={ColorMap.buttonOverlayButtonColor}
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
            disabled={extraLoading}
            isBusy={isCreating}
            title={buttonText ? buttonText : i18n.buttonTitles.approve}
            onPress={openModal}
          />
        )}
      </View>

      <SwModal
        setVisible={setIsVisible}
        modalVisible={isVisible}
        onChangeModalVisible={!isSubmitting ? closeModal : undefined}
        onBackButtonPress={!isSubmitting ? closeModal : undefined}>
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
            disabled={
              !formState.data.password || formState.errors.password.length > 0 || passwordError || !isNetConnected
            }
          />
        </View>
      </SwModal>
    </>
  );
};

export default React.memo(PasswordRequest);
