import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { Keyboard, Platform } from 'react-native';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';
import { deriveAccountV3, deriveSuggest, validateAccountName, validateDerivePathV2 } from 'messaging/index';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { CheckCircle, Warning } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import { AccountChainType, AccountProxyType, DerivePathInfo } from '@subwallet/extension-base/types';
import InputText from 'components/Input/InputText';
import { BitcoinKeypairTypes } from '@subwallet/keyring/types';
import { ConfirmModalInfo } from 'providers/AppModalContext';
import { EditAccountInputText } from 'components/EditAccountInputText';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAccountChainTypeFromKeypairType } from '@subwallet/extension-base/utils';
import { AccountChainTypeLogos } from 'components/AccountProxy/AccountChainTypeLogos';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  proxyId: string;
  onCompleteCb?: () => void;
  closeModal: () => void;
  showConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  hideConfirmModal: () => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const alertTypes: DerivePathInfo['type'][] = ['unified', 'ton', 'ethereum', 'cardano', ...BitcoinKeypairTypes];

const convertToChainType = (type?: DerivePathInfo['type'], chainTypes?: AccountChainType[]): AccountChainType[] => {
  if (!type) {
    return [];
  }

  if (type === 'unified') {
    return chainTypes || [];
  }

  return [getAccountChainTypeFromKeypairType(type)];
};

const normalizeApostrophes = (input: string) => {
  return input.replace(/[\u2018\u2019]/g, "'"); // U+2018 (LEFT) and U+2019 (RIGHT) single quotation marks
};

