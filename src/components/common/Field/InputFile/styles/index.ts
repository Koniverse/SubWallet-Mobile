import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface ComponentStyle {
  wrapper: ViewStyle;
  container: ViewStyle;
  border: ViewStyle;
  title: TextStyle;
  description: TextStyle;
}

const createStyles = (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    wrapper: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      position: 'relative',
    },
    container: {
      alignItems: 'center',
      paddingVertical: theme.paddingXL,
      paddingHorizontal: theme.padding,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.sizeXS,
      height: 178,
    },
    border: {
      borderStyle: 'dashed',
      borderRadius: theme.borderRadiusLG,
      borderWidth: theme.lineWidth * 2,
      borderColor: theme.colorBgDivider,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    title: {
      color: theme.colorText,
      textAlign: 'center',
      fontWeight: theme.headingFontWeight,
      width: '100%',
      ...FontSemiBold,
    },
    description: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      fontWeight: theme.bodyFontWeight,
      width: '100%',
      ...FontMedium,
    },
  });
};

export default createStyles;
