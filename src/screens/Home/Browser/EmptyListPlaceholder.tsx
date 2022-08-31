import React from 'react';
import { Text, View } from 'react-native';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';
import { GlobeSimple } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

export const EmptyListPlaceholder = () => {
  return (
    <View style={centerStyle}>
      <GlobeSimple size={80} color={'rgba(255, 255, 255, 0.3)'} weight={'thin'} />
      <Text style={emptyListTextStyle}>{i18n.common.emptyBrowserMessage}</Text>
    </View>
  );
};
