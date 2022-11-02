import React from 'react';
import { GestureResponderEvent, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import Text from '../components/Text';
import { SpaceStyle } from 'styles/space';
import { FontBold, FontSize4, sharedStyles } from 'styles/sharedStyles';
import { ArrowLeft, IconProps } from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { ColorMap } from 'styles/color';
import { Button } from 'components/Button';

export interface SubHeaderProps {
  showRightBtn?: boolean;
  title?: string;
  onPressBack: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  rightIconColor?: string;
  onPressRightIcon?: ((event: GestureResponderEvent) => void) | undefined;
  disableRightButton?: boolean;
  headerContent?: () => JSX.Element;
  backgroundColor?: string;
  showLeftBtn?: boolean;
  rightButtonTitle?: string;
}

function getSubHeaderWrapperStyle(backgroundColor: string = ColorMap.dark1): StyleProp<any> {
  return {
    backgroundColor: backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 40,
    zIndex: 10,
    width: '100%',
  };
}

const headerTitleContainer: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 56,
};

const headerTitleWrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
};

const subHeaderTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSize4,
  ...FontBold,
  textAlign: 'center',
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
  showLeftBtn = true,
  rightButtonTitle = '',
  rightIconColor,
}: SubHeaderProps) => {
  const hideSubHeader = !headerContent && !title && !showLeftBtn && !rightIcon;

  if (hideSubHeader) {
    return <></>;
  }

  return (
    <View style={[SpaceStyle.oneContainer, getSubHeaderWrapperStyle(backgroundColor)]}>
      {headerContent ? (
        headerContent()
      ) : (
        <View style={headerTitleContainer}>
          <View style={headerTitleWrapperStyle}>
            <Text numberOfLines={1} style={subHeaderTextStyle}>
              {title}
            </Text>
          </View>
        </View>
      )}

      {!!showLeftBtn && (
        <IconButton
          icon={ArrowLeft}
          color={disabled ? ColorMap.disabled : ColorMap.light}
          disabled={disabled}
          onPress={onPressBack}
          style={{ position: 'absolute', left: 16, top: 0 }}
        />
      )}

      {(!!rightIcon || !!rightButtonTitle) && (
        <Button
          icon={rightIcon}
          onPress={onPressRightIcon}
          style={{ position: 'absolute', right: 16, top: 0 }}
          disabled={disableRightButton}
          color={disableRightButton ? ColorMap.disabledTextColor : rightIconColor || ColorMap.light}
          title={rightButtonTitle}
        />
      )}
    </View>
  );
};
