import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    flatListStyle: {
      paddingHorizontal: theme.padding,
      paddingBottom: theme.padding,
      gap: theme.sizeXS,
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
      textTransform: 'uppercase',
    },
    sectionHeaderCounter: {
      ...FontSemiBold,
      color: theme.colorTextLight4,
    },
    itemRightIconWrapper: {
      width: 40,
      alignItems: 'center',
      marginRight: -theme.marginXS,
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
