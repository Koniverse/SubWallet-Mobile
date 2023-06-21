import React from 'react';
import { IconProps } from 'phosphor-react-native';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import ToastContainer from 'react-native-toast-notifications';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { ModalRef } from 'types/modalRef';
import { Platform } from 'react-native';

export type ActionItemType = {
  key: string;
  backgroundColor: string;
  icon: React.ElementType<IconProps>;
  label: string;
  disabled?: boolean;
};

export interface AccountActionSelectModalProps {
  items: ActionItemType[];
  toastRef?: React.RefObject<ToastContainer>;
  modalTitle: string;
  onSelectItem: (item: ActionItemType) => void;
  children?: React.ReactNode;
  accActionRef: React.MutableRefObject<ModalRef | undefined>;
}

export const AccountActionSelectModal = ({
  items,
  toastRef,
  modalTitle,
  onSelectItem,
  children,
  accActionRef,
}: AccountActionSelectModalProps) => {
  return (
    <>
      <BasicSelectModal
        ref={accActionRef}
        selectedValueMap={{}}
        items={items}
        title={modalTitle}
        selectModalItemType={'select'}
        selectModalType={'single'}
        isShowInput={false}
        onBackButtonPress={() => accActionRef?.current?.onCloseModal()}
        onSelectItem={onSelectItem}>
        <>
          {children}
          <Toast
            duration={TOAST_DURATION}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - (Platform.OS === 'android' ? 80 : 120)}
          />
        </>
      </BasicSelectModal>
    </>
  );
};
