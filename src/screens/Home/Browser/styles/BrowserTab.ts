import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize0 } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    colorBlack: { backgroundColor: 'black' },
    header: {
      backgroundColor: theme.colorBgDefault,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: theme.padding,
    },
    avatarSelector: {
      paddingLeft: theme.padding,
      paddingRight: theme.paddingSM,
    },
    siteInfoWrapper: {
      position: 'relative',
      flex: 1,
    },
    siteInfoTouchableArea: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colorBgSecondary,
      paddingRight: 40 + theme.paddingXXS,
      borderRadius: 30,
      height: 40,
    },
    siteInfoName: {
      color: theme.colorTextLight2,
      marginHorizontal: 40,
      flex: 1,
    },
    reloadButton: {
      position: 'absolute',
      right: 4,
      top: 0,
    },
    closeButton: {
      marginHorizontal: theme.marginXS,
    },
    webViewWrapper: {
      flex: 1,
      position: 'relative',
      backgroundColor: theme.colorBgDefault,
    },
    footer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingHorizontal: theme.padding,
      backgroundColor: theme.colorBgSecondary,
      alignItems: 'center',
    },
    footerAfter: {
      backgroundColor: theme.colorBgSecondary,
    },
    progressBar: { position: 'absolute', top: 0, right: 0, left: 0, height: 3 },
    buttonTabs: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    }, // todo: will be remove
    buttonTabsIcon: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderRadius: 4,
      borderColor: ColorMap.light,
    }, // todo: will be remove
    buttonTabsText: {
      color: ColorMap.light,
      ...FontSize0,
      ...FontMedium,
      lineHeight: 16,
    }, // todo: will be remove
    phishingBlockerLayer: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: ColorMap.modalBackDropDarkColor,
      position: 'absolute',
    },
  });
