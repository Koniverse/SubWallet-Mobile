import { StyleSheet } from 'react-native';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { browserHomeItemSectionWidth } from 'constants/itemHeight';

const Styles = () => {
  const theme = useSubWalletTheme().swThemes;

  return StyleSheet.create({
    container: { flex: 1 },
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
      width: browserHomeItemSectionWidth,
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
    missionPoolListContentContainer: {
      paddingHorizontal: theme.padding,
      gap: theme.paddingSM,
    },
    recommendListSeparator: {
      marginRight: theme.marginSM,
    },
  });
};

export default Styles;
