import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { deviceWidth } from 'constants/index';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    missionItemWrapper: {
      width: deviceWidth * 0.6,
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
      height: 48,
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
      flex: 1,
      borderRadius: theme.borderRadiusLG,
    },
    missionItemContent: {
      paddingTop: theme.paddingLG + 4,
      paddingHorizontal: theme.paddingSM,
      paddingBottom: theme.padding,
      gap: theme.paddingSM,
    },
    missionItemTopContent: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    missionItemBottomContent: { gap: theme.paddingXS },
    missionItemBottomText: { color: theme.colorWhite, ...FontSemiBold },
    missionItemReward: { flexDirection: 'row', alignItems: 'center', gap: theme.paddingXXS },
  });
