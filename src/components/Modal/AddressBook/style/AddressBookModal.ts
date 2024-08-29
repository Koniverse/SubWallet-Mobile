import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    flatListStyle: {
      // paddingHorizontal: theme.padding,
      paddingBottom: theme.padding,
    },
    sectionHeaderContainer: {
      paddingBottom: theme.sizeXS,
      backgroundColor: 'red',
      paddingHorizontal: theme.padding,
    },
    sectionHeaderTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      textTransform: 'uppercase',
    },
    sectionHeaderCounter: {
      ...FontSemiBold,
      color: theme.colorTextLight4,
    },
  });
