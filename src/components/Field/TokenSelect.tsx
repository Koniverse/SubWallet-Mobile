import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React, { useMemo } from 'react';
import { getTokenLogo } from 'utils/index';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { CaretDown } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  logoKey: string;
  subLogoKey?: string;
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<ViewStyle>;
  value?: string;
}

export const TokenSelectField = ({
  logoKey,
  subLogoKey,
  disabled,
  showIcon,
  outerStyle,
  value,
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
            <View style={styles.logoWrapper}>{getTokenLogo(logoKey, subLogoKey, label ? 20 : 24)}</View>
            <Typography.Text ellipsis style={styles.text}>
              {value}
            </Typography.Text>
          </>
        )}

        {!value && (
          <Typography.Text ellipsis style={styles.placeholder}>
            {i18n.placeholder.selectToken}
          </Typography.Text>
        )}

        {!!showIcon && <CaretDown size={20} color={theme.colorTextLight3} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};

function createStyle(theme: ThemeTypes, disabled?: boolean) {
  return StyleSheet.create({
    text: {
      ...FontMedium,
      color: disabled ? theme.colorTextLight4 : theme.colorTextLight2,
      flex: 1,
    },
    blockContent: { flexDirection: 'row', height: 48, alignItems: 'center', paddingRight: theme.paddingSM },
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
