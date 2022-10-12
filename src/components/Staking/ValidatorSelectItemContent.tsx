import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { toShort } from 'utils/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { CircleWavyCheck } from 'phosphor-react-native';
interface Props {
  collator: DelegationItem;
  isSelected: boolean;
}

const itemArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 12,
  alignItems: 'center',
  paddingHorizontal: 16,
};

const itemBodyArea: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const itemSeparator: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 1,
  marginLeft: 64,
  marginRight: 16,
};

const itemTextStyle: StyleProp<any> = {
  paddingLeft: 20,
  color: ColorMap.light,
  ...sharedStyles.mediumText,
  ...FontSemiBold,
};

const logoWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.light,
  borderRadius: 28,
};

const ValidatorSelectItemContent = ({ collator, isSelected }: Props) => {
  const { owner, identity } = collator;
  return (
    <View>
      <View style={itemArea}>
        <View style={itemBodyArea}>
          <SubWalletAvatar address={owner} size={28} style={logoWrapperStyle} />
          <Text style={itemTextStyle}>{identity ? identity : toShort(owner)}</Text>
        </View>

        {isSelected && <CircleWavyCheck color={ColorMap.primary} weight={'bold'} size={20} />}
      </View>

      <View style={itemSeparator} />
    </View>
  );
};

export default React.memo(ValidatorSelectItemContent);
