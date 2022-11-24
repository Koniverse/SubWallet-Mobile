import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

const GroupContainerStyle: StyleProp<ViewStyle> = {
  marginBottom: 4,
};

const GroupTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
  marginBottom: 12,
};

const GroupContentStyle: StyleProp<TextStyle> = {
  marginLeft: 16,
};

const ColumnContentContainerStyle: StyleProp<ViewStyle> = {
  flexDirection: 'column',
};

const ColumnContentTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  marginBottom: 2,
};

const ColumnContentValueStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  marginBottom: 12,
};

const RowContentContainerStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
};

const RowContentTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  flex: 9,
};

const RowContentValueStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  flex: 10,
};

export const SigningStyles = StyleSheet.create({
  GroupContainerStyle,
  GroupTitleStyle,
  GroupContentStyle,
  ColumnContentContainerStyle,
  ColumnContentTitleStyle,
  ColumnContentValueStyle,
  RowContentContainerStyle,
  RowContentTitleStyle,
  RowContentValueStyle,
});
