import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from './design-system-ui';
import { Icon } from 'components/design-system-ui';
import { CheckCircleIcon } from 'phosphor-react-native';

interface Props {
  logo: React.ReactNode;
  serviceName: string;
  disabled?: boolean;
  onPressItem: () => void;
  isSelected?: boolean;
}

export const ServiceSelectItem = ({ logo, serviceName, onPressItem, disabled, isSelected }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme, !!disabled);
  return (
    <TouchableOpacity style={styles.container} onPress={onPressItem} disabled={disabled}>
      <View style={styles.contentWrapper}>
        {logo}
        <Typography.Text style={styles.itemTextStyle}>{serviceName}</Typography.Text>
      </View>

      {isSelected && <Icon phosphorIcon={CheckCircleIcon} iconColor={theme.colorSuccess} weight={'fill'} size={'sm'} />}
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes, disabled: boolean) {
  return StyleSheet.create({
    container: {
      opacity: !disabled ? 1 : 0.5,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginBottom: theme.marginXS,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.paddingSM,
    },
    contentWrapper: {
      flexDirection: 'row',
      paddingVertical: theme.paddingSM,
      alignItems: 'center',
    },
    itemTextStyle: {
      paddingLeft: theme.paddingSM,
      color: theme.colorTextLight1,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontSemiBold,
    },
  });
}
