import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { DotsThree, IconProps } from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { toShort } from 'utils/index';

interface Props extends FieldBaseProps {
  collator: DelegationItem;
  showRightIcon?: boolean;
  onPressRightIcon?: () => void;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
}

const AddressStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
  color: ColorMap.disabled,
};

const BlockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  paddingLeft: 16,
  alignItems: 'center',
  paddingBottom: 10,
};

const InfoIconStyle: StyleProp<any> = {
  position: 'absolute',
  right: 6,
  bottom: 3,
};

const NameContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const AvatarStyle: StyleProp<ViewStyle> = {
  marginRight: 6,
};

// todo: onPress infoIcon
export const CollatorField = ({
  collator,
  onPressRightIcon,
  showRightIcon = true,
  rightIcon: RightIcon,
  ...fieldBase
}: Props) => {
  const { owner, identity } = collator;

  return (
    <FieldBase {...fieldBase}>
      <View style={BlockContentStyle}>
        <View style={NameContainerStyle}>
          <SubWalletAvatar address={owner} size={18} style={AvatarStyle} />
          <Text style={AddressStyle} numberOfLines={1} ellipsizeMode={'middle'}>
            {identity ? identity : toShort(owner)}
          </Text>
        </View>
        {showRightIcon && (
          <IconButton
            color={ColorMap.disabled}
            style={InfoIconStyle}
            icon={RightIcon || DotsThree}
            onPress={onPressRightIcon}
          />
        )}
      </View>
    </FieldBase>
  );
};
