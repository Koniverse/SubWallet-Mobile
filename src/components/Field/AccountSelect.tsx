import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { toShort } from 'utils/index';
import { StyleProp, StyleSheet, View } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { CaretDown } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { Typography } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FieldHorizontal } from 'components/design-system-ui/field/HorizontalField';
import { TextStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

interface Props extends FieldBaseProps {
  showIcon?: boolean;
  outerStyle?: StyleProp<any>;
  value: string;
  accountName: string;
  horizontal?: boolean;
  labelStyle?: StyleProp<TextStyle>;
}

export const AccountSelectField = ({
  accountName,
  labelStyle,
  showIcon,
  outerStyle,
  value,
  horizontal,
  label,
  ...fieldBase
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme, !!label, !!horizontal);

  if (horizontal) {
    return (
      <FieldHorizontal label={label} {...fieldBase} outerStyle={outerStyle} labelStyle={labelStyle}>
        <View style={styles.blockContentStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {!!value && (
              <Typography.Text ellipsis style={styles.accountNameTextStyle}>
                {accountName}
              </Typography.Text>
            )}
            {!!value && <Typography.Text style={styles.textStyle}>{`(${toShort(value, 4, 4)})`}</Typography.Text>}
            {!value && <Typography.Text style={styles.placeholderStyle}>{i18n.header.selectAccount}</Typography.Text>}
          </View>

          {!!showIcon && <CaretDown size={20} color={theme.colorTextLight2} weight={'bold'} />}
        </View>
      </FieldHorizontal>
    );
  }

  return (
    <FieldBase label={label} {...fieldBase} outerStyle={outerStyle}>
      <View style={styles.blockContentStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <AccountProxyAvatar value={value} size={label ? 20 : 24} />
          {!!value && (
            <Typography.Text ellipsis style={styles.accountNameTextStyle}>
              {accountName}
            </Typography.Text>
          )}
          {!!value && <Typography.Text style={styles.textStyle}>{`(${toShort(value, 4, 4)})`}</Typography.Text>}
          {!value && <Typography.Text style={styles.placeholderStyle}>{i18n.header.selectAccount}</Typography.Text>}
        </View>

        {!!showIcon && <CaretDown size={20} color={theme.colorTextLight2} weight={'bold'} />}
      </View>
    </FieldBase>
  );
};

function createStyle(theme: ThemeTypes, hasLabel: boolean, horizontal: boolean) {
  return StyleSheet.create({
    accountNameTextStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight2,
      ...FontSemiBold,
      paddingBottom: 2,
      paddingLeft: horizontal ? 0 : theme.sizeXS,
      maxWidth: 120,
    },
    textStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontSemiBold,
      paddingLeft: theme.sizeXXS,
      paddingRight: theme.sizeXXS,
      color: theme.colorTextLight4,
      paddingBottom: 2,
    },
    placeholderStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontSemiBold,
      paddingLeft: horizontal ? 0 : theme.sizeXS,
      paddingRight: theme.sizeXXS,
      color: theme.colorTextLight4,
      paddingBottom: 2,
    },
    blockContentStyle: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: horizontal ? (hasLabel ? theme.sizeXXS : theme.sizeSM) : theme.sizeSM,
      paddingRight: theme.paddingSM,
      height: 48,
      flex: 1,
    },
  });
}
