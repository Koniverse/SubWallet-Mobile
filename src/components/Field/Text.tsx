import { IconButton } from 'components/IconButton';
import { IconProps, Info } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium } from 'styles/sharedStyles';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from 'components/design-system-ui';

interface Props extends FieldBaseProps {
  text: string;
  showRightIcon?: boolean;
  onPressRightIcon?: () => void;
  disabled?: boolean;
  textColor?: string;
  iconColor?: string;
  icon?: (props: IconProps) => JSX.Element;
  placeholder?: string;
}

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
  label,
  disabled,
  textColor,
  iconColor,
  placeholder,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(
    () => createStyle(theme, textColor, disabled, !!placeholder),
    [disabled, placeholder, textColor, theme],
  );

  return (
    <FieldBase label={label} {...fieldBase}>
      <View style={styles.blockContent}>
        <Typography.Text ellipsis style={styles.text}>
          {text || placeholder}
        </Typography.Text>
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

function createStyle(theme: ThemeTypes, textColor?: string, disabled?: boolean, placeholder?: boolean) {
  return StyleSheet.create({
    text: {
      ...FontMedium,
      color: placeholder
        ? theme.colorTextLight4
        : textColor
        ? textColor
        : disabled
        ? theme.colorTextLight4
        : theme.colorWhite,
      paddingLeft: theme.paddingSM,
      flex: 1,
    },
    blockContent: { flexDirection: 'row', height: 48, alignItems: 'center' },
    logoWrapper: {
      paddingLeft: theme.sizeSM,
      paddingRight: theme.sizeXS,
    },
    iconWrapper: {
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.sizeXXS,
    },
  });
}
