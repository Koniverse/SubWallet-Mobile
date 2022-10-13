import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CompoundStakeActionStackParamList } from 'routes/staking/compoundAction';
import CompoundAuth from 'screens/Staking/Compound/CompoundAuth';
import CompoundConfirm from 'screens/Staking/Compound/CompoundConfirm';
import CancelCompoundAuth from './CancelCompoundAuth';
import CancelCompoundResult from './CancelCompoundResult';
import CompoundResult from './CompoundResult';

const CompoundActionScreen = () => {
  const UnStakeActionStack = createNativeStackNavigator<CompoundStakeActionStackParamList>();

  return (
    <UnStakeActionStack.Navigator screenOptions={{ headerShown: false }}>
      <UnStakeActionStack.Screen name="CompoundConfirm" component={CompoundConfirm} />
      <UnStakeActionStack.Screen name="CompoundAuth" component={CompoundAuth} />
      <UnStakeActionStack.Screen name="CompoundResult" component={CompoundResult} />
      <UnStakeActionStack.Screen name="CancelCompoundAuth" component={CancelCompoundAuth} />
      <UnStakeActionStack.Screen name="CancelCompoundResult" component={CancelCompoundResult} />
    </UnStakeActionStack.Navigator>
  );
};

export default React.memo(CompoundActionScreen);
