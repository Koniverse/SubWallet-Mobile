import React from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { StyleProp, Text, View } from 'react-native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SecretTypeItem } from 'components/SecretTypeItem';
import { AccountActionType } from 'types/ui-types';

interface Props {
  modalTitle: string;
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  secretTypeList: AccountActionType[];
  modalHeight: number;
  onModalHide?: () => void;
}

const modalTitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
  textAlign: 'center',
};

export const SelectImportAccountModal = ({
  secretTypeList,
  modalVisible,
  onChangeModalVisible,
  modalHeight,
  onModalHide,
  modalTitle,
}: Props) => {
  return (
    <SubWalletModal
      modalVisible={modalVisible}
      onModalHide={onModalHide}
      onChangeModalVisible={onChangeModalVisible}
      modalStyle={{ height: modalHeight }}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitleStyle}>{modalTitle}</Text>
        {secretTypeList.map(item => (
          <SecretTypeItem key={item.title} title={item.title} icon={item.icon} onClickButton={item.onCLickButton} />
        ))}
      </View>
    </SubWalletModal>
  );
};
