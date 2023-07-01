import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ImageStyle as FastImageStyle } from 'react-native-fast-image';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';

export interface BrowserStyle {
  imageItem: FastImageStyle;
  squircleWrapper: ViewStyle;
  sectionActionTitle: TextStyle;
  sectionAction: ViewStyle;
  sectionTitle: TextStyle;
  sectionContainer: ViewStyle;
  container: ViewStyle;
  banner: FastImageStyle;
  absolute: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<BrowserStyle>({
    container: { flex: 1 },
    banner: { height: 120, borderRadius: theme.borderRadiusLG, margin: theme.margin },
    sectionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.padding,
      marginBottom: theme.marginXS,
    },
    sectionTitle: {
      color: theme.colorTextLight1,
    },
    sectionAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
      height: 40,
    },
    sectionActionTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    absolute: { position: 'absolute' },
    squircleWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    imageItem: { width: 55, height: 55 },
  });
};
