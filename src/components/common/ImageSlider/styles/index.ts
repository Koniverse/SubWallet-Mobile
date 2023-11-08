import { StyleSheet } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export const defaultIndicatorSize = 4;
export const activeIndicatorSize = 10;
const Styles = () => {
  const theme = useSubWalletTheme().swThemes;

  return StyleSheet.create({
    container: { flex: 1 },
    banner: { height: 120, borderRadius: theme.borderRadiusLG, margin: theme.margin, width: '92%' },
    indicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '30%',
      alignSelf: 'flex-end',
      position: 'absolute',
      bottom: 0,
      right: 24,
    },
    justifyCenter: { justifyContent: 'center' },
    defaultIndicator: {
      backgroundColor: 'white',
      borderRadius: defaultIndicatorSize / 2,
      overflow: 'hidden',
    },
    activeIndicator: {
      borderRadius: activeIndicatorSize / 4,
      flex: 1,
    },
  });
};

export default Styles;
