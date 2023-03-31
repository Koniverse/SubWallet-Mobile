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
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import { SCAN_TYPE } from 'constants/qr';
import { EVM_ACCOUNT_TYPE, HIDE_MODAL_DURATION, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useModalScanner from 'hooks/qr/useModalScanner';
import { QrAccount } from 'types/qr/attach';
import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import ToastContainer from 'react-native-toast-notifications';
import { SelectAccountTypeModal } from 'components/Modal/SelectAccountTypeModal';
import { KeypairType } from '@polkadot/util-crypto/types';

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
  const { hasMasterPassword } = useSelector((state: RootState) => state.accountState);
  const [scanType, setScanType] = useState<SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET>(SCAN_TYPE.SECRET);
  const [selectTypeModalVisible, setSelectTypeModalVisible] = useState<boolean>(false);
  const onSuccess = useCallback(
    (data: QrAccount) => {
      switch (scanType) {
        case SCAN_TYPE.QR_SIGNER:
          navigation.navigate('AttachAccount', {
            screen: 'AttachQrSignerConfirm',
            params: data,
          });
          break;
        case SCAN_TYPE.SECRET:
          navigation.navigate('AttachAccount', {
            screen: 'ImportAccountQrConfirm',
            params: data,
          });
          break;
        default:
          break;
      }
    },
    [navigation, scanType],
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

  const { onOpenModal, onScan, isScanning, onHideModal } = useModalScanner(onSuccess);

  const onSelectAccountType = useCallback(
    (keyType: KeypairType) => {
      setSelectTypeModalVisible(false);
      if (hasMasterPassword) {
        navigation.navigate('CreateAccount', { keyTypes: keyType });
      } else {
        navigation.navigate('CreatePassword', { pathName: 'CreateAccount', state: keyType });
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
              navigation.navigate('CreatePassword', { pathName: 'CreateAccount', state: '' });
            }
          }
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: ShareNetwork,
        label: 'Derive from another account',
        onClickBtn: () => {
          onChangeCreateAccountModalVisible(false);
          if (hasMasterPassword) {
            navigation.navigate('CreateAccount', {});
          } else {
            navigation.navigate('CreatePassword', { pathName: 'CreateAccount', state: '' });
          }
        },
      },
    ];
  }, [allowToShowSelectType, hasMasterPassword, navigation, onChangeCreateAccountModalVisible]);

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
          if (hasMasterPassword) {
            const result = await requestCameraPermission();

            if (result === RESULTS.GRANTED) {
              setScanType(SCAN_TYPE.SECRET);
              onChangeImportAccountModalVisible(false);
              setTimeout(() => {
                onOpenModal();
              }, HIDE_MODAL_DURATION);
            }
          } else {
            onChangeImportAccountModalVisible(false);
            navigation.navigate('CreatePassword', { pathName: 'ScanByQrCode' });
          }
        },
      },
    ],
    [hasMasterPassword, navigation, onChangeImportAccountModalVisible, onOpenModal],
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
        label: 'Attach QR-Signer account',
        onClickBtn: async () => {
          if (hasMasterPassword) {
            const result = await requestCameraPermission();

            if (result === RESULTS.GRANTED) {
              setScanType(SCAN_TYPE.QR_SIGNER);
              onChangeAttachAccountModalVisible(false);
              setTimeout(() => {
                onOpenModal();
              }, HIDE_MODAL_DURATION);
            }
          } else {
            onChangeAttachAccountModalVisible(false);
            navigation.navigate('CreatePassword', { pathName: 'AttachQR-signer' });
          }
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: DeviceTabletCamera,
        label: 'Attach Keystone account',
        onClickBtn: () => {
          show(i18n.common.comingSoon);
        },
      },
      {
        backgroundColor: '#2DA73F',
        icon: Eye,
        label: 'Attach read-only account',
        onClickBtn: () => {
          onChangeAttachAccountModalVisible(false);
          if (hasMasterPassword) {
            navigation.navigate('AttachAccount', {
              screen: 'AttachReadOnly',
            });
          } else {
            navigation.navigate('CreatePassword', { pathName: 'AttachAccount', state: 'AttachReadOnly' });
          }
        },
      },
    ],
    [hasMasterPassword, navigation, onChangeAttachAccountModalVisible, onOpenModal, show],
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
        onSelectSubstrateAccount={() => onSelectAccountType(SUBSTRATE_ACCOUNT_TYPE)}
        onSelectEvmAccount={() => onSelectAccountType(EVM_ACCOUNT_TYPE)}
      />

      <QrAddressScanner visible={isScanning} onHideModal={onHideModal} onSuccess={onScan} type={scanType} />
    </>
  );
};
