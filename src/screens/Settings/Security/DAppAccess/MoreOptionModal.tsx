import React from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { SelectItem } from 'components/SelectItem';
import { SafeAreaView, StyleProp, Text, View } from 'react-native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

type MoreOptionItemType = {
  name: string;
  onPress: () => void;
};

interface Props {
  modalVisible: boolean;
  moreOptionList: MoreOptionItemType[];
  onChangeModalVisible: () => void;
}

const modalTitleStyle: StyleProp<any> = {
  textAlign: 'center',
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 26,
};

// todo: i18n More Options
export const MoreOptionModal = ({ modalVisible, moreOptionList, onChangeModalVisible }: Props) => {
  return (
    <SubWalletModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <View style={{ width: '100%' }}>
        <Text style={modalTitleStyle}>More Options</Text>
        {moreOptionList.map(item => (
          <SelectItem key={item.name} isSelected={false} label={item.name} onPress={item.onPress} />
        ))}
        <SafeAreaView />
      </View>
    </SubWalletModal>
  );
};
