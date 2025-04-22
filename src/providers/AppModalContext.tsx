import React, { useCallback, useMemo, useState } from 'react';
import ConfirmModal from 'components/common/Modal/ConfirmModal';
import { ReceiveModal } from 'screens/Home/Crypto/ReceiveModal';
import { noop } from 'utils/function';
import { VoidFunction } from 'types/index';
import { DeriveAccountActionModal } from 'components/common/Modal/DeriveAccountModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import TransactionProcessDetailModal from 'components/Modal/TransactionProcessDetailModal';
import TransactionStepsModal from 'components/Modal/TransactionStepsModal';
import { ProcessType } from '@subwallet/extension-base/types';
import { ProcessStepItemType } from 'components/ProcessStepItem';
import SelectAddressFormatModal from 'components/Modal/SelectAddressFormatModal';

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
  disabledOnPressBackDrop?: boolean;
  isAllowSwipeDown?: boolean;
  isShowCancelButton?: boolean;
};

export type AddressQrModalInfo = {
  visible?: boolean;
  address?: string;
  selectNetwork?: string;
  isNewFormat?: boolean;
  onBack?: VoidFunction;
  isOpenFromAccountDetailScreen?: boolean;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
};

export type DeriveModalInfo = {
  visible?: boolean;
  proxyId?: string;
  onCompleteCb?: () => void;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
};

export type TransactionProcessDetailInfo = {
  visible?: boolean;
  transactionProcessId?: string;
};

export type SelectAddressFormatModalState = {
  visible?: boolean;
  name?: string;
  address?: string;
  chainSlug?: string;
  onBack?: VoidFunction;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
};

export type TransactionStepsInfo = {
  visible?: boolean;
  type?: ProcessType;
  items?: ProcessStepItemType[];
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
  transactionStepsModal: {
    transactionStepsModalState: TransactionStepsInfo;
    setTransactionStepsModalState: React.Dispatch<React.SetStateAction<TransactionStepsInfo>>;
    hideTransactionStepsModal: () => void;
  };
  transactionProcessDetailModal: {
    transactionProcessDetailModalState: TransactionProcessDetailInfo;
    setTransactionProcessDetailModalState: React.Dispatch<React.SetStateAction<TransactionProcessDetailInfo>>;
    hideTransactionProcessDetailModal: () => void;
  };
  selectAddressFormatModal: {
    selectAddressFormatModalState: SelectAddressFormatModalState;
    setSelectAddressFormatModalState: React.Dispatch<React.SetStateAction<SelectAddressFormatModalState>>;
    hideSelectAddressFormatModal: () => void;
  };
}

export const AppModalContext = React.createContext({} as AppModal);

export const AppModalContextProvider = ({ children }: AppModalContextProviderProps) => {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalInfo>({});
  const [addressQrModalState, setAddressQrModal] = useState<AddressQrModalInfo>({});
  const [deriveModalState, setDeriveModalState] = useState<DeriveModalInfo>({});
  const [transactionStepsModalState, setTransactionStepsModalState] = useState<TransactionStepsInfo>({});
  const [transactionProcessDetailModalState, setTransactionProcessDetailModalState] =
    useState<TransactionProcessDetailInfo>({});
  const [selectAddressFormatModalState, setSelectAddressFormatModalState] = useState<SelectAddressFormatModalState>({});

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
          navigation: undefined,
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

  const hideTransactionStepsModal = useCallback(() => {
    setTransactionStepsModalState(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setTransactionStepsModalState(prevState => ({
          ...prevState,
          transactionProcessId: '',
        })),
      300,
    );
  }, []);

  const hideTransactionProcessDetailModal = useCallback(() => {
    setTransactionProcessDetailModalState(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setTransactionProcessDetailModalState(prevState => ({
          ...prevState,
          transactionProcessId: '',
        })),
      300,
    );
  }, []);

  const hideSelectAddressFormatModal = useCallback(() => {
    setSelectAddressFormatModalState(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setSelectAddressFormatModalState(prevState => ({
          ...prevState,
          address: '',
          chainSlug: '',
          name: '',
          navigation: undefined,
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
      transactionStepsModal: {
        transactionStepsModalState: transactionStepsModalState,
        setTransactionStepsModalState: setTransactionStepsModalState,
        hideTransactionStepsModal,
      },
      transactionProcessDetailModal: {
        transactionProcessDetailModalState: transactionProcessDetailModalState,
        setTransactionProcessDetailModalState: setTransactionProcessDetailModalState,
        hideTransactionProcessDetailModal,
      },
      selectAddressFormatModal: {
        selectAddressFormatModalState: selectAddressFormatModalState,
        setSelectAddressFormatModalState: setSelectAddressFormatModalState,
        hideSelectAddressFormatModal,
      },
    }),
    [
      addressQrModalState,
      deriveModalState,
      hideAddressQrModal,
      hideConfirmModal,
      hideDeriveModal,
      hideSelectAddressFormatModal,
      hideTransactionProcessDetailModal,
      hideTransactionStepsModal,
      selectAddressFormatModalState,
      transactionProcessDetailModalState,
      transactionStepsModalState,
    ],
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
        isAllowSwipeDown={confirmModal.isAllowSwipeDown}
        disabledOnPressBackDrop={confirmModal.disabledOnPressBackDrop}
        isShowCancelButton={confirmModal.isShowCancelButton}
      />

      {addressQrModalState.visible && (
        <ReceiveModal
          modalVisible={addressQrModalState.visible}
          setModalVisible={noop}
          address={addressQrModalState.address}
          selectedNetwork={addressQrModalState.selectNetwork}
          onBack={addressQrModalState.onBack}
          isUseModalV2={false}
          isOpenFromAccountDetailScreen={addressQrModalState.isOpenFromAccountDetailScreen}
          isNewFormat={addressQrModalState.isNewFormat}
          navigation={addressQrModalState.navigation}
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

      {transactionProcessDetailModalState.visible && transactionProcessDetailModalState.transactionProcessId && (
        <TransactionProcessDetailModal
          modalVisible={transactionProcessDetailModalState.visible}
          setModalVisible={noop}
          processId={transactionProcessDetailModalState.transactionProcessId}
          onCancel={hideTransactionProcessDetailModal}
        />
      )}

      {transactionStepsModalState.visible &&
        transactionStepsModalState.type &&
        transactionStepsModalState.items &&
        transactionStepsModalState.items.length && (
          <TransactionStepsModal
            modalVisible={transactionStepsModalState.visible}
            setModalVisible={noop}
            items={transactionStepsModalState.items}
            onCancel={hideTransactionStepsModal}
            type={transactionStepsModalState.type}
          />
        )}

      {selectAddressFormatModalState.visible &&
        selectAddressFormatModalState.address &&
        selectAddressFormatModalState.name &&
        selectAddressFormatModalState.chainSlug && (
          <SelectAddressFormatModal
            visible={selectAddressFormatModalState.visible}
            setVisible={noop}
            address={selectAddressFormatModalState.address}
            name={selectAddressFormatModalState.name}
            onCancel={hideSelectAddressFormatModal}
            chainSlug={selectAddressFormatModalState.chainSlug}
            navigation={selectAddressFormatModalState.navigation}
          />
        )}
    </AppModalContext.Provider>
  );
};
