import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AttachAccountStackParamList } from 'routes/account/attachAccount';
import AttachReadOnlyScreen from 'screens/AttachAccount/AttachReadOnlyScreen';
import AttachQrSignerConfirm from './AttachQrSignerConfirm';
import ImportAccountQrConfirm from './ImportAccountQrConfirm';

const AttachAccountScreen = () => {
  const ImportAccountQrStack = createNativeStackNavigator<AttachAccountStackParamList>();

  return (
    <ImportAccountQrStack.Navigator screenOptions={{ headerShown: false }}>
      <ImportAccountQrStack.Screen name={'AttachQrSignerConfirm'} component={AttachQrSignerConfirm} />
      <ImportAccountQrStack.Screen name={'AttachReadOnly'} component={AttachReadOnlyScreen} />
      <ImportAccountQrStack.Screen name={'ImportAccountQrConfirm'} component={ImportAccountQrConfirm} />
    </ImportAccountQrStack.Navigator>
  );
};

export default React.memo(AttachAccountScreen);
