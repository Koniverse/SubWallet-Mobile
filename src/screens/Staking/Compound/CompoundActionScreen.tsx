import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CompoundStakeActionStackParamList } from 'routes/staking/compoundAction';
import CreateCompoundAuth from 'screens/Staking/Compound/CreateCompoundAuth';
import CompoundConfirm from 'screens/Staking/Compound/CompoundConfirm';
import CancelCompoundAuth from 'screens/Staking/Compound/CancelCompoundAuth';
import CancelCompoundResult from 'screens/Staking/Compound/CancelCompoundResult';
import CreateCompoundResult from 'screens/Staking/Compound/CreateCompoundResult';

const CompoundActionScreen = () => {
  const UnStakeActionStack = createNativeStackNavigator<CompoundStakeActionStackParamList>();

  return (
    <UnStakeActionStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <UnStakeActionStack.Screen name="CompoundConfirm" component={CompoundConfirm} />
      <UnStakeActionStack.Screen
        name="CreateCompoundAuth"
        component={CreateCompoundAuth}
        options={{ gestureEnabled: false }}
      />
      <UnStakeActionStack.Screen
        name="CreateCompoundResult"
        component={CreateCompoundResult}
        options={{ gestureEnabled: false }}
      />
      <UnStakeActionStack.Screen
        name="CancelCompoundAuth"
        component={CancelCompoundAuth}
        options={{ gestureEnabled: false }}
      />
      <UnStakeActionStack.Screen
        name="CancelCompoundResult"
        component={CancelCompoundResult}
        options={{ gestureEnabled: false }}
      />
    </UnStakeActionStack.Navigator>
  );
};

export default React.memo(CompoundActionScreen);
