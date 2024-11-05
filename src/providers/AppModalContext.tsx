import React, { useCallback, useMemo, useState } from 'react';
import ConfirmModal from 'components/common/Modal/ConfirmModal';
import { ReceiveModal } from 'screens/Home/Crypto/ReceiveModal';
import { noop } from 'utils/function';
import { VoidFunction } from 'types/index';
import { DeriveAccountActionModal } from 'components/common/Modal/DeriveAccountModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

interface AppModalContextProviderProps {
  children?: React.ReactElement;
}

export type ConfirmModalInfo = {
  visible?: boolean;
  title?: string;
  message?: string | React.ReactNode;
  messageIcon?: string;
  customIcon?: React.ReactNode;
  completeBtnTitle?: string;
  cancelBtnTitle?: string;
  onCancelModal?: () => void | undefined;
  onCompleteModal?: () => void | undefined;
};

export type AddressQrModalInfo = {
  visible?: boolean;
  address?: string;
  selectNetwork?: string;
  onBack?: VoidFunction;
};

export type DeriveModalInfo = {
  visible?: boolean;
  proxyId?: string;
  onCompleteCb?: () => void;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
};

export interface AppModal {
  confirmModal: {
    setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
    hideConfirmModal: () => void;
  };
  addressQrModal: {
    addressModalState: AddressQrModalInfo;
    setAddressQrModal: React.Dispatch<React.SetStateAction<AddressQrModalInfo>>;
    hideAddressQrModal: () => void;
  };
  deriveModal: {
    deriveModalState: DeriveModalInfo;
    setDeriveModalState: React.Dispatch<React.SetStateAction<DeriveModalInfo>>;
    hideDeriveModal: () => void;
  };
}

export const AppModalContext = React.createContext({} as AppModal);

export const AppModalContextProvider = ({ children }: AppModalContextProviderProps) => {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalInfo>({});
  const [addressQrModalState, setAddressQrModal] = useState<AddressQrModalInfo>({});
  const [deriveModalState, setDeriveModalState] = useState<DeriveModalInfo>({});

  const hideConfirmModal = useCallback(() => {
    setConfirmModal(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setConfirmModal(prevState => ({
          ...prevState,
          title: '',
          message: '',
          completeBtnTitle: '',
          messageIcon: undefined,
          onCancelModal: undefined,
          onCompleteModal: undefined,
        })),
      300,
    );
  }, []);

  const hideAddressQrModal = useCallback(() => {
    setAddressQrModal(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setAddressQrModal(prevState => ({
          ...prevState,
          address: '',
          selectNetwork: '',
          onBack: undefined,
        })),
      300,
    );
  }, []);

  const hideDeriveModal = useCallback(() => {
    setDeriveModalState(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setDeriveModalState(prevState => ({
          ...prevState,
          proxyId: '',
          selectNetwork: '',
          onBack: undefined,
        })),
      300,
    );
  }, []);

  const contextValue: AppModal = useMemo(
    () => ({
      confirmModal: {
        setConfirmModal,
        hideConfirmModal,
      },
      addressQrModal: {
        addressModalState: addressQrModalState,
        setAddressQrModal,
        hideAddressQrModal,
      },
      deriveModal: {
        deriveModalState: deriveModalState,
        setDeriveModalState,
        hideDeriveModal,
      },
    }),
    [addressQrModalState, deriveModalState, hideAddressQrModal, hideConfirmModal, hideDeriveModal],
  );
  // TODO: Add back and cancel
  return (
    <AppModalContext.Provider value={contextValue}>
      {children}
      <ConfirmModal
        visible={confirmModal.visible || false}
        title={confirmModal.title || ''}
        message={confirmModal.message || ''}
        messageIcon={confirmModal.messageIcon}
        customIcon={confirmModal.customIcon}
        onCancelModal={confirmModal.onCancelModal}
        onCompleteModal={confirmModal.onCompleteModal}
        completeBtnTitle={confirmModal.completeBtnTitle}
        cancelBtnTitle={confirmModal.cancelBtnTitle}
      />

      {addressQrModalState.visible && (
        <ReceiveModal
          modalVisible={addressQrModalState.visible}
          setModalVisible={noop}
          address={addressQrModalState.address}
          selectedNetwork={addressQrModalState.selectNetwork}
          onBack={addressQrModalState.onBack}
          isUseModalV2={false}
        />
      )}

      {deriveModalState.visible && deriveModalState.proxyId && deriveModalState.navigation && (
        <DeriveAccountActionModal
          modalVisible={deriveModalState.visible}
          setModalVisible={noop}
          showConfirmModal={setConfirmModal}
          hideConfirmModal={hideConfirmModal}
          closeModal={hideDeriveModal}
          proxyId={deriveModalState.proxyId}
          onCompleteCb={deriveModalState.onCompleteCb}
          navigation={deriveModalState.navigation}
        />
      )}
    </AppModalContext.Provider>
  );
};
