import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    flatListStyle: {
      paddingBottom: theme.padding,
      gap: theme.sizeXS,
    },
    sectionHeaderContainer: {
      paddingBottom: theme.sizeXS,
      backgroundColor: theme.colorBgDefault,
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
    itemRightIconWrapper: {
      width: 40,
      alignItems: 'center',
      marginRight: -theme.marginXS,
    },
    itemContainerStyle: { marginBottom: theme.marginXS, marginHorizontal: theme.margin },
    itemAddressTextStyle: { ...FontSemiBold, color: theme.colorTextLight4 },
  });
