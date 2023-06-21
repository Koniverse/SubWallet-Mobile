import React, { useRef } from 'react';
import { Keyboard, StyleProp, Text, View } from 'react-native';
import InputText from 'components/Input/InputText';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { Button, SwModal } from 'components/design-system-ui';

interface Props {
  loading: boolean;
  modalVisible: boolean;
  onCloseModal?: () => void;
  createProvider: (
    newProvider: string,
    updateError: (fieldName: string) => (errors?: string[] | undefined) => void,
  ) => Promise<string>;
}

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;

const formConfig: FormControlConfig = {
  provider: {
    name: 'Provider',
    value: '',
    require: true,
  },
};

const modalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  textAlign: 'center',
  marginBottom: 24,
};

export const AddProviderModal = ({ loading, modalVisible, onCloseModal, createProvider }: Props) => {
  const toastRef = useRef<ToastContainer>(null);

  const onSubmit = (formState: FormState) => {
    const provider = formState.data.provider;
    Keyboard.dismiss();
    createProvider(provider, onUpdateErrors).then(resp => {
      if (resp) {
        onChangeValue('provider')('');
        onUpdateErrors('provider')(undefined);
      }
    });
  };

  const { formState, onChangeValue, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  return (
    <SwModal
      modalVisible={modalVisible}
      onChangeModalVisible={!loading ? onCloseModal : undefined}
      onBackButtonPress={!loading ? onCloseModal : undefined}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitle}>{i18n.title.addProvider}</Text>
        <InputText
          label={formState.labels.provider}
          fieldBgc={ColorMap.dark1}
          ref={formState.refs.provider}
          value={formState.data.provider}
          onChangeText={text => onChangeValue('provider')(text)}
          errorMessages={formState.errors.provider}
          onSubmitField={() => onSubmit(formState)}
        />
        <Button
          disabled={!!formState.errors.provider.length || !formState.data.provider}
          loading={loading}
          onPress={() => onSubmit(formState)}>
          {i18n.title.addProvider}
        </Button>

        <Toast
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={OFFSET_BOTTOM}
        />
      </View>
    </SwModal>
  );
};
