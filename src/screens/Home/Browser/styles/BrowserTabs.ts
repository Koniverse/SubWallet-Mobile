import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { DEVICE } from 'constants/index';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    tabItemWrapper: {
      position: 'relative',
      flex: 1,
      maxWidth: '50%',
    },
    tabItem: {
      position: 'relative',
      marginHorizontal: theme.marginXS,
    },
    tabItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colorBgSecondary,
      height: 32,
      paddingLeft: theme.paddingXS,
      paddingRight: 40 - theme.paddingXXS,
      borderTopLeftRadius: theme.borderRadiusLG,
      borderTopRightRadius: theme.borderRadiusLG,
    },
    tabItemBody: {
      backgroundColor: theme.colorWhite,
      borderBottomLeftRadius: theme.borderRadiusLG,
      borderBottomRightRadius: theme.borderRadiusLG,
      position: 'relative',
      overflow: 'hidden',
    },
    tabItemBodySpaceHolder: {
      paddingTop: '100%',
    },
    tabItemImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      resizeMode: 'cover',
      paddingTop: DEVICE.height - 530,
    },
    tabItemTouchableLayer: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: 'absolute',
      borderRadius: theme.borderRadiusLG,
    },
    tabItemTouchableLayerActive: {
      borderWidth: 1,
      borderColor: theme.colorPrimary,
    },
    tabItemCloseButton: {
      position: 'absolute',
      right: -theme.sizeXXS,
      top: -theme.sizeXXS,
    },
    header: {
      flexDirection: 'row',
    },
    headerSearchButton: {
      flex: 1,
      marginLeft: theme.margin,
      paddingHorizontal: theme.padding,
      borderRadius: 30,
      height: 40,
      justifyContent: 'center',
      backgroundColor: theme.colorBgSecondary,
    },
    headerSearchButtonText: {
      color: theme.colorTextLight4,
    },
    headerHomeButton: {
      marginHorizontal: theme.marginXS,
    },
    tabListContainer: {
      flex: 1,
      marginTop: theme.margin,
    },
    tabListContentContainer: {
      gap: theme.size,
      paddingHorizontal: theme.paddingXS,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colorBgSecondary,
    },
    footerLeftButton: {
      position: 'absolute',
      left: theme.size,
    },
    footerRightButton: {
      position: 'absolute',
      right: theme.size,
    },
    footerButtonText: {
      color: theme.colorTextLight1,
    },
  });
