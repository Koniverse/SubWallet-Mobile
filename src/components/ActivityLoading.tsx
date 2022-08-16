import React from 'react';
import { ActivityIndicator } from 'react-native';
import { ColorMap } from 'styles/color';

export const ActivityLoading = () => {
  return <ActivityIndicator size={'small'} color={ColorMap.light} style={{ marginVertical: 20 }} />;
};
