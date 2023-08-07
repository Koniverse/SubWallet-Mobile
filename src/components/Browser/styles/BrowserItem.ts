import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { browserListItemHeight } from 'constants/itemHeight';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', height: browserListItemHeight },

    contentWrapper: { flexDirection: 'row', flex: 1, overflow: 'hidden' },

    logoWrapper: { marginRight: 12, width: 44 },

    logo: {
      width: 44,
      height: 44,
      backgroundColor: 'transparent',
    },

    textContentWrapper: { flex: 1, marginRight: theme.marginXS },

    textContentLine1: {
      flexDirection: 'row',
      gap: theme.sizeXS,
    },

    title: {
      fontSize: theme.fontSizeHeading5,
      lineHeight: theme.lineHeightHeading5 * theme.fontSizeHeading5,
      ...FontSemiBold,
      color: theme.colorTextLight1,
      flexShrink: 1,
    },

    tagContainer: {
      flexDirection: 'row',
      gap: theme.sizeXXS,
    },

    subtitle: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.lineHeightSM * theme.fontSizeSM,
      color: theme.colorTextLight4,
    },
  });
};
