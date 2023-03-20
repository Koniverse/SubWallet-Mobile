import React from 'react';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { View } from 'react-native';
import { IconProps } from 'phosphor-react-native';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import ToastContainer from 'react-native-toast-notifications';

type ActionItemType = {
  backgroundColor: string;
  icon: React.ElementType<IconProps>;
  label: string;
  onClickBtn: () => void;
};

export interface AccountActionSelectModalProps {
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  items: ActionItemType[];
  toastRef?: React.RefObject<ToastContainer>;
  modalTitle: string;
}

const AccountActionSelectModal = ({
  modalVisible,
  onChangeModalVisible,
  items,
  toastRef,
  modalTitle,
}: AccountActionSelectModalProps) => {
  return (
    <SwModal modalVisible={modalVisible} modalTitle={modalTitle} onChangeModalVisible={onChangeModalVisible}>
      <View style={{ width: '100%' }}>
        {items.map(item => (
          <SelectItem
            key={item.label}
            label={item.label}
            backgroundColor={item.backgroundColor}
            icon={item.icon}
            onPress={item.onClickBtn}
          />
        ))}
      </View>

      <Toast
        duration={TOAST_DURATION}
        normalColor={ColorMap.notification}
        ref={toastRef}
        placement={'bottom'}
        offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
      />
    </SwModal>
  );
};

export default AccountActionSelectModal;
