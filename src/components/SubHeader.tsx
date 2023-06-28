import React from 'react';
import { GestureResponderEvent, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import Text from '../components/Text';
import { SpaceStyle } from 'styles/space';
import { FontSemiBold } from 'styles/sharedStyles';
import { CaretLeft, IconProps } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { Button, Icon } from 'components/design-system-ui';

export interface SubHeaderProps {
  showRightBtn?: boolean;
  title?: string;
  onPressBack?: (event?: GestureResponderEvent) => void;
  disabled?: boolean;
  rightIcon?: (iconProps: IconProps) => JSX.Element;
  rightIconColor?: string;
  onPressRightIcon?: ((event?: GestureResponderEvent) => void) | undefined;
  disableRightButton?: boolean;
  headerContent?: () => JSX.Element;
  backgroundColor?: string;
  showLeftBtn?: boolean;
  rightButtonTitle?: string;
  icon?: React.ReactNode;
}

function getSubHeaderWrapperStyle(backgroundColor: string = '#0C0C0C'): StyleProp<any> {
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
  fontSize: 20,
  lineHeight: 28,
  ...FontSemiBold,
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
  icon,
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
        <View style={{ position: 'absolute', left: 8 }}>
          <Button
            disabled={disabled}
            onPress={onPressBack}
            size={'xs'}
            type={'ghost'}
            icon={
              icon || (
                <Icon phosphorIcon={CaretLeft} size={'md'} iconColor={disabled ? ColorMap.disabled : ColorMap.light} />
              )
            }
          />
        </View>
      )}

      {(!!rightIcon || !!rightButtonTitle) && (
        <View style={{ position: 'absolute', right: 8 }}>
          <Button
            icon={
              <Icon
                phosphorIcon={rightIcon}
                size={'md'}
                iconColor={disableRightButton ? ColorMap.disabledTextColor : rightIconColor || ColorMap.light}
              />
            }
            size={'xs'}
            type={'ghost'}
            onPress={onPressRightIcon}
            disabled={disableRightButton}>
            {!!rightButtonTitle && rightButtonTitle}
          </Button>
        </View>
      )}
    </View>
  );
};
