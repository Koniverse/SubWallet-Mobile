import React, { useCallback, useState } from 'react';
import ConfirmModal from 'components/common/Modal/ConfirmModal';

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
  onCancelModal?: () => void | undefined;
  onCompleteModal?: () => void | undefined;
};

export interface AppModal {
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  hideConfirmModal: () => void;
}

export const AppModalContext = React.createContext({} as AppModal);

export const AppModalContextProvider = ({ children }: AppModalContextProviderProps) => {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalInfo>({});

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

  return (
    <AppModalContext.Provider value={{ setConfirmModal, hideConfirmModal }}>
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
      />
    </AppModalContext.Provider>
  );
};
