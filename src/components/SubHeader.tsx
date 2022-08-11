import React from 'react';
import { GestureResponderEvent, StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { SpaceStyle } from 'styles/space';
import { FontBold, FontSize4, sharedStyles } from 'styles/sharedStyles';
import { ArrowLeft, IconProps } from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { ColorMap } from 'styles/color';

export interface SubHeaderProps {
  showRightBtn?: boolean;
  title: string;
  onPressBack: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  onPressRightIcon?: ((event: GestureResponderEvent) => void) | undefined;
  disableRightButton?: boolean;
  headerContent?: () => JSX.Element;
  backgroundColor?: string;
}

function getSubHeaderWrapperStyle(backgroundColor: string = ColorMap.dark1): StyleProp<any> {
  return {
    backgroundColor: backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: 40,
    zIndex: 10,
  };
}

const headerTitle: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
};

const subHeaderTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSize4,
  ...FontBold,
  color: ColorMap.light,
};

export const SubHeader = ({
  headerContent,
  onPressBack,
  disabled,
  rightIcon,
  onPressRightIcon,
  title,
  backgroundColor,
  disableRightButton,
}: SubHeaderProps) => {
  return (
    <View style={[SpaceStyle.oneContainer, getSubHeaderWrapperStyle(backgroundColor)]}>
      {headerContent ? (
        headerContent()
      ) : (
        <View style={headerTitle}>
          <Text style={subHeaderTitle}>{title}</Text>
        </View>
      )}

      <IconButton
        icon={ArrowLeft}
        color={disabled ? ColorMap.disabled : ColorMap.light}
        disabled={disabled}
        onPress={onPressBack}
        style={{ position: 'absolute', left: 16, top: 0 }}
      />

      {!!rightIcon && (
        <IconButton
          icon={rightIcon}
          onPress={onPressRightIcon}
          style={{ position: 'absolute', right: 16, top: 0 }}
          disabled={disableRightButton}
          color={disableRightButton ? ColorMap.disabledTextColor : ColorMap.light}
        />
      )}
    </View>
  );
};
