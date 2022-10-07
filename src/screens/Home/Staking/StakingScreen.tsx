import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import StakingBalanceList from 'screens/Home/Staking/Balance/StakingBalanceList';
import StakingNetworkList from 'screens/Home/Staking/Network/StakingNetworkList';
import StakingDetail from 'screens/Home/Staking/StakingDetail/StakingDetail';
import StakingValidatorList from 'screens/Home/Staking/Validator/StakingValidatorList';
import StakingValidatorDetail from 'screens/Home/Staking/ValidatorDetail/StakingValidatorDetail';

const StakingScreen = () => {
  const StakingScreenStack = createNativeStackNavigator();

  return (
    <StakingScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <StakingScreenStack.Screen name="StakingBalances" component={StakingBalanceList} />
      <StakingScreenStack.Screen name="StakingBalanceDetail" component={StakingDetail} />
      <StakingScreenStack.Screen name="StakingNetworks" component={StakingNetworkList} />
      <StakingScreenStack.Screen name="StakingValidators" component={StakingValidatorList} />
      <StakingScreenStack.Screen name="StakingValidatorDetail" component={StakingValidatorDetail} />
    </StakingScreenStack.Navigator>
  );
};

export default React.memo(StakingScreen);
