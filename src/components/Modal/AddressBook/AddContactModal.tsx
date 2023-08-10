import { Button, Icon, SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { isAddress } from '@polkadot/util-crypto';
import { FormItem } from 'components/common/FormItem';
import Input from 'components/design-system-ui/input';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { UseControllerReturn } from 'react-hook-form/dist/types';
import { editContactAddress } from 'messaging/index';
import { InputAddress } from 'components/Input/InputAddressV2';
import { PlusCircle } from 'phosphor-react-native';
import { useToast } from 'react-native-toast-notifications';
import createStylesheet from './style/AddContactModal';
import { TextInputProps } from 'react-native/Libraries/Components/TextInput/TextInput';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

type Props = {
  modalVisible: boolean;
  setModalVisible: (arg: boolean) => void;
};

enum FormFieldName {
  ADDRESS = 'address',
  NAME = 'name',
}

interface FormValues {
  [FormFieldName.ADDRESS]: string;
  [FormFieldName.NAME]: string;
}

const defaultFormValues: FormValues = {
  [FormFieldName.ADDRESS]: '',
  [FormFieldName.NAME]: '',
};

const addressValidator: UseControllerProps<FormValues>['rules'] = {
  validate: address => {
    if (!address) {
      return i18n.errorMessage.contactAddressIsRequired;
    }

    if (!isAddress(address)) {
      return i18n.errorMessage.invalidContactAddress;
    }

    return true;
  },
};

const ButtonIcon = (color: string) => {
  return <Icon phosphorIcon={PlusCircle} size={'lg'} weight={'fill'} iconColor={color} />;
};

export const AddContactModal = ({ modalVisible, setModalVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const contacts = useSelector((state: RootState) => state.accountState.contacts);
  const [loading, setLoading] = useState(false);
  const { show, hideAll } = useToast();
  const stylesheet = createStylesheet(theme);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const onChangeModalVisible = useCallback(() => {
    modalBaseV2Ref?.current?.close();
  }, []);

  const {
    control,
    handleSubmit,
    setFocus,
    trigger,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });

  const { address: addressValue, name: nameValue } = {
    ...useWatch<FormValues>({ control }),
    ...getValues(),
  };

  const existNames = useMemo(() => contacts.map(contact => (contact.name || '').trimStart().trimEnd()), [contacts]);

  const nameValidator: UseControllerProps<FormValues>['rules'] = useMemo(
    () => ({
      validate: (name: string) => {
        if (!name || !name.trim()) {
          return i18n.errorMessage.contactNameIsRequired;
        }

        if (existNames.includes(name)) {
          return i18n.errorMessage.contactNameMustBeUnique;
        }

        return true;
      },
    }),
    [existNames],
  );

  const onSubmit = useCallback(
    (values: FormValues) => {
      const { [FormFieldName.ADDRESS]: address, [FormFieldName.NAME]: _name } = values;

      const name = _name.trimStart().trimEnd();

      setLoading(true);
      editContactAddress(address, name)
        .then(() => {
          modalBaseV2Ref?.current?.close();
        })
        .catch((e: Error) => {
          hideAll();
          show(e.message, { type: 'danger' });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [hideAll, show],
  );

  // don't use memo with this, or else it will cause bug
  const isButtonDisabled = (() => {
    if (loading || !addressValue || !nameValue) {
      return true;
    }

    if (errors && Object.keys(errors).length) {
      return true;
    }

    return false;
  })();

  const onSubmitName = async () => {
    const isValid = await trigger(FormFieldName.NAME);

    if (isValid) {
      setFocus(FormFieldName.ADDRESS);
    }
  };

  useEffect(() => {
    if (!modalVisible) {
      reset();
    }
  }, [modalVisible, reset]);

  return (
    <SwModal
      isUseModalV2
      modalBaseV2Ref={modalBaseV2Ref}
      setVisible={setModalVisible}
      modalTitle={i18n.header.addContact}
      modalVisible={modalVisible}
      onBackButtonPress={onChangeModalVisible}>
      <View style={stylesheet.formContainer}>
        <FormItem
          control={control}
          rules={nameValidator}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              placeholder={i18n.addressBook.contactName}
              onBlur={onBlur}
              onChangeText={onChange as unknown as TextInputProps['onChangeText']}
              value={value}
              label={i18n.addressBook.contactName}
              onSubmitEditing={onSubmitName}
              ref={ref}
            />
          )}
          name={FormFieldName.NAME}
        />

        <FormItem
          control={control}
          rules={addressValidator}
          render={({ field: { onChange, onBlur, value, ref } }: UseControllerReturn<FormValues>) => (
            <InputAddress
              placeholder={i18n.addressBook.contactAddress}
              onBlur={onBlur}
              onChangeText={onChange as unknown as TextInputProps['onChangeText']}
              value={value}
              label={i18n.addressBook.contactAddress}
              onSubmitEditing={handleSubmit(onSubmit)}
              isError={errors && !!errors[FormFieldName.ADDRESS]}
              ref={ref}
              saveAddress={false}
            />
          )}
          name={FormFieldName.ADDRESS}
        />

        <Button icon={ButtonIcon} disabled={isButtonDisabled} onPress={handleSubmit(onSubmit)}>
          {i18n.buttonTitles.addContact}
        </Button>
      </View>
    </SwModal>
  );
};
