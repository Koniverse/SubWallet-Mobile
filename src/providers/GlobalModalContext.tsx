import React, { useCallback, useMemo, useRef, useState } from 'react';
import GlobalModal from 'components/common/Modal/GlobalModal';
import { AppContentButton } from 'types/staticContent';

interface GlobalModalContextProviderProps {
  children?: React.ReactElement;
}

export type GlobalModalInfo = {
  visible?: boolean;
  title?: string;
  message?: string;
  buttons?: AppContentButton[];
  externalButtons?: React.ReactNode;
  type?: 'popup' | 'banner' | 'confirmation';
  onPressBtn?: (url?: string) => void;
};

export interface GlobalModalType {
  setGlobalModal: React.Dispatch<React.SetStateAction<GlobalModalInfo>>;
  hideGlobalModal: () => void;
}

export const GlobalModalContext = React.createContext({} as GlobalModalType);

export const GlobalModalContextProvider = ({ children }: GlobalModalContextProviderProps) => {
  const [globalModal, setGlobalModal] = useState<GlobalModalInfo>({});
  const isShowedPopupModalRef = useRef<boolean>(true);
  const hideGlobalModal = useCallback(() => {
    isShowedPopupModalRef.current = false;
    setGlobalModal(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setGlobalModal(prevState => ({
          ...prevState,
          title: '',
          message: '',
          buttons: [],
          externalButtons: <></>,
        })),
      300,
    );
  }, []);

  const modalVisible = useMemo(() => {
    if (globalModal?.type === 'popup') {
      return isShowedPopupModalRef.current && !!globalModal.visible;
    } else {
      return !!globalModal.visible;
    }
  }, [globalModal?.type, globalModal.visible]);

  return (
    <GlobalModalContext.Provider value={{ setGlobalModal, hideGlobalModal }}>
      {children}
      <GlobalModal
        visible={modalVisible}
        title={globalModal.title || ''}
        message={globalModal.message || ''}
        onCloseModal={hideGlobalModal}
        buttons={globalModal.buttons || []}
        onPressButton={globalModal.onPressBtn}
        externalButtons={globalModal.externalButtons}
      />
    </GlobalModalContext.Provider>
  );
};
