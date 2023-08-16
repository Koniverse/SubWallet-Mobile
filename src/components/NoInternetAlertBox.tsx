import React from 'react';
import { View } from 'react-native';
import AlertBox from 'components/design-system-ui/alert-box';

interface Props {
  marginTop?: number;
}

export const NoInternetAlertBox = ({ marginTop = 16 }: Props) => {
  return (
    <View style={{ marginTop: marginTop, width: '100%' }}>
      <AlertBox
        type="warning"
        title={'No internet connection'}
        description={'Please, check your connection or try again later'}
      />
    </View>
  );
};
