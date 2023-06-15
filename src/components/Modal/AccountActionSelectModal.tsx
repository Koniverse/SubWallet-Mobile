import React, { ForwardedRef, forwardRef } from 'react';
import { IconProps } from 'phosphor-react-native';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import ToastContainer from 'react-native-toast-notifications';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';

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
}

const _AccountActionSelectModal = (
  { items, toastRef, modalTitle, onSelectItem, children }: AccountActionSelectModalProps,
  ref: ForwardedRef<any>,
) => {
  return (
    <>
      <BasicSelectModal
        ref={ref}
        selectedValueMap={{}}
        items={items}
        title={modalTitle}
        selectModalItemType={'select'}
        selectModalType={'single'}
        isShowInput={false}
        onSelectItem={onSelectItem}>
        <>
          {children}
          <Toast
            duration={TOAST_DURATION}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 120}
          />
        </>
      </BasicSelectModal>
    </>
  );
};

export const AccountActionSelectModal = forwardRef(_AccountActionSelectModal);
