import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center' },

    contentWrapper: { flexDirection: 'row', flex: 1, overflow: 'hidden' },

    logoWrapper: { marginRight: 12 },

    logo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },

    squircleStyle: { width: '100%', height: '100%' },

    textContentWrapper: { flex: 1 },

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
