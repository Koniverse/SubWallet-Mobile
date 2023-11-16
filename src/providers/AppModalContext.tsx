import React, { useState } from 'react';
import ConfirmModal from 'components/common/Modal/ConfirmModal';
import { IconProps, IconWeight } from 'phosphor-react-native';

interface AppModalContextProviderProps {
  children?: React.ReactElement;
}

export type ConfirmModalInfo = {
  visible?: boolean;
  title?: string;
  message?: string;
  messageIcon?: string;
  customIcon?: { icon: React.ElementType<IconProps>; color: string; weight: IconWeight };
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

  function hideConfirmModal() {
    setConfirmModal(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setConfirmModal(prevState => ({
          ...prevState,
          title: '',
          message: '',
          completeBtnTitle: '',
          messageIcon: undefined,
          customIcon: undefined,
          onCancelModal: undefined,
          onCompleteModal: undefined,
        })),
      300,
    );
  }

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
