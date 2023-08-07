import { browserHomeItemWidth } from 'constants/itemHeight';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: { width: browserHomeItemWidth },
    absolute: { position: 'absolute' },
    squircleWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    imageWrapper: { alignItems: 'center' },
    image: { width: 44, height: 44 },
    title: { width: 40, color: theme.colorTextLight1, ...FontSemiBold, marginTop: theme.marginXS },
  });
};
