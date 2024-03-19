import React, { useCallback, useMemo, useState } from 'react';
import GlobalModal from 'components/common/Modal/GlobalModal';
import { AppContentButton } from 'types/staticContent';

interface GlobalModalContextProviderProps {
  children?: React.ReactElement;
}

export type GlobalModalInfo = {
  visible?: boolean;
  title?: string;
  message?: string;
  messageIcon?: string;
  buttons?: AppContentButton[];
  type?: 'popup' | 'banner';
  onPressBtn?: (url?: string) => void;
};

export interface GlobalModalType {
  setGlobalModal: React.Dispatch<React.SetStateAction<GlobalModalInfo>>;
  hideGlobalModal: () => void;
}

let isShowedPopupModal = true;

export const GlobalModalContext = React.createContext({} as GlobalModalType);

export const GlobalModalContextProvider = ({ children }: GlobalModalContextProviderProps) => {
  const [globalModal, setGlobalModal] = useState<GlobalModalInfo>({});

  const hideGlobalModal = useCallback(() => {
    isShowedPopupModal = false;
    setGlobalModal(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setGlobalModal(prevState => ({
          ...prevState,
          title: '',
          message: '',
          messageIcon: undefined,
          buttons: [],
        })),
      300,
    );
  }, []);

  const modalVisible = useMemo(() => {
    if (globalModal?.type === 'popup') {
      return isShowedPopupModal && !!globalModal.visible;
    } else {
      return false;
    }
  }, [globalModal?.type, globalModal.visible]);

  return (
    <GlobalModalContext.Provider value={{ setGlobalModal, hideGlobalModal }}>
      {children}
      <GlobalModal
        visible={modalVisible}
        title={globalModal.title || ''}
        message={globalModal.message || ''}
        messageIcon={globalModal.messageIcon}
        onCloseModal={hideGlobalModal}
        buttons={globalModal.buttons || []}
        onPressButton={globalModal.onPressBtn}
      />
    </GlobalModalContext.Provider>
  );
};
