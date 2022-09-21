import { IconButton } from 'components/IconButton';
import { Info } from 'phosphor-react-native';
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
}

const textStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
  paddingHorizontal: 16,
  paddingBottom: 10,
  color: ColorMap.light,
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
};

const infoIconStyle: StyleProp<any> = {
  position: 'absolute',
  right: 6,
  bottom: 3,
};

export const TextField = ({ text, showRightIcon, onPressRightIcon, ...fieldBase }: Props) => {
  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <Text style={textStyle}>{text}</Text>
        {showRightIcon && (
          <IconButton color={ColorMap.disabled} style={infoIconStyle} icon={Info} onPress={onPressRightIcon} />
        )}
      </View>
    </FieldBase>
  );
};
