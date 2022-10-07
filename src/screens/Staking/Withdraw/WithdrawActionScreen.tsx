import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { WithdrawStakeActionStackParamList } from 'routes/staking/withdrawAction';
import WithdrawAuth from 'screens/Staking/Withdraw/WithdrawAuth';
import WithdrawResult from 'screens/Staking/Withdraw/WithdrawResult';

const WithdrawActionScreen = () => {
  const WithdrawActionStack = createNativeStackNavigator<WithdrawStakeActionStackParamList>();

  return (
    <WithdrawActionStack.Navigator screenOptions={{ headerShown: false }}>
      <WithdrawActionStack.Screen name="WithdrawAuth" component={WithdrawAuth} />
      <WithdrawActionStack.Screen name="WithdrawResult" component={WithdrawResult} />
    </WithdrawActionStack.Navigator>
  );
};

export default React.memo(WithdrawActionScreen);
