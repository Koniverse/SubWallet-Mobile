import { createNativeStackNavigator } from '@react-navigation/native-stack';
import withPageWrapper from 'components/pageWrapper';
import React from 'react';
import { EarningScreenStackParamList } from 'routes/earning';
import PositionDetail from 'screens/Home/Earning/PositionDetail';
import PoolList from './PoolList';
import { EarningList } from 'screens/Home/Earning/List';

const StakingScreenStack = createNativeStackNavigator<EarningScreenStackParamList>();

const WrappedEarningList = withPageWrapper(
  EarningList,
  ['earning', 'price', 'balance']
);

const WrappedPoolList = withPageWrapper(
  PoolList,
  ['earning', 'price']
);

const WrappedPositionDetail = withPageWrapper(
  PositionDetail,
  ['earning', 'price', 'balance']
);

const EarningScreen = () => {
  return (
    <StakingScreenStack.Navigator
      initialRouteName="EarningList"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <StakingScreenStack.Screen
        name="EarningList"
        component={WrappedEarningList}
        options={{ animation: 'none' }}
      />
      <StakingScreenStack.Screen name="EarningPoolList" component={WrappedPoolList} />
      <StakingScreenStack.Screen
        name="EarningPositionDetail"
        component={WrappedPositionDetail}
      />
    </StakingScreenStack.Navigator>
  );
};

export default EarningScreen;
