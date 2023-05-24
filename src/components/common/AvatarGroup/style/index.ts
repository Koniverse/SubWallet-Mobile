import { StyleSheet, ViewStyle } from 'react-native';

export interface AvatarGroupStyle {
  container: ViewStyle;
  avatarContent: ViewStyle;
  mlStrong: ViewStyle;
  avatarBlur: ViewStyle;
}

export default () =>
  StyleSheet.create<AvatarGroupStyle>({
    container: {
      flexDirection: 'row',
      position: 'relative',
      alignItems: 'center',
    },
    avatarContent: {
      marginLeft: -12,
    },
    mlStrong: {
      marginLeft: -4,
    },
    avatarBlur: {
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowColor: '#000000',
      // opacity: 0.5,
    },
  });
