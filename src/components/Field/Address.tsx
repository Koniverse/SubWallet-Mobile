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
  name?: string;
  networkPrefix?: number;
  showRightIcon?: boolean;
  onPressRightIcon?: () => void;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  placeholder?: string;
  disabled?: boolean;
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
  rightIcon: RightIcon,
  placeholder,
  name,
  disabled,
  ...fieldBase
}: Props) => {
  const formattedAddress = networkPrefix ? reformatAddress(address, networkPrefix || -1) : address;
  const textLength = name ? 6 : 10;
  const textColor = showRightIcon ? ColorMap.light : ColorMap.disabled;

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <SubWalletAvatar address={address} size={18} style={avatarStyle} />
        {!!placeholder && <Text style={addressStyle}>{placeholder}</Text>}
        {!placeholder && (
          <View style={{ flexDirection: 'row', flex: 1, paddingRight: 16 }}>
            {name && (
              <Text numberOfLines={1} style={[addressStyle, { color: textColor, maxWidth: 100 }]}>
                {name}
              </Text>
            )}
            {name && <Text style={[addressStyle, { color: textColor }]}> (</Text>}
            <Text style={[addressStyle, { color: textColor }]}>
              {toShort(formattedAddress, textLength, textLength)}
            </Text>
            {name && <Text style={[addressStyle, { color: textColor }]}>)</Text>}
          </View>
        )}
        {showRightIcon && (
          <IconButton
            color={ColorMap.disabled}
            style={infoIconStyle}
            icon={RightIcon || Info}
            onPress={onPressRightIcon}
            disabled={disabled}
          />
        )}
      </View>
    </FieldBase>
  );
};
