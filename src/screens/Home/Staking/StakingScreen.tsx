import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext, useEffect } from 'react';
import StakingBalanceList from 'screens/Home/Staking/Balance/StakingBalanceList';
import StakingNetworkList from 'screens/Home/Staking/Network/StakingNetworkList';
import StakingDetail from 'screens/Home/Staking/StakingDetail/StakingDetail';
import StakingValidatorList from 'screens/Home/Staking/Validator/StakingValidatorList';
import StakingValidatorDetail from 'screens/Home/Staking/ValidatorDetail/StakingValidatorDetail';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useIsFocused } from '@react-navigation/native';
import { startCronAndSubscriptionServices } from '../../../messaging';
import {View} from "react-native";

const StakingScreen = () => {
  // const StakingScreenStack = createNativeStackNavigator();
  // const { clearBackgroundServiceTimeout } = useContext(WebRunnerContext);
  // const isStakingServiceActive = useSelector((state: RootState) => state.backgroundService.activeState.cron.staking);
  // const isFocused = useIsFocused();

  // useEffect(() => {
  //   if (isFocused && !isStakingServiceActive) {
  //     clearBackgroundServiceTimeout('staking');
  //     startCronAndSubscriptionServices({
  //       cronServices: ['staking'],
  //       subscriptionServices: ['staking'],
  //     }).catch(e => console.log('Start staking services error:', e));
  //   }
  // }, [clearBackgroundServiceTimeout, isFocused, isStakingServiceActive]);

  return (
    // <StakingScreenStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    //   {/*<StakingScreenStack.Screen name="StakingBalances" component={StakingBalanceList} />*/}
    //   {/*<StakingScreenStack.Screen name="StakingBalanceDetail" component={StakingDetail} />*/}
    //   {/*<StakingScreenStack.Screen name="StakingNetworks" component={StakingNetworkList} />*/}
    //   {/*<StakingScreenStack.Screen name="StakingValidators" component={StakingValidatorList} />*/}
    //   {/*<StakingScreenStack.Screen name="StakingValidatorDetail" component={StakingValidatorDetail} />*/}
    // </StakingScreenStack.Navigator>
    <View />
  );
};

export default React.memo(StakingScreen);
