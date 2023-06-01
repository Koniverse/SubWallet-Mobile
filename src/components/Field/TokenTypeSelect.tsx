import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { CaretDown, Coin } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { BackgroundIcon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  disabled?: boolean;
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value?: string;
}

export const TokenTypeSelectField = ({ disabled, showIcon, outerStyle, value, label, ...fieldBase }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme, disabled), [disabled, theme]);

  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={styles.blockContent}>
        {!!value && (
          <>
            <BackgroundIcon
              style={{ marginLeft: 12, marginRight: 8, justifyContent: 'center', alignItems: 'center' }}
              shape={'circle'}
              phosphorIcon={Coin}
              backgroundColor={theme['orange-6']}
              weight={'fill'}
            />
            <Typography.Text ellipsis style={styles.text}>
              {value}
            </Typography.Text>
          </>
        )}

        {!value && (
          <Typography.Text ellipsis style={styles.placeholder}>
            {i18n.placeholder.selectTokenType}
          </Typography.Text>
        )}

        {!!showIcon && (
          <View style={styles.iconWrapper}>
            <CaretDown size={20} color={theme.colorTextLight3} weight={'bold'} />
          </View>
        )}
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
    placeholder: {
      ...FontMedium,
      color: theme.colorTextLight4,
      flex: 1,
      paddingHorizontal: theme.paddingSM,
    },
  });
}
