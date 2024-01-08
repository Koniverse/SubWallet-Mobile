import { createNativeStackNavigator } from '@react-navigation/native-stack';
import withPageWrapper from 'components/pageWrapper';
import React from 'react';
import { EarningScreenStackParamList } from 'routes/earning';
import PositionDetail from 'screens/Home/Earning/PositionDetail';
import PoolList from './PoolList';
import { EarningList } from 'screens/Home/Earning/List';

const EarningScreen = () => {
  const StakingScreenStack = createNativeStackNavigator<EarningScreenStackParamList>();

  return (
    <StakingScreenStack.Navigator
      initialRouteName="EarningList"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <StakingScreenStack.Screen
        name="EarningList"
        initialParams={{ step: 1 }}
        component={withPageWrapper(EarningList, ['earning', 'price', 'balance'])}
      />
      <StakingScreenStack.Screen name="EarningPoolList" component={withPageWrapper(PoolList, ['earning', 'price'])} />
      <StakingScreenStack.Screen
        name="EarningPositionDetail"
        component={withPageWrapper(PositionDetail, ['earning', 'price', 'balance'])}
      />
    </StakingScreenStack.Navigator>
  );
};

export default EarningScreen;
