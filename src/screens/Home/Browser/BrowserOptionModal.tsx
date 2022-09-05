import { SubWalletModal } from 'components/SubWalletModal';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { ArrowsOutSimple, Globe, Star } from 'phosphor-react-native';
import { SelectItem } from 'components/SelectItem';
import { getLeftIcon } from 'utils/index';

interface Props {
  visibleModal: boolean;
  onChangeModalVisible: () => void;
}

interface OptionType {
  key: string;
  icon: JSX.Element;
  label: string;
  onPress: () => void;
}

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  textAlign: 'center',
  paddingBottom: 16,
};

const OPTIONS: OptionType[] = [
  {
    key: 'switchNetwork',
    icon: getLeftIcon(Globe),
    label: 'Switch network',
    onPress: () => {},
  },
  {
    key: 'openInBrowser',
    icon: getLeftIcon(ArrowsOutSimple),
    label: 'Open in browser',
    onPress: () => {},
  },
  {
    key: 'addToFavourites',
    icon: getLeftIcon(Star),
    label: 'Add to favourites',
    onPress: () => {},
  },
];

export const BrowserOptionModal = ({ visibleModal, onChangeModalVisible }: Props) => {
  return (
    <SubWalletModal
      modalVisible={visibleModal}
      onChangeModalVisible={onChangeModalVisible}
      modalStyle={{ height: 256 }}>
      <View style={{ width: '100%' }}>
        <Text style={titleStyle}>More options</Text>
        {OPTIONS.map(opt => (
          <SelectItem key={opt.key} isSelected={false} label={opt.label} leftIcon={opt.icon} />
        ))}
      </View>
    </SubWalletModal>
  );
};
