import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

export interface StakingTabStyle {
  container: ViewStyle;
  item: ViewStyle;
  selectedItem: ViewStyle;
  itemText: TextStyle;
}

export default (theme: ThemeTypes) =>
  StyleSheet.create<StakingTabStyle>({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingXXS,
      marginBottom: theme.margin,
    },
    item: { flex: 1, alignItems: 'center', height: 32, justifyContent: 'center', borderRadius: 8 },
    selectedItem: { backgroundColor: '#252525' },
    itemText: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
  });
