import DeriveAccountModal from 'components/common/Modal/DeriveAccountModal';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import AccountActionSelectModal from 'components/Modal/AccountActionSelectModal';
import {
  DeviceTabletCamera,
  Eye,
  FileJs,
  Leaf,
  PlusCircle,
  QrCode,
  ShareNetwork,
  Swatches,
  Wallet,
} from 'phosphor-react-native';
import { EVM_ACCOUNT_TYPE, HIDE_MODAL_DURATION } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import ToastContainer from 'react-native-toast-notifications';
import { SelectAccountTypeModal } from 'components/Modal/SelectAccountTypeModal';
import { KeypairType } from '@polkadot/util-crypto/types';
import { canDerive } from '@subwallet/extension-base/utils';

interface Props {
  createAccountModalVisible: boolean;
  importAccountModalVisible: boolean;
  attachAccountModalVisible: boolean;
  onChangeCreateAccountModalVisible: (value: boolean) => void;
  onChangeImportAccountModalVisible: (value: boolean) => void;
  onChangeAttachAccountModalVisible: (value: boolean) => void;
  allowToShowSelectType?: boolean;
}

export const AccountCreationArea = ({
  allowToShowSelectType = false,
  createAccountModalVisible,
  importAccountModalVisible,
  attachAccountModalVisible,
  onChangeCreateAccountModalVisible,
  onChangeImportAccountModalVisible,
  onChangeAttachAccountModalVisible,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const { accounts, hasMasterPassword } = useSelector((state: RootState) => state.accountState);
  const [selectTypeModalVisible, setSelectTypeModalVisible] = useState<boolean>(false);
  const [selectAccountDeriveVisible, setSelectAccountDeriveVisible] = useState<boolean>(false);

  const canDerivedAccounts = useMemo(
    () =>
      accounts
        .filter(({ isExternal }) => !isExternal)
        .filter(
          ({ isMasterAccount, type }) =>
            canDerive(type) && (type !== EVM_ACCOUNT_TYPE || (isMasterAccount && type === EVM_ACCOUNT_TYPE)),
        ),
    [accounts],
  );

  const toastRef = useRef<ToastContainer>(null);
  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text);
    }
  }, []);

  const onSelectAccountTypes = useCallback(
    (keyTypes: KeypairType[]) => {
      setSelectTypeModalVisible(false);
      if (hasMasterPassword) {
        navigation.navigate('CreateAccount', { keyTypes: keyTypes });
      } else {
        navigation.navigate('CreatePassword', { pathName: 'CreateAccount', state: keyTypes });
      }
    },
    [hasMasterPassword, navigation],
  );

  const createAccountAction = useMemo(() => {
    return [
      {
        backgroundColor: '#51BC5E',
        icon: PlusCircle,
        label: 'Create with new Seed Phrase',
        onClickBtn: () => {
          onChangeCreateAccountModalVisible(false);

          if (allowToShowSelectType) {
            setTimeout(() => setSelectTypeModalVisible(true), HIDE_MODAL_DURATION);
          } else {
            if (hasMasterPassword) {
              navigation.navigate('CreateAccount', {});
            } else {
              navigation.navigate('CreatePassword', { pathName: 'CreateAccount' });
            }
          }
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: ShareNetwork,
        label: 'Derive from another account',
        disabled: !canDerivedAccounts.length,
        onClickBtn: () => {
          onChangeCreateAccountModalVisible(false);
          setTimeout(() => setSelectAccountDeriveVisible(true), HIDE_MODAL_DURATION);
        },
      },
    ];
  }, [
    allowToShowSelectType,
    canDerivedAccounts.length,
    hasMasterPassword,
    navigation,
    onChangeCreateAccountModalVisible,
  ]);

  const importAccountActions = useMemo(
    () => [
      {
        backgroundColor: '#51BC5E',
        icon: Leaf,
        label: 'Import from Seed Phrase',
        onClickBtn: () => {
          onChangeImportAccountModalVisible(false);
          if (hasMasterPassword) {
            navigation.navigate('ImportSecretPhrase');
          } else {
            navigation.navigate('CreatePassword', { pathName: 'ImportSecretPhrase' });
          }
        },
      },
      {
        backgroundColor: '#E68F25',
        icon: FileJs,
        label: 'Restore from Polkadot {.js}',
        onClickBtn: () => {
          onChangeImportAccountModalVisible(false);
          if (hasMasterPassword) {
            navigation.navigate('RestoreJson');
          } else {
            navigation.navigate('CreatePassword', { pathName: 'RestoreJson' });
          }
        },
      },
      {
        backgroundColor: '#4D4D4D',
        icon: Wallet,
        label: 'Import from MetaMask',
        onClickBtn: () => {
          onChangeImportAccountModalVisible(false);
          if (hasMasterPassword) {
            navigation.navigate('ImportPrivateKey');
          } else {
            navigation.navigate('CreatePassword', { pathName: 'ImportPrivateKey' });
          }
        },
      },
      {
        backgroundColor: '#2565E6',
        icon: QrCode,
        label: 'Import by QR Code',
        onClickBtn: async () => {
          onChangeImportAccountModalVisible(false);
          if (hasMasterPassword) {
            navigation.navigate('ImportQrCode');
          } else {
            navigation.navigate('CreatePassword', { pathName: 'ImportQrCode' });
          }
        },
      },
    ],
    [hasMasterPassword, navigation, onChangeImportAccountModalVisible],
  );

  const attachAccountActions = useMemo(
    () => [
      {
        backgroundColor: '#E68F25',
        icon: Swatches,
        label: 'Connect Ledger device',
        onClickBtn: () => {
          show(i18n.common.comingSoon);
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: QrCode,
        label: 'Attach a Polkadot Vault account',
        onClickBtn: async () => {
          if (hasMasterPassword) {
            onChangeAttachAccountModalVisible(false);
            navigation.navigate('ConnectParitySigner');
          } else {
            onChangeAttachAccountModalVisible(false);
            navigation.navigate('CreatePassword', { pathName: 'ConnectParitySigner' });
          }
        },
      },
      {
        backgroundColor: '#2565E6',
        icon: DeviceTabletCamera,
        label: 'Attach Keystone account',
        onClickBtn: async () => {
          if (hasMasterPassword) {
            onChangeAttachAccountModalVisible(false);
            navigation.navigate('ConnectKeystone');
          } else {
            onChangeAttachAccountModalVisible(false);
            navigation.navigate('CreatePassword', { pathName: 'ConnectKeystone' });
          }
        },
      },
      {
        backgroundColor: '#2DA73F',
        icon: Eye,
        label: 'Attach watch-only account',
        onClickBtn: () => {
          onChangeAttachAccountModalVisible(false);
          setTimeout(() => {
            if (hasMasterPassword) {
              navigation.navigate('AttachReadOnly');
            } else {
              navigation.navigate('CreatePassword', { pathName: 'AttachReadOnly' });
            }
          }, 200);
        },
      },
    ],
    [hasMasterPassword, navigation, onChangeAttachAccountModalVisible, show],
  );
  return (
    <>
      <AccountActionSelectModal
        modalTitle={'Create new account'}
        modalVisible={createAccountModalVisible}
        onChangeModalVisible={() => onChangeCreateAccountModalVisible(false)}
        items={createAccountAction}
      />

      <AccountActionSelectModal
        modalTitle={'Import account'}
        modalVisible={importAccountModalVisible}
        onChangeModalVisible={() => onChangeImportAccountModalVisible(false)}
        items={importAccountActions}
      />

      <AccountActionSelectModal
        modalTitle={'Attach account'}
        modalVisible={attachAccountModalVisible}
        onChangeModalVisible={() => onChangeAttachAccountModalVisible(false)}
        items={attachAccountActions}
        toastRef={toastRef}
      />

      <SelectAccountTypeModal
        modalVisible={selectTypeModalVisible}
        onChangeModalVisible={() => setSelectTypeModalVisible(false)}
        onConfirm={onSelectAccountTypes}
      />

      <DeriveAccountModal
        modalVisible={selectAccountDeriveVisible}
        onChangeModalVisible={() => setSelectAccountDeriveVisible(false)}
      />
    </>
  );
};
