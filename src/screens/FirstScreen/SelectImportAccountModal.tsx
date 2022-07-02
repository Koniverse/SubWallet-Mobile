import React from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { StyleProp, Text, View } from 'react-native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Article, FileArrowUp, LockKey } from 'phosphor-react-native';
import { SecretTypeItem } from 'components/SecretTypeItem';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, RootStackParamList } from 'types/routes';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
}

const modalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
};

const SECRET_TYPE = [
  {
    icon: Article,
    title: i18n.common.secretPhrase,
    navigationName: 'ImportSecretPhrase' as keyof RootStackParamList,
  },
  {
    icon: LockKey,
    title: i18n.common.privateKey,
    navigationName: 'RestoreJson' as keyof RootStackParamList,
  },
  {
    icon: FileArrowUp,
    title: i18n.common.jsonFile,
    navigationName: 'RestoreJson' as keyof RootStackParamList,
  },
];

export const SelectImportAccountModal = ({ modalVisible, onChangeModalVisible }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  return (
    <SubWalletModal
      modalVisible={modalVisible}
      onChangeModalVisible={onChangeModalVisible}
      modalStyle={{ height: 256 }}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitle}>{i18n.common.selectYourSecretFile}</Text>
        {SECRET_TYPE.map(item => (
          <SecretTypeItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            onClickButton={() => {
              onChangeModalVisible();
              navigation.navigate(item.navigationName);
            }}
          />
        ))}
      </View>
    </SubWalletModal>
  );
};
