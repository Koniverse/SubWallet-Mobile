import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ImportAccountQrStackParamList } from 'routes/account/import/importAccountQr';
import ImportAccountQrConfirm from 'screens/ImportQr/ImportAccountQrConfirm';
import ImportAccountQrScan from 'screens/ImportQr/ImportAccountQrScan';

const ImportAccountQrScreen = () => {
  const ImportAccountQrStack = createNativeStackNavigator<ImportAccountQrStackParamList>();

  return (
    <ImportAccountQrStack.Navigator screenOptions={{ headerShown: false }}>
      <ImportAccountQrStack.Screen name={'ImportAccountQrScan'} component={ImportAccountQrScan} />
      <ImportAccountQrStack.Screen name={'ImportAccountQrConfirm'} component={ImportAccountQrConfirm} />
    </ImportAccountQrStack.Navigator>
  );
};

export default React.memo(ImportAccountQrScreen);
