import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    listStyle: {
      paddingTop: theme.sizeXS,
      paddingHorizontal: theme.padding,
      paddingBottom: theme.padding,
      gap: theme.size,
    },
    sectionHeaderContainer: {
      paddingTop: theme.sizeXS,
      paddingBottom: theme.sizeXS,
      marginBottom: -theme.sizeXS,
      marginTop: -theme.size,
      backgroundColor: theme.colorBgDefault,
    },
    sectionHeaderTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    clearButton: {
      right: 0,
      position: 'absolute',
    },
    listContainer: {
      paddingTop: theme.margin,
    },
    search: {
      marginBottom: theme.margin,
      marginHorizontal: theme.margin,
    },
  });
