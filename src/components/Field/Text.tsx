import { IconButton } from 'components/IconButton';
import { IconProps, Info } from 'phosphor-react-native';
import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import Text from '../../components/Text';

interface Props extends FieldBaseProps {
  text: string;
  showRightIcon?: boolean;
  onPressRightIcon?: () => void;
  disabled?: boolean;
  textColor?: string;
  iconColor?: string;
  icon?: (props: IconProps) => JSX.Element;
}

const getTextStyle = (isDisabled: boolean, color?: string): StyleProp<any> => {
  return {
    ...FontSize2,
    ...FontMedium,
    lineHeight: 25,
    paddingHorizontal: 16,
    paddingBottom: 10,
    color: color ? color : isDisabled ? ColorMap.disabled : ColorMap.light,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  height: 34,
};

const infoIconStyle: StyleProp<any> = {
  position: 'absolute',
  right: 6,
  bottom: 3,
};

export const TextField = ({
  text,
  showRightIcon,
  onPressRightIcon,
  icon,
  disabled,
  textColor,
  iconColor,
  ...fieldBase
}: Props) => {
  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <Text style={getTextStyle(!!disabled, textColor)}>{text}</Text>
        {(showRightIcon || icon) && (
          <IconButton
            color={iconColor ? iconColor : ColorMap.disabled}
            style={infoIconStyle}
            icon={icon || Info}
            onPress={onPressRightIcon}
          />
        )}
      </View>
    </FieldBase>
  );
};
