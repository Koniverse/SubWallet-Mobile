import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export interface ComponentStyle {
  text: TextStyle;
  scroll: ViewStyle;
  contentContainer: ViewStyle;
}

export default (theme: ThemeTypes) => {
  return StyleSheet.create<ComponentStyle>({
    text: {
      ...sharedStyles.mainText,
      ...FontMedium,
      color: ColorMap.disabled,
      width: '100%',
    },
    scroll: {
      maxHeight: 180,
      width: '100%',
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.sizeXS,
    },
  });
};
