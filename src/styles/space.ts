import { StyleSheet } from 'react-native';

const grid = 16;

export const SpaceStyle = StyleSheet.create({
  container: {
    paddingLeft: grid / 2,
    paddingRight: grid / 2,
  },

  oneContainer: {
    paddingLeft: grid,
    paddingRight: grid,
  },
});
