import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TransactionActionStackParamList } from 'routes/transaction/transactionAction';
import { Stake } from 'screens/Transaction/Stake';
import { Unbond } from 'screens/Transaction/Unbond';
import ClaimReward from 'screens/Transaction/ClaimReward';
import { CancelUnstake } from 'screens/Transaction/CancelUnstake';
import { Withdraw } from 'screens/Transaction/Withdraw';

const TransactionScreen = () => {
  const TransactionActionStack = createNativeStackNavigator<TransactionActionStackParamList>();

  return (
    <TransactionActionStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <TransactionActionStack.Screen name="Stake" component={Stake} options={{ gestureEnabled: false }} />
      <TransactionActionStack.Screen name="Withdraw" component={Withdraw} options={{ gestureEnabled: false }} />
      <TransactionActionStack.Screen name="Unbond" component={Unbond} options={{ gestureEnabled: false }} />
      <TransactionActionStack.Screen name="ClaimReward" component={ClaimReward} options={{ gestureEnabled: false }} />
      <TransactionActionStack.Screen
        name="CancelUnstake"
        component={CancelUnstake}
        options={{ gestureEnabled: false }}
      />
    </TransactionActionStack.Navigator>
  );
};

export default React.memo(TransactionScreen);
