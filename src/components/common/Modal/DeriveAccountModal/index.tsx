import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, Logo, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { Platform, View } from 'react-native';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';
import { deriveAccountV3, deriveSuggest, validateAccountName, validateDerivePathV2 } from 'messaging/index';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { CheckCircle, Warning } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import { AccountProxyType, DerivePathInfo } from '@subwallet/extension-base/types';
import InputText from 'components/Input/InputText';
import { KeypairType } from '@subwallet/keyring/types';
import { ConfirmModalInfo } from 'providers/AppModalContext';
import { EditAccountInputText } from 'components/EditAccountInputText';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

const alertTypes: DerivePathInfo['type'][] = ['unified', 'ton', 'ethereum'];

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

  const setInfo = useCallback((data: DerivePathInfo | undefined) => {
    infoRef.current = data;
    setUpdate({});
  }, []);

  const suriValidator = useCallback(
    (suri: string) => {
      console.log('suri:', suri);
      let result: string[] = [];
      setInfo(undefined);
      if (!suri) {
        result = ['Derive path is required'];
      }

      validateDerivePathV2({
        suri,
        proxyId,
      })
        .then(rs => {
          console.log('rs', rs);
          if (rs.error) {
            result = [rs.error.message];
          } else {
            setInfo(rs.info);
            result = [];
          }
        })
        .catch((e: Error) => {
          result = [e.message];
        });
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
          onUpdateErrors('accountName')([e.message]);
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
        validateFunc: suriValidator,
      },
      accountName: {
        name: i18n.common.accountName,
        value: '',
        require: true,
        validateFunc: (value: string) => {
          return validatorFunc(value);
        },
      },
    }),
    [suriValidator, validatorFunc],
  );

  const keypairTypeLogoMap = useMemo((): Record<KeypairType, string> => {
    return {
      sr25519: 'polkadot',
      ed25519: 'polkadot',
      ecdsa: 'polkadot',
      ethereum: 'ethereum',
      ton: 'ton',
      'ton-native': 'ton',
      'bitcoin-44': 'bitcoin',
      'bitcoin-84': 'bitcoin',
      'bitcoin-86': 'bitcoin',
      'bittest-44': 'bitcoin',
      'bittest-84': 'bitcoin',
      'bittest-86': 'bitcoin',
    };
  }, []);

  const { formState, onChangeValue, onUpdateErrors, onSubmitField, focus } = useFormControl(formConfig, {
    onSubmitForm: onPressSubmit(onSubmit),
  });

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
    return loading || !formState.data.accountName || !formState.data.suri;
  }, [formState.data.accountName, formState.data.suri, loading]);

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
              iconColor={disabled ? theme.colorTextTertiary : theme.colorWhite}
              weight={'fill'}
            />
          }
          disabled={disabled}
          onPress={onPressSubmit(onSubmit)}
          loading={loading}>
          {'Confirm'}
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
        onChangeText={onChangeValue('suri')}
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
        onSubmitField={onSubmitField('accountName')}
        accountType={networkType === 'unified' ? AccountProxyType.UNIFIED : AccountProxyType.SOLO}
        isDisabled={loading}
        errorMessages={formState.errors.accountName}
        suffix={
          <View style={{ flexDirection: 'row' }}>
            {networkType ? (
              networkType === 'unified' ? (
                accountProxy?.accounts.map(({ type }) => (
                  <View style={{ marginLeft: -theme.marginXS }}>
                    <Logo size={16} network={keypairTypeLogoMap[type]} />
                  </View>
                ))
              ) : (
                <Logo size={16} network={keypairTypeLogoMap[networkType]} />
              )
            ) : null}
          </View>
        }
      />
    </SwModal>
  );
};
