import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React, { useMemo } from 'react';
import { getTokenLogo } from 'utils/index';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { CaretDown } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  logoKey: string;
  subLogoKey?: string;
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<ViewStyle>;
  value?: string;
  subValue?: string;
}

export const SwapTokenSelectField = ({
  logoKey,
  subLogoKey,
  disabled,
  showIcon,
  outerStyle,
  value,
  subValue,
  label,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme, disabled), [disabled, theme]);

  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={styles.blockContent}>
        {!!value && (
          <>
            <View style={styles.logoWrapper}>{getTokenLogo(logoKey, subLogoKey, label ? 28 : 32)}</View>
            <View style={{ paddingRight: 22 }}>
              <Typography.Text ellipsis style={styles.text}>
                {value}
              </Typography.Text>
              {subValue && (
                <Typography.Text ellipsis size={'sm'} style={styles.subtext}>
                  {subValue}
                </Typography.Text>
              )}
            </View>
          </>
        )}

        {!value && (
          <Typography.Text ellipsis style={styles.placeholder}>
            {i18n.placeholder.selectToken}
          </Typography.Text>
        )}

        {!!showIcon && <Icon phosphorIcon={CaretDown} size={'xs'} iconColor={theme['gray-5']} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};

function createStyle(theme: ThemeTypes, disabled?: boolean) {
  return StyleSheet.create({
    text: {
      ...FontMedium,
      color: disabled ? theme.colorTextLight4 : theme.colorWhite,
      flex: 1,
    },
    subtext: {
      ...FontMedium,
      color: theme.colorTextLight4,
      flex: 1,
    },
    blockContent: {
      flexDirection: 'row',
      height: 48,
      alignItems: 'center',
      paddingRight: theme.paddingSM,
      flex: 1,
    },
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
    placeholder: {
      ...FontMedium,
      color: disabled ? theme.colorTextLight4 : theme.colorTextLight2,
      flex: 1,
      paddingHorizontal: theme.paddingSM,
    },
  });
}
