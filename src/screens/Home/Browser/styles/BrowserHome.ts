import { StyleSheet } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
import { DEVICE } from 'constants/index';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    container: { flex: 1 },
    banner: { height: 120, borderRadius: theme.borderRadiusLG, margin: theme.margin },
    sectionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.padding,
      marginBottom: theme.marginXS,
    },
    sectionTitle: {
      color: theme.colorTextLight1,
    },
    sectionAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
      height: 40,
    },
    sectionActionTitle: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    absolute: { position: 'absolute' },
    squircleWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    imageItem: { width: 55, height: 55 },
    browserItem: {
      width: DEVICE.width * 0.78,
      marginBottom: theme.margin,
    },
    flatListContentContainer: {
      alignItems: 'center',
      paddingHorizontal: theme.padding,
    },
    flatListSeparator: {
      width: theme.sizeSM,
    },
    recommendListContentContainer: {
      paddingHorizontal: theme.padding,
    },
    recommendListSeparator: {
      marginRight: theme.marginSM,
    },
  });
};
