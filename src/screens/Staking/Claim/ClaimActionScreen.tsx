import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ClaimStakeActionStackParamList } from 'routes/staking/claimAction';
import ClaimAuth from 'screens/Staking/Claim/ClaimAuth';
import ClaimResult from 'screens/Staking/Claim/ClaimResult';

const ClaimActionScreen = () => {
  const WithdrawActionStack = createNativeStackNavigator<ClaimStakeActionStackParamList>();

  return (
    <WithdrawActionStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <WithdrawActionStack.Screen name="ClaimAuth" component={ClaimAuth} />
      <WithdrawActionStack.Screen name="ClaimResult" component={ClaimResult} options={{ gestureEnabled: false }} />
    </WithdrawActionStack.Navigator>
  );
};

export default React.memo(ClaimActionScreen);
