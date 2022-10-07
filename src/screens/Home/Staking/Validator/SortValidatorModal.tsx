import { SubWalletModal } from 'components/SubWalletModal';
import { IconProps } from 'phosphor-react-native';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Item } from 'react-native-picker-select';
import { ChartPieSlice, Coins } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ValidatorSortBy } from 'types/staking';
import i18n from 'utils/i18n/i18n';

interface Props {
  visible: boolean;
  closeModal: () => void;
  onPress: (value: ValidatorSortBy) => () => void;
}

interface SortItem extends Item {
  value: ValidatorSortBy;
  icon: (iconProps: IconProps) => JSX.Element;
}

const items: SortItem[] = [
  {
    value: 'Commission',
    label: i18n.stakingScreen.validatorList.lowestCommission,
    key: 'lowestCommission',
    icon: ChartPieSlice,
  },
  {
    value: 'Return',
    label: i18n.stakingScreen.validatorList.highestReturn,
    key: 'highestReturn',
    icon: Coins,
  },
];

const TitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginBottom: 26,
};

const ItemContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  width: '100%',
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const LabelTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginLeft: 16,
};

const SortValidatorModal = ({ closeModal, visible, onPress }: Props) => {
  return (
    <SubWalletModal modalVisible={visible} onChangeModalVisible={closeModal}>
      <Text style={TitleTextStyle}>{i18n.common.sortBy}</Text>
      {items.map(item => {
        return (
          <TouchableOpacity style={ItemContainerStyle} key={item.key} activeOpacity={0.5} onPress={onPress(item.value)}>
            <item.icon size={20} color={ColorMap.disabled} />
            <Text style={LabelTextStyle}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </SubWalletModal>
  );
};

export default React.memo(SortValidatorModal);
