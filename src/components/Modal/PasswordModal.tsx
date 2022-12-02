import { PasswordField } from 'components/Field/Password';
import { SubmitButton } from 'components/SubmitButton';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { FormState } from 'hooks/screen/useFormControl';
import React, { useContext } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';

interface Props {
  formState: FormState;
  visible: boolean;
  closeModal: () => void;
  onConfirm: () => void;
  isBusy: boolean;
  handleChangePassword: (val: string) => void;
  onSubmitField: () => void;
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

const PasswordModal = ({
  formState,
  handleChangePassword,
  onSubmitField,
  closeModal,
  visible,
  onConfirm,
  isBusy,
}: Props) => {
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  return (
    <SubWalletModal modalVisible={visible} onChangeModalVisible={!isBusy ? closeModal : undefined}>
      <View style={ContainerStyle}>
        <Text style={TitleTextStyle}>{i18n.common.enterYourPassword}</Text>
        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={handleChangePassword}
          onSubmitField={onSubmitField}
          style={PasswordContainerStyle}
          isBusy={isBusy}
        />

        {!isNetConnected && (
          <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
        )}

        <SubmitButton
          title={i18n.common.confirm}
          style={ButtonStyle}
          isBusy={isBusy}
          onPress={onConfirm}
          disabled={!formState.data.password || formState.errors.password.length > 0 || !isNetConnected}
        />
      </View>
    </SubWalletModal>
  );
};

export default React.memo(PasswordModal);
