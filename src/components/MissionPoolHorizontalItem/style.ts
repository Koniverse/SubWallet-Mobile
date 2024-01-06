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
      width: 32,
      height: 100,
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
      paddingVertical: theme.paddingXS,
      paddingHorizontal: theme.paddingSM,
      flexDirection: 'row',
      borderRadius: theme.borderRadiusLG,
    },
    missionItemTopContent: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    missionItemBottomContent: { gap: theme.paddingXS },
    missionItemName: {
      color: theme.colorWhite,
      ...FontSemiBold,
    },
    missionItemBottomText: { color: theme.colorWhite, ...FontSemiBold },
    missionItemDescription: {
      color: theme.colorTextTertiary,
      textAlign: 'center',
      paddingTop: theme.paddingXS,
      paddingBottom: theme.padding,
    },
    missionItemTimeline: { color: theme.colorTextTertiary, ...FontSemiBold },
    missionItemRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.paddingXXS,
    },
  });
