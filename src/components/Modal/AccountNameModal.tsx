import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { Platform } from 'react-native';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';
import { validateAccountName } from 'messaging/index';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  isLoading?: boolean;
  accountType?: AccountProxyType; // for display account proxy tag
  onSubmit?: (name: string) => void;
  onCancel?: () => void;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
}

export const AccountNameModal = ({
  accountType,
  isLoading,
  onSubmit,
  onCancel,
  modalVisible,
  setModalVisible,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalRef = useRef<SWModalRefProps>(null);
  const validatorFunc = useCallback((value: string) => {
    let result: string[] = [];

    if (value) {
      validateAccountName({ name: value })
        .then(({ isValid }) => {
          if (!isValid) {
            result = ['Account name already in use'];
          }
        })
        .catch(() => {
          result = ['Account name invalid'];
        });
    }

    return result;
  }, []);
  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: '',
        require: true,
        validateFunc: (value: string) => {
          return validatorFunc(value);
        },
      },
    }),
    [validatorFunc],
  );

  const _onSubmit = useCallback(
    (formState: FormState) => {
      return onSubmit && onSubmit(formState.data.accountName);
    },
    [onSubmit],
  );

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: _onSubmit,
  });

  const onChangeAccountName = (value: string) => {
    if (!value) {
      onUpdateErrors('accountName')([]);
    }

    onChangeValue('accountName')(value);
  };

  const isDisabled = useMemo(() => !formState.data.accountName || isLoading, [formState.data.accountName, isLoading]);

  const footerNode = useMemo(
    () => (
      <Button
        icon={
          <Icon
            phosphorIcon={CheckCircle}
            iconColor={isDisabled ? theme.colorTextTertiary : theme.colorWhite}
            weight={'fill'}
          />
        }
        disabled={isDisabled}
        onPress={() => _onSubmit(formState)}
        loading={isLoading}>
        {'Confirm'}
      </Button>
    ),
    [_onSubmit, formState, isDisabled, isLoading, theme.colorTextTertiary, theme.colorWhite],
  );

  useEffect(() => {
    setTimeout(() => focus('accountName')(), 100);
  }, [focus]);

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={'Account name'}
      setVisible={setModalVisible}
      isUseModalV2
      titleTextAlign={'center'}
      onChangeModalVisible={onCancel}
      isAllowSwipeDown={Platform.OS === 'ios'}
      modalBaseV2Ref={modalRef}
      footer={footerNode}>
      <EditAccountInputText
        ref={formState.refs.accountName}
        label={formState.labels.accountName}
        editAccountInputStyle={{ marginBottom: theme.margin }}
        value={formState.data.accountName}
        onChangeText={onChangeAccountName}
        onSubmitField={onSubmitField('accountName')}
        accountType={accountType}
        isDisabled={isLoading}
      />
    </SwModal>
  );
};
