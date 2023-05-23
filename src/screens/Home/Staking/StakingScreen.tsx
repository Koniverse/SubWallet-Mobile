import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import StakingBalanceList from 'screens/Home/Staking/Balance/StakingBalanceList';
import withPageWrapper from 'components/pageWrapper';

const StakingScreen = () => {
  const StakingScreenStack = createNativeStackNavigator();

  return (
    <StakingScreenStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <StakingScreenStack.Screen
        name="StakingBalances"
        component={withPageWrapper(StakingBalanceList, ['staking', 'price'])}
      />
    </StakingScreenStack.Navigator>
  );
};

export default React.memo(StakingScreen);
