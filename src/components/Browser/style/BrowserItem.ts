import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center' },

    contentWrapper: { flexDirection: 'row', flex: 1, overflow: 'hidden' },

    logoWrapper: { marginRight: 12 },

    logo: {
      width: 44,
      height: 44,
      backgroundColor: 'transparent',
    },

    siteContentWrapper: { flex: 1 },

    siteName: {
      fontSize: theme.fontSizeHeading5,
      lineHeight: theme.lineHeightHeading5 * theme.fontSizeHeading5,
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },

    siteHost: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.lineHeightSM * theme.fontSizeSM,
      color: theme.colorTextLight4,
    },
  });
};
