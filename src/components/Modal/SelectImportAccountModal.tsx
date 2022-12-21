import React from 'react';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { ListRenderItemInfo, SectionList, SectionListData, StyleProp, View } from 'react-native';
import Text from '../Text';
import { FontBold, FontMedium, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SecretTypeItem } from 'components/SecretTypeItem';
import { AccountActionType } from 'types/ui-types';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';

interface Props {
  modalTitle: string;
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  secretTypeList: { title: string; data: AccountActionType[] }[];
  onModalHide?: () => void;
  toastRef?: React.RefObject<ToastContainer>;
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
  onModalHide,
  modalTitle,
  toastRef,
}: Props) => {
  const renderSectionHeader = (info: {
    section: SectionListData<AccountActionType, { title: string; data: AccountActionType[] }>;
  }) => {
    return (
      <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, marginBottom: 4 }}>
        {info.section.title}
      </Text>
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountActionType>) => {
    return <SecretTypeItem key={item.title} title={item.title} icon={item.icon} onClickButton={item.onCLickButton} />;
  };

  return (
    <SubWalletModal modalVisible={modalVisible} onModalHide={onModalHide} onChangeModalVisible={onChangeModalVisible}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitleStyle}>{modalTitle}</Text>
        <SectionList
          scrollEnabled={false}
          sections={secretTypeList}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />
      </View>

      {
        <Toast
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
        />
      }
    </SubWalletModal>
  );
};
