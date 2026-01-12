import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import Text from 'components/Text';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { Divider } from 'components/Divider';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  logo: React.ReactNode;
  serviceName: string;
  disabled?: boolean;
  onPressItem: () => void;
}

export const ServiceSelectItem = ({ logo, serviceName, onPressItem, disabled }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme, !!disabled);
  return (
    <TouchableOpacity style={styles.container} onPress={onPressItem} disabled={disabled}>
      <View style={styles.contentWrapper}>
        {logo}
        <Text style={styles.itemTextStyle}>{serviceName}</Text>
      </View>

      <Divider style={styles.dividerStyle} color={ColorMap.dark2} />
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes, disabled: boolean) {
  return StyleSheet.create({
    container: { opacity: !disabled ? 1 : 0.5 },
    contentWrapper: {
      flexDirection: 'row',
      paddingHorizontal: theme.padding,
      paddingVertical: theme.paddingSM,
      alignItems: 'center',
    },
    dividerStyle: { paddingLeft: 64, paddingRight: theme.padding },
    itemTextStyle: {
      paddingLeft: 20,
      color: ColorMap.light,
      ...sharedStyles.mediumText,
      ...FontSemiBold,
    },
  });
}
