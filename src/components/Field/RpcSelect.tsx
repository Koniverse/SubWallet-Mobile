import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CaretDown, IconProps, ShareNetwork } from 'phosphor-react-native';
import { Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props extends FieldBaseProps {
  disabled?: boolean;
  showRightIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value?: string;
  leftIcon?: (iconProps: IconProps) => JSX.Element;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
}

const getTextStyle = (disabled: boolean): StyleProp<any> => {
  return {
    ...FontSize2,
    ...FontMedium,
    paddingLeft: 8,
    paddingRight: 8,
    color: disabled ? ColorMap.disabled : ColorMap.light,
    maxWidth: 250,
  };
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  // height: 34,
  flexDirection: 'row',
  alignItems: 'center',
  paddingBottom: 12,
  justifyContent: 'space-between',
  paddingHorizontal: 12,
};

export const RpcSelectField = ({
  disabled,
  showRightIcon,
  leftIcon = ShareNetwork,
  rightIcon = CaretDown,
  outerStyle,
  value,
  label,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon phosphorIcon={leftIcon} size={'md'} iconColor={theme.colorTextLight5} />
          <Text numberOfLines={1} style={getTextStyle(!!disabled)}>
            {value}
          </Text>
        </View>

        {!!showRightIcon && (
          <Icon phosphorIcon={rightIcon} size={'sm'} iconColor={theme.colorTextLight4} weight={'bold'} />
        )}
      </View>
    </FieldBase>
  );
};
