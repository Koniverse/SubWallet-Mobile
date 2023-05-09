import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext, useEffect } from 'react';
import StakingBalanceList from 'screens/Home/Staking/Balance/StakingBalanceList';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useIsFocused } from '@react-navigation/native';
import { startCronAndSubscriptionServices } from 'messaging/index';
import withPageWrapper from 'components/pageWrapper';

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
    </StakingScreenStack.Navigator>
  );
};

export default React.memo(StakingScreen);