export const DeriveAccountActionModal = ({
  proxyId,
  onCompleteCb,
  setModalVisible,
  modalVisible,
  closeModal,
  showConfirmModal,
  hideConfirmModal,
  navigation,
}: Props) => {
  const accountProxy = useGetAccountProxyById(proxyId);
  const { onPress: onPressSubmit } = useUnlockModal(navigation);
  const theme = useSubWalletTheme().swThemes;
  const [, setUpdate] = useState({});
  const infoRef = useRef<DerivePathInfo | undefined>();
  const [loading, setLoading] = useState(false);
  const networkType = infoRef.current?.type;
  const chainTypes = useMemo(
    () => convertToChainType(networkType, accountProxy?.chainTypes),
    [networkType, accountProxy?.chainTypes],
  );
  const timeOutRef = useRef<NodeJS.Timeout>();
  const modalRef = useRef<SWModalRefProps>(null);
  const [validating, setValidating] = useState(false);
  const accountNameValidator = useCallback(async (value: string) => {
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

  const setInfo = useCallback((data: DerivePathInfo | undefined) => {
    infoRef.current = data;
    setUpdate({});
  }, []);

  const suriValidator = useCallback(
    async (suri: string) => {
      let result: string[] = [];
      setInfo(undefined);
      if (!suri) {
        result = ['Derive path is required'];
      } else {
        try {
          const rs = await validateDerivePathV2({
            suri,
            proxyId,
          });

          if (rs.error) {
            result = [rs.error.message];
          } else {
            setInfo(rs.info);
            result = [];
          }
        } catch (e) {
          result = ['Derive path is invalid'];
        }
      }

      return result;
    },
    [proxyId, setInfo],
  );

  const onSubmit = () => {
    const _suri = formState.data.suri.trim();
    const _name = formState.data.accountName.trim();
    const _info = infoRef.current;

    if (!_info) {
      return;
    }

    const _doSubmit = () => {
      setLoading(true);
      deriveAccountV3({
        proxyId,
        suri: _suri,
        name: _name,
      })
        .then(() => {
          closeModal();
          onCompleteCb && onCompleteCb();
          //go back home
        })
        .catch((e: Error) => {
          onUpdateErrors('suri')([e.message]);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    if (_info.depth === 2 && alertTypes.includes(_info.type)) {
      showConfirmModal({
        visible: true,
        title: 'Incompatible account',
        message:
          'This derived account can only be used in SubWallet and won’t be compatible with other wallets. Do you still want to continue?',
        customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
        onCompleteModal: () => {
          _doSubmit();
          hideConfirmModal();
        },
        onCancelModal: () => {
          hideConfirmModal();
        },
        completeBtnTitle: 'Continue',
      });
    } else {
      _doSubmit();
    }
  };

  const formConfig = useMemo(
    (): FormControlConfig => ({
      suri: {
        name: 'Suri',
        value: '',
        require: true,
      },
      accountName: {
        name: i18n.common.accountName,
        value: '',
        require: true,
      },
    }),
    [],
  );

  const { formState, onChangeValue, onUpdateErrors, onSubmitField, focus } = useFormControl(formConfig, {
    onSubmitForm: onPressSubmit(onSubmit),
  });

  const onChangeSuri = useCallback(
    (t: string) => {
      const transformText = normalizeApostrophes(t);
      onChangeValue('suri')(transformText);
    },
    [onChangeValue],
  );

  const onChangeAccountName = (value: string) => {
    if (!value) {
      onUpdateErrors('accountName')([]);
    }

    onChangeValue('accountName')(value);
  };

  useEffect(() => {
    setTimeout(() => focus('accountName')(), 100);
  }, [focus]);

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      if (formState.data.suri) {
        setValidating(true);
        timeOutRef.current = setTimeout(() => {
          suriValidator(formState.data.suri)
            .then(res => {
              onUpdateErrors('suri')(res);
            })
            .catch((error: Error) => console.log('error suri', error.message))
            .finally(() => {
              if (amount) {
                setValidating(false);
              }
            });
        }, 1000);
      } else {
        setValidating(false);
      }
    }

    return () => {
      amount = false;
    };
  }, [formState.data.suri, onUpdateErrors, suriValidator]);

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      if (formState.data.accountName) {
        setValidating(true);
        timeOutRef.current = setTimeout(() => {
          accountNameValidator(formState.data.accountName)
            .then(res => {
              onUpdateErrors('accountName')(res);
            })
            .catch((error: Error) => console.log('error account name', error.message))
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
  }, [accountNameValidator, formState.data.accountName, onUpdateErrors]);

  useEffect(() => {
    let cancel = false;

    if (proxyId && modalVisible) {
      deriveSuggest({
        proxyId,
      })
        .then(rs => {
          if (!cancel) {
            if (rs.info) {
              const suri = rs.info.derivationPath || rs.info.suri;

              onChangeValue('suri')(suri);
            }
          }
        })
        .catch(console.error);
    }

    return () => {
      cancel = true;
    };
  }, [modalVisible, onChangeValue, proxyId]);

  const disabled = useMemo(() => {
    return (
      loading ||
      !formState.data.accountName ||
      !formState.data.suri ||
      !!formState.errors.accountName.length ||
      !!formState.errors.suri.length ||
      validating
    );
  }, [
    formState.data.accountName,
    formState.data.suri,
    formState.errors.accountName,
    formState.errors.suri,
    loading,
    validating,
  ]);

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={'Create derived account'}
      setVisible={setModalVisible}
      isUseModalV2
      titleTextAlign={'center'}
      onChangeModalVisible={closeModal}
      isAllowSwipeDown={Platform.OS === 'ios'}
      modalBaseV2Ref={modalRef}
      footer={
        <Button
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              iconColor={disabled ? theme.colorTextLight5 : theme.colorWhite}
              weight={'fill'}
            />
          }
          disabled={disabled}
          onPress={onPressSubmit(onSubmit)}
          loading={loading || validating}>
          {'Create account'}
        </Button>
      }>
      <Typography.Text style={{ color: theme.colorTextDescription, textAlign: 'center' }}>
        <Typography.Text>{'You are creating a derived account from account '}</Typography.Text>
        <Typography.Text style={{ color: theme.colorWhite }}>{`${accountProxy?.name}. `}</Typography.Text>
        <Typography.Text>{'Customize the derivation path and name the account as you wish'}</Typography.Text>
      </Typography.Text>
      <InputText
        ref={formState.refs.suri}
        label={'Derivation path'}
        placeholder={'Derivation path'}
        onChangeText={onChangeSuri}
        value={formState.data.suri}
        errorMessages={formState.errors.suri}
      />

      <EditAccountInputText
        ref={formState.refs.accountName}
        label={formState.labels.accountName}
        editAccountInputStyle={{ marginBottom: theme.marginXS, paddingBottom: theme.sizeXS }}
        value={formState.data.accountName}
        onChangeText={onChangeAccountName}
        placeholderTextColor={theme.colorTextTertiary}
        placeholder={'Account name'}
        onSubmitField={disabled ? Keyboard.dismiss : onSubmitField('accountName')}
        accountType={networkType === 'unified' ? AccountProxyType.UNIFIED : AccountProxyType.SOLO}
        isDisabled={loading}
        errorMessages={formState.errors.accountName}
        suffix={<AccountChainTypeLogos chainTypes={chainTypes} />}
      />
    </SwModal>
  );
};
