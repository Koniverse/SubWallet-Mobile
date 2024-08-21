import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlobalModal from 'components/common/Modal/GlobalModal';
import { AppContentButton } from 'types/staticContent';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Linking, Platform } from 'react-native';
import { AppInstaller } from '../NativeModules';
import { APPSTORE_URL, PLAYSTORE_URL } from 'constants/index';

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
  isChangeLogPopup?: boolean;
};

export interface GlobalModalType {
  setGlobalModal: React.Dispatch<React.SetStateAction<GlobalModalInfo>>;
  hideGlobalModal: () => void;
}

export const GlobalModalContext = React.createContext({} as GlobalModalType);

export const GlobalModalContextProvider = ({ children }: GlobalModalContextProviderProps) => {
  const [globalModal, setGlobalModal] = useState<GlobalModalInfo>({});
  const [installType, setInstallType] = useState<'store' | 'apk' | undefined>(undefined);
  const isDisplayMktCampaign = useSelector((state: RootState) => state.appState.isDisplayMktCampaign);
  const isShowedPopupModalRef = useRef<boolean>(isDisplayMktCampaign);
  useEffect(() => {
    isShowedPopupModalRef.current = isDisplayMktCampaign;
  }, [isDisplayMktCampaign]);

  useEffect(() => {
    if (globalModal.isChangeLogPopup) {
      if (Platform.OS === 'android') {
        AppInstaller.verifyInstallerId((installer: string | null) => {
          if (installer?.includes('packageinstaller')) {
            setInstallType('apk');
          } else {
            setInstallType('store');
          }
        });
      }
    }
  }, [globalModal.isChangeLogPopup]);

  const onPressUpdate = useCallback(
    (url?: string) => {
      if (Platform.OS === 'ios') {
        globalModal.onPressBtn && globalModal.onPressBtn();
        Linking.openURL(APPSTORE_URL);
      } else {
        if (installType === 'apk') {
          globalModal.onPressBtn && globalModal.onPressBtn(url);
        } else if (installType === 'store') {
          globalModal.onPressBtn && globalModal.onPressBtn();
          Linking.openURL(PLAYSTORE_URL);
        }
      }
    },
    [globalModal, installType],
  );

  const hideGlobalModal = useCallback(() => {
    setGlobalModal(prevState => ({ ...prevState, visible: false }));
    isShowedPopupModalRef.current = false;
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
      return isShowedPopupModalRef.current && !!globalModal.visible && !!isDisplayMktCampaign;
    } else {
      return !!globalModal.visible;
    }
  }, [globalModal?.type, globalModal.visible, isDisplayMktCampaign]);

  const onPressButton = useCallback(
    (url?: string) => {
      if (globalModal.isChangeLogPopup && globalModal.onPressBtn && url) {
        onPressUpdate(url);
      } else {
        globalModal.onPressBtn && globalModal.onPressBtn(url);
      }
    },
    [globalModal, onPressUpdate],
  );

  return (
    <GlobalModalContext.Provider value={{ setGlobalModal, hideGlobalModal }}>
      {children}
      <GlobalModal
        visible={modalVisible}
        title={globalModal.title || ''}
        message={globalModal.message || ''}
        onCloseModal={hideGlobalModal}
        buttons={globalModal.buttons || []}
        onPressButton={onPressButton}
        externalButtons={globalModal.externalButtons}
      />
    </GlobalModalContext.Provider>
  );
};
