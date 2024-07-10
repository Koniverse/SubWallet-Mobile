import React, { useCallback, useState } from 'react';
import { AppContentButtonInstruction } from 'types/staticContent';
import { GlobalInstructionModal } from 'components/common/Modal/GlobalModal/GlobalInstructionModal';
import { BoxProps } from 'components/Modal/Earning/EarningPoolDetailModal';

interface GlobalInstructionModalContextProviderProps {
  children?: React.ReactElement;
}

export type GlobalInstructionModalInfo = {
  visible?: boolean;
  title?: string;
  media?: string;
  data?: BoxProps[];
  instruction?: AppContentButtonInstruction;
  onPressCancelBtn?: () => void;
  onPressConfirmBtn?: () => void;
};

export interface GlobalModalType {
  setGlobalModal: React.Dispatch<React.SetStateAction<GlobalInstructionModalInfo>>;
  hideGlobalModal: () => void;
}

export const GlobalInstructionModalContext = React.createContext({} as GlobalModalType);

export const GlobalInstructionModalContextProvider = ({ children }: GlobalInstructionModalContextProviderProps) => {
  const [globalModal, setGlobalModal] = useState<GlobalInstructionModalInfo>({});

  const hideGlobalModal = useCallback(() => {
    setGlobalModal(prevState => ({ ...prevState, visible: false }));
    setTimeout(
      () =>
        setGlobalModal(prevState => ({
          ...prevState,
          title: '',
          media: undefined,
          instruction: undefined,
          data: undefined,
          visible: false,
          onPressConfirmBtn: undefined,
          onPressCancelBtn: undefined,
        })),
      300,
    );
  }, []);

  return (
    <GlobalInstructionModalContext.Provider value={{ setGlobalModal, hideGlobalModal }}>
      {children}
      {globalModal.instruction && globalModal.data && globalModal.onPressConfirmBtn && globalModal.onPressCancelBtn && (
        <GlobalInstructionModal
          visible={!!globalModal.visible}
          title={globalModal.title || ''}
          instruction={globalModal.instruction}
          data={globalModal.data}
          onPressConfirmBtn={globalModal.onPressConfirmBtn}
          onPressCancelBtn={globalModal.onPressCancelBtn}
          media={globalModal.media}
        />
      )}
    </GlobalInstructionModalContext.Provider>
  );
};
