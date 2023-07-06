import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    listStyle: {
      paddingTop: 0,
      paddingHorizontal: theme.padding,
      paddingBottom: theme.padding,
      gap: theme.size,
    },
    sectionHeaderContainer: {
      paddingTop: theme.sizeXS,
      paddingBottom: theme.sizeXS,
      marginBottom: -theme.sizeXS,
      marginTop: -theme.sizeXS,
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
      flex: 1,
      paddingTop: theme.margin,
    },
    search: {
      marginBottom: theme.margin,
      marginHorizontal: theme.margin,
    },
  });
