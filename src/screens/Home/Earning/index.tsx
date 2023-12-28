import { createNativeStackNavigator } from '@react-navigation/native-stack';
import withPageWrapper from 'components/pageWrapper';
import React from 'react';
import { EarningScreenStackParamList } from 'routes/earning';
import PositionDetail from 'screens/Home/Earning/PositionDetail';
import GroupList from './GroupList';
import PoolList from './PoolList';
import PositionList from './PositionList';

const EarningScreen = () => {
  const StakingScreenStack = createNativeStackNavigator<EarningScreenStackParamList>();

  return (
    <StakingScreenStack.Navigator
      initialRouteName="EarningPositionList"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <StakingScreenStack.Screen
        name="EarningGroupList"
        component={withPageWrapper(GroupList, ['earning', 'price', 'balance'])}
      />
      <StakingScreenStack.Screen name="EarningPoolList" component={withPageWrapper(PoolList, ['earning', 'price'])} />
      <StakingScreenStack.Screen
        name="EarningPositionList"
        component={withPageWrapper(PositionList, ['earning', 'price', 'balance'])}
      />
      <StakingScreenStack.Screen
        name="EarningPositionDetail"
        component={withPageWrapper(PositionDetail, ['earning', 'price', 'balance'])}
      />
    </StakingScreenStack.Navigator>
  );
};

export default EarningScreen;
