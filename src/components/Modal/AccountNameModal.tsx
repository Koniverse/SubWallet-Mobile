import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { Keyboard } from 'react-native';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';
import { validateAccountName } from 'messaging/index';
import { noop } from 'utils/function';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { CheckCircleIcon } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  isLoading?: boolean;
  accountType?: AccountProxyType; // for display account proxy tag
  onSubmit?: (name: string) => void;
  onCancel?: () => void;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  isUseForceHidden?: boolean;
}

export const AccountNameModal = ({
  accountType,
  isLoading,
  onSubmit,
  onCancel,
  modalVisible,
  setModalVisible,
  isUseForceHidden,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalRef = useRef<SWModalRefProps>(null);
  const timeOutRef = useRef<NodeJS.Timeout | null>(null);
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

  // useFormControl captures onSubmitForm once, so route it through a ref to the latest handler.
  const submitRef = useRef<(state: FormState) => void>(noop);

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: state => submitRef.current(state),
  });

  // Like the extension's form.submit(): the name is re-checked right before submitting instead of
  // gating the button on every keystroke, so typing never shows a spinner.
  const _onSubmit = useCallback(
    async (state: FormState) => {
      const name = state.data.accountName.trim();

      if (!name || validating) {
        return;
      }

      // Close the keyboard now so the sheet settles before the check runs, instead of dropping
      // by the keyboard height half a second later when the input gets disabled.
      Keyboard.dismiss();
      setValidating(true);
      const errors = await validatorFunc(name);
      setValidating(false);
      onUpdateErrors('accountName')(errors);

      if (!errors.length) {
        onSubmit?.(name);
      }
    },
    [onSubmit, onUpdateErrors, validating, validatorFunc],
  );

  submitRef.current = _onSubmit;

  const onChangeAccountName = (value: string) => {
    onChangeValue('accountName')(value);
  };

  const isDisabled = useMemo(
    () => !formState.data.accountName || isLoading || !!formState.errors.accountName.length,
    [formState.data.accountName, formState.errors.accountName.length, isLoading],
  );

  const footerNode = useMemo(
    () => (
      <Button
        icon={
          <Icon
            phosphorIcon={CheckCircleIcon}
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
    // Debounced inline check only updates the error text; it must not touch the button.
    if (amount && formState.data.accountName) {
      timeOutRef.current = setTimeout(() => {
        validatorFunc(formState.data.accountName)
          .then(res => {
            if (amount) {
              onUpdateErrors('accountName')(res);
            }
          })
          .catch((error: Error) => console.log('error validate name', error.message));
      }, 500);
    }

    return () => {
      amount = false;
    };
  }, [formState.data.accountName, onUpdateErrors, validatorFunc]);

  useEffect(() => {
    if (!modalVisible || isLoading) {
      return;
    }

    const focusTimeout = setTimeout(() => {
      focus('accountName')();
    }, 300);

    return () => {
      clearTimeout(focusTimeout);
    };
  }, [focus, isLoading, modalVisible]);

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={'Account name'}
      setVisible={setModalVisible}
      isUseModalV2
      isUseForceHidden={isUseForceHidden}
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
