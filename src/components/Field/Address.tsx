import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import reformatAddress, { toShort } from 'utils/index';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { IconProps, Info } from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';

interface Props extends FieldBaseProps {
  address: string;
  networkPrefix?: number;
  showRightIcon?: boolean;
  showAvatar?: boolean;
  onPressRightIcon?: () => void;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  placeholder?: string;
  disable?: boolean;
}

const addressStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
  color: ColorMap.disabled,
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  paddingLeft: 16,
  alignItems: 'center',
  paddingBottom: 10,
};

const avatarStyle: StyleProp<any> = {
  border: 0,
  marginRight: 6,
};

const infoIconStyle: StyleProp<any> = {
  position: 'absolute',
  right: 6,
  bottom: 3,
};

// todo: onPress infoIcon
export const AddressField = ({
  address,
  networkPrefix,
  onPressRightIcon,
  showRightIcon = true,
  showAvatar = true,
  disable = false,
  rightIcon: RightIcon,
  placeholder,
  ...fieldBase
}: Props) => {
  const formattedAddress = networkPrefix ? reformatAddress(address, networkPrefix || -1) : address;

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        {!!showAvatar && <SubWalletAvatar address={address} size={18} style={avatarStyle} />}
        {!!placeholder && <Text style={addressStyle}>{placeholder}</Text>}
        {!placeholder && (
          <Text style={[addressStyle, { color: showRightIcon ? ( disable ? ColorMap.disabled : ColorMap.light) : ColorMap.disabled }]}>
            {toShort(formattedAddress, 10, 10)}
          </Text>
        )}
        {showRightIcon && (
          <IconButton
            color={ColorMap.disabled}
            style={infoIconStyle}
            icon={RightIcon || Info}
            onPress={onPressRightIcon}
          />
        )}
      </View>
    </FieldBase>
  );
};
