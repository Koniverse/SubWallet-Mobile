import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    missionItemWrapper: {
      position: 'relative',
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      overflow: 'hidden',
    },
    backdropImgStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      height: 70,
      borderRadius: theme.borderRadiusLG,
    },
    linerGradientStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      borderRadius: theme.borderRadiusLG,
    },
    backdropImgBlurView: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      borderRadius: theme.borderRadiusLG,
    },
    missionItemContent: {
      paddingTop: theme.paddingXXL - 8,
      paddingHorizontal: theme.paddingSM,
      paddingBottom: theme.paddingXL,
      alignItems: 'center',
      borderRadius: theme.borderRadiusLG,
    },
    missionItemTopContent: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    missionItemBottomContent: { gap: theme.paddingXS },
    missionItemName: {
      color: theme.colorWhite,
      paddingTop: theme.padding,
      paddingBottom: theme.paddingXXS,
      ...FontSemiBold,
    },
    missionItemBottomText: { color: theme.colorWhite, ...FontSemiBold },
    missionItemDescription: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      paddingTop: theme.paddingXS,
      paddingBottom: theme.padding,
    },
    missionItemTimeline: { color: theme.colorSuccess, textAlign: 'center', ...FontSemiBold },
    missionItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.paddingXXS,
    },
  });
