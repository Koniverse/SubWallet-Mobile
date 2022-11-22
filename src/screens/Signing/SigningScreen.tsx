import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SigningActionStackParamList } from 'routes/signing';
import SigningConfirm from 'screens/Signing/SigningConfirm';
import SigningResult from 'screens/Signing/SigningResult';
import SigningScanPayload from 'screens/Signing/SigningScanPayload';

const SigningScreen = () => {
  const SigningActionStack = createNativeStackNavigator<SigningActionStackParamList>();

  return (
    <SigningActionStack.Navigator screenOptions={{ headerShown: false }}>
      <SigningActionStack.Screen name="SigningScanPayload" component={SigningScanPayload} />
      <SigningActionStack.Screen name="SigningConfirm" component={SigningConfirm} options={{ gestureEnabled: false }} />
      <SigningActionStack.Screen name="SigningResult" component={SigningResult} options={{ gestureEnabled: false }} />
    </SigningActionStack.Navigator>
  );
};

export default React.memo(SigningScreen);
