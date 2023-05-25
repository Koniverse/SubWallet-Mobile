import { ColorMap } from 'styles/color';
import { StyleProp } from 'react-native';
import { DEVICE } from 'constants/index';

export const itemWrapperStyle: StyleProp<any> = {
  width: '100%',
  position: 'relative',
  borderRadius: 8,
  marginBottom: 8,
};

export const itemWrapperAppendixStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  position: 'absolute',
  left: 0,
  right: 0,
  height: DEVICE.height,
  top: '100%',
};
