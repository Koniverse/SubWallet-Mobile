import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getNetworkLogo } from 'utils/index';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props extends TouchableOpacityProps {
  itemName: string;
  itemKey: string;
  onSelectNetwork: () => void;
  defaultItemKey?: string;
  showSeparator?: boolean;
  iconSize?: number;
}

export const NetworkItem = ({ itemName, itemKey, onSelectNetwork, defaultItemKey, iconSize = 20 }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  return (
    <TouchableOpacity onPress={onSelectNetwork}>
      <View style={styles.itemArea}>
        <View style={styles.itemBodyArea}>
          <View style={styles.logoWrapperStyle}>{getNetworkLogo(itemKey, iconSize, defaultItemKey)}</View>
          <Typography.Text ellipsis style={styles.itemTextStyle}>
            {itemName}
          </Typography.Text>
        </View>
        <Icon phosphorIcon={CaretRight} size={'xs'} iconColor={theme.colorWhite} />
      </View>
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    itemArea: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 40,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingSM,
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      borderRadius: theme.borderRadiusXL,
    },
    itemBodyArea: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemTextStyle: {
      paddingLeft: 8,
      color: theme.colorTextLight1,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      maxWidth: 120,
      ...FontSemiBold,
    },
    logoWrapperStyle: {
      backgroundColor: 'transparent',
      borderRadius: 20,
    },
  });
}
