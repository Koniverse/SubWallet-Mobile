import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { DEVICE } from 'constants/index';

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
      padding: theme.padding,
      gap: theme.sizeSM,
    },
    scrollView: {
      maxHeight: (70 * DEVICE.height) / 100,
      paddingHorizontal: theme.padding,
      width: '100%',
    },
  });
};
