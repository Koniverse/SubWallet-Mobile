import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';

export default (theme: ThemeTypes) => {
  return StyleSheet.create({
    title: {
      color: theme.colorTextLight1,
      textAlign: 'center',
      marginBottom: theme.sizeMD,
      marginTop: theme.sizeMD,
    },
    message: {
      color: theme.colorTextLight4,
      textAlign: 'center',
      paddingHorizontal: theme.sizeLG,
    },
    connectAccountMessage: {
      marginTop: theme.size,
      marginBottom: theme.size,
      color: theme.colorTextLight2,
    },
    accountsContainer: {
      gap: theme.sizeXS,
    },
    modalContentContainerStyle: {
      paddingHorizontal: 0,
      paddingBottom: 0,
    },
    footer: {
      flexDirection: 'row',
      paddingTop: theme.padding,
      gap: theme.sizeSM,
    },
    scrollView: {
      height: '60%',
      width: '100%',
    },
  });
};
