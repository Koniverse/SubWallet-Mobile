import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StakeActionStackParamList } from 'routes/staking/stakeAction';
import StakeAuth from 'screens/Staking/Stake/StakeAuth';
import StakeConfirm from 'screens/Staking/Stake/StakeConfirm';
import StakeResult from 'screens/Staking/Stake/StakeResult';
import StakeValidatorDetail from 'screens/Staking/Stake/StakeValidatorDetail';

const StakeActionScreen = () => {
  const StakeActionStack = createNativeStackNavigator<StakeActionStackParamList>();

  return (
    <StakeActionStack.Navigator screenOptions={{ headerShown: false }}>
      <StakeActionStack.Screen name="StakeConfirm" component={StakeConfirm} />
      <StakeActionStack.Screen name="StakeAuth" component={StakeAuth} />
      <StakeActionStack.Screen name="StakeResult" component={StakeResult} options={{ gestureEnabled: false }} />
      <StakeActionStack.Screen name="StakeValidatorDetail" component={StakeValidatorDetail} />
    </StakeActionStack.Navigator>
  );
};

export default React.memo(StakeActionScreen);
