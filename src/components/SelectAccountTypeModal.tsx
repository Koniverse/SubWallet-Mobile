import React from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { Image, StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SecretTypeItem } from 'components/SecretTypeItem';
import i18n from 'utils/i18n/i18n';
import { AccountActionType } from 'types/ui-types';
import { ImageLogosMap } from 'assets/logo';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onModalHide?: () => void;
  onSelectSubstrateAccount: () => void;
  onSelectEvmAccount: () => void;
}

const modalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
  textAlign: 'center',
};

export const SelectAccountTypeModal = ({
  modalVisible,
  onChangeModalVisible,
  onModalHide,
  onSelectSubstrateAccount,
  onSelectEvmAccount,
}: Props) => {
  const ACCOUNT_TYPE: AccountActionType[] = [
    {
      icon: () => <Image source={ImageLogosMap.polkadot} style={{ width: 20, height: 20, borderRadius: 10 }} />,
      title: 'Substrate Account',
      onCLickButton: onSelectSubstrateAccount,
    },
    {
      icon: () => <Image source={ImageLogosMap.eth} style={{ width: 20, height: 20, borderRadius: 10 }} />,
      title: 'EVM Account',
      onCLickButton: onSelectEvmAccount,
    },
  ];

  return (
    <SubWalletModal modalVisible={modalVisible} onModalHide={onModalHide} onChangeModalVisible={onChangeModalVisible}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitle}>{i18n.title.selectAccountType}</Text>
        {ACCOUNT_TYPE.map(item => (
          <SecretTypeItem key={item.title} title={item.title} icon={item.icon} onClickButton={item.onCLickButton} />
        ))}
      </View>
    </SubWalletModal>
  );
};
