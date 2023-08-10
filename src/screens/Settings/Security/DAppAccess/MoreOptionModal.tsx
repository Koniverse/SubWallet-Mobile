import React, { useRef } from 'react';
import { View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { IconProps } from 'phosphor-react-native';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

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
  setModalVisible: (arg: boolean) => void;
}

export const MoreOptionModal = ({ modalVisible, moreOptionList, setModalVisible }: Props) => {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  return (
    <SwModal
      isUseModalV2
      setVisible={setModalVisible}
      modalBaseV2Ref={modalBaseV2Ref}
      modalVisible={modalVisible}
      modalTitle={i18n.header.websiteAccessConfig}>
      <View style={{ width: '100%', gap: 8 }}>
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
