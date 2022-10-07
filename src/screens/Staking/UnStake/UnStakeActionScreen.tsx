import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import UnStakeAuth from 'screens/Staking/UnStake/UnStakeAuth';
import UnStakeConfirm from 'screens/Staking/UnStake/UnStakeConfirm';
import UnStakeResult from 'screens/Staking/UnStake/UnStakeResult';
import { UnStakeActionStackParamList } from 'routes/staking/unStakeAction';

const UnStakeActionScreen = () => {
  const UnStakeActionStack = createNativeStackNavigator<UnStakeActionStackParamList>();

  return (
    <UnStakeActionStack.Navigator screenOptions={{ headerShown: false }}>
      <UnStakeActionStack.Screen name="UnStakeConfirm" component={UnStakeConfirm} />
      <UnStakeActionStack.Screen name="UnStakeAuth" component={UnStakeAuth} />
      <UnStakeActionStack.Screen name="UnStakeResult" component={UnStakeResult} />
    </UnStakeActionStack.Navigator>
  );
};

export default React.memo(UnStakeActionScreen);
