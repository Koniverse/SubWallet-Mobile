import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { Keyboard } from 'react-native';
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
  const timeOutRef = useRef<NodeJS.Timeout>();
  const [validating, setValidating] = useState(false);
  const validatorFunc = useCallback(async (value: string) => {
    let result: string[] = [];

    if (!value.trim()) {
      result = ['This field is required'];
    } else {
      try {
        const { isValid } = await validateAccountName({ name: value.trim() });
        if (!isValid) {
          result = ['Account name already in use'];
        }
      } catch {
        result = ['Account name invalid'];
      }
    }

    return result;
  }, []);
  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: '',
        require: true,
      },
    }),
    [],
  );

  const _onSubmit = useCallback(
    (formState: FormState) => {
      return onSubmit && onSubmit(formState.data.accountName.trim());
    },
    [onSubmit],
  );

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: _onSubmit,
  });

  const onChangeAccountName = (value: string) => {
    onChangeValue('accountName')(value);
  };

  const isDisabled = useMemo(
    () => !formState.data.accountName || isLoading || !!formState.errors.accountName.length || validating,
    [formState.data.accountName, formState.errors.accountName.length, isLoading, validating],
  );

  const footerNode = useMemo(
    () => (
      <Button
        icon={
          <Icon
            phosphorIcon={CheckCircle}
            iconColor={isDisabled ? theme.colorTextLight5 : theme.colorWhite}
            weight={'fill'}
          />
        }
        disabled={isDisabled}
        onPress={() => _onSubmit(formState)}
        loading={isLoading || validating}>
        {'Confirm'}
      </Button>
    ),
    [_onSubmit, formState, isDisabled, isLoading, theme.colorTextLight5, theme.colorWhite, validating],
  );

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      if (formState.data.accountName) {
        setValidating(true);
        timeOutRef.current = setTimeout(() => {
          validatorFunc(formState.data.accountName)
            .then(res => {
              onUpdateErrors('accountName')(res);
            })
            .catch((error: Error) => console.log('error validate name', error.message))
            .finally(() => {
              if (amount) {
                setValidating(false);
              }
            });
        }, 500);
      } else {
        setValidating(false);
      }
    }

    return () => {
      amount = false;
    };
  }, [formState.data.accountName, onUpdateErrors, validatorFunc]);

  useEffect(() => {
    setTimeout(() => focus('accountName')(), 300);
  }, [focus]);

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={'Account name'}
      setVisible={setModalVisible}
      isUseModalV2
      titleTextAlign={'center'}
      onChangeModalVisible={onCancel}
      disabledOnPressBackDrop={true}
      isAllowSwipeDown={false}
      modalBaseV2Ref={modalRef}
      footer={footerNode}>
      <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center', paddingBottom: theme.paddingLG }}>
        {'Enter a name for your account.\n' + ' You can edit this later.'}
      </Typography.Text>
      <EditAccountInputText
        ref={formState.refs.accountName}
        label={formState.labels.accountName}
        editAccountInputStyle={{ marginBottom: theme.margin, paddingBottom: theme.paddingXS }}
        value={formState.data.accountName}
        onChangeText={onChangeAccountName}
        onSubmitField={
          formState.data.accountName && !formState.errors.accountName.length
            ? onSubmitField('accountName')
            : Keyboard.dismiss
        }
        accountType={accountType}
        isDisabled={isLoading}
        placeholder={'Enter the account name'}
        placeholderTextColor={theme.colorTextTertiary}
        errorMessages={formState.errors.accountName}
      />
    </SwModal>
  );
};
