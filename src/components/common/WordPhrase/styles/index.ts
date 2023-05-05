import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  contentContainer: ViewStyle;
  wordRow: ViewStyle;
  seedWord: ViewStyle;
  copyWrapper: ViewStyle;
  copyText: TextStyle;
}

const createStyles = (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    wordRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    seedWord: {
      // margin: theme.marginXS,
    },
    copyWrapper: {
      alignItems: 'center',
    },
    copyText: {
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight * theme.fontSize,
      color: theme.colorTextLight4,
      ...FontSemiBold,
      paddingLeft: theme.paddingXS,
    },
  });
};

export default createStyles;
