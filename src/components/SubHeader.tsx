import React from 'react';
import { GestureResponderEvent, StyleProp, View } from 'react-native';
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
  paddingHorizontal: 56,
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
        <View style={headerTitle}>
          <Text numberOfLines={1} style={subHeaderTitle}>
            {title}
          </Text>
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
          color={disableRightButton ? ColorMap.disabledTextColor : ColorMap.light}
          title={rightButtonTitle}
        />
      )}
    </View>
  );
};
