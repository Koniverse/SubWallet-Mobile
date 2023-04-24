import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext, useEffect } from 'react';
import StakingBalanceList from 'screens/Home/Staking/Balance/StakingBalanceList';
import StakingDetail from 'screens/Home/Staking/StakingDetail/StakingDetail';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useIsFocused } from '@react-navigation/native';
import { startCronAndSubscriptionServices } from 'messaging/index';
import withPageWrapper from 'components/pageWrapper';
import { Stake } from 'screens/Transaction/Stake';
import { Unbond } from 'screens/Transaction/Unbond';
import ClaimReward from 'screens/Transaction/ClaimReward';
import { Withdraw } from 'screens/Transaction/Withdraw';
import { CancelUnstake } from 'screens/Transaction/CancelUnstake';

const StakingScreen = () => {
  const StakingScreenStack = createNativeStackNavigator();
  const { clearBackgroundServiceTimeout } = useContext(WebRunnerContext);
  const isStakingServiceActive = useSelector((state: RootState) => state.backgroundService.activeState.cron.staking);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && !isStakingServiceActive) {
      clearBackgroundServiceTimeout('staking');
      startCronAndSubscriptionServices({
        cronServices: ['staking'],
        subscriptionServices: ['staking'],
      }).catch(e => console.log('Start staking services error:', e));
    }
  }, [clearBackgroundServiceTimeout, isFocused, isStakingServiceActive]);

  return (
    <StakingScreenStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <StakingScreenStack.Screen
        name="StakingBalances"
        component={withPageWrapper(StakingBalanceList, ['staking', 'price'])}
      />
      <StakingScreenStack.Screen name="StakingBalanceDetail" component={StakingDetail} />
      <StakingScreenStack.Screen name="Stake" component={Stake} />
      <StakingScreenStack.Screen name="Unbond" component={Unbond} />
      <StakingScreenStack.Screen name="ClaimReward" component={ClaimReward} />
      <StakingScreenStack.Screen name="CancelUnstake" component={CancelUnstake} />
      <StakingScreenStack.Screen name="Withdraw" component={Withdraw} />
    </StakingScreenStack.Navigator>
  );
};

export default React.memo(StakingScreen);
