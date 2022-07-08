import React from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { StyleProp, Text, View } from 'react-native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SecretTypeItem } from 'components/SecretTypeItem';
import i18n from 'utils/i18n/i18n';
import { AccountActionType } from 'types/ui-types';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  secretTypeList: AccountActionType[];
  modalHeight: number;
  onModalHide?: () => void;
}

const modalTitle: StyleProp<any> = {
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
}: Props) => {
  return (
    <SubWalletModal
      modalVisible={modalVisible}
      onModalHide={onModalHide}
      onChangeModalVisible={onChangeModalVisible}
      modalStyle={{ height: modalHeight }}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitle}>{i18n.common.selectYourSecretFile}</Text>
        {secretTypeList.map(item => (
          <SecretTypeItem key={item.title} title={item.title} icon={item.icon} onClickButton={item.onCLickButton} />
        ))}
      </View>
    </SubWalletModal>
  );
};
