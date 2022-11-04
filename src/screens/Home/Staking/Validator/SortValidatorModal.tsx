import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { CircleWavyCheck, IconProps } from 'phosphor-react-native';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
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
  sortBy: ValidatorSortBy;
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
  justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const LeftPartStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  flex: 1,
};

const LabelTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginLeft: 16,
};

const RightPart: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
};

const SortValidatorModal = ({ closeModal, visible, onPress, sortBy }: Props) => {
  return (
    <SubWalletModal modalVisible={visible} onChangeModalVisible={closeModal}>
      <Text style={TitleTextStyle}>{i18n.common.sortBy}</Text>
      {items.map(({ value, label, key, icon: Icon }) => {
        const selected = value === sortBy;
        return (
          <TouchableOpacity style={ItemContainerStyle} key={key} activeOpacity={0.5} onPress={onPress(value)}>
            <View style={LeftPartStyle}>
              <Icon size={20} color={ColorMap.disabled} />
              <Text style={LabelTextStyle}>{label}</Text>
            </View>
            <View style={RightPart}>
              {selected && <CircleWavyCheck color={ColorMap.primary} weight={'bold'} size={20} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </SubWalletModal>
  );
};

export default React.memo(SortValidatorModal);
