import React from 'react';
import { View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { IconProps } from 'phosphor-react-native';

export type MoreOptionItemType = {
  key: string;
  name: string;
  backgroundColor: string;
  icon: React.ElementType<IconProps>;
  onPress: () => void;
};

interface Props {
  modalVisible: boolean;
  moreOptionList: MoreOptionItemType[];
  onChangeModalVisible: () => void;
}

export const MoreOptionModal = ({ modalVisible, moreOptionList, onChangeModalVisible }: Props) => {
  return (
    <SwModal
      modalVisible={modalVisible}
      onChangeModalVisible={onChangeModalVisible}
      modalTitle={i18n.header.websiteAccessConfig}>
      <View style={{ width: '100%' }}>
        {moreOptionList.map(item => (
          <SelectItem
            key={item.key}
            label={item.name}
            onPress={item.onPress}
            icon={item.icon}
            backgroundColor={item.backgroundColor}
          />
        ))}
      </View>
    </SwModal>
  );
};
