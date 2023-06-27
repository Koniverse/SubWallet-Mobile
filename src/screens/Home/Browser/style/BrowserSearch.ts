import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    flatListStyle: {
      paddingHorizontal: theme.padding,
      paddingBottom: theme.padding,
      gap: theme.size,
    },
    sectionHeaderContainer: {
      paddingTop: theme.sizeXS,
      paddingBottom: theme.sizeXS,
      marginBottom: -theme.sizeXS,
      backgroundColor: theme.colorBgDefault,
    },
    sectionHeaderTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    sectionHeaderCounter: {
      ...FontSemiBold,
      color: theme.colorTextLight4,
    },
    beforeListBlock: {
      height: theme.size,
      backgroundColor: theme.colorBgDefault,
      left: 0,
      right: 0,
      top: 58,
      position: 'absolute',
      zIndex: 10,
    },
  });
