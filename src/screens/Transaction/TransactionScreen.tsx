import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TransactionActionStackParamList } from 'routes/transaction/transactionAction';
import { Stake } from 'screens/Transaction/Stake';
import { Unbond } from 'screens/Transaction/Unbond';
import ClaimReward from 'screens/Transaction/ClaimReward';
import { CancelUnstake } from 'screens/Transaction/CancelUnstake';
import { Withdraw } from 'screens/Transaction/Withdraw';
import { SendFund } from 'screens/Transaction/SendFundV2';
import SendNFT from 'screens/Transaction/NFT';

const TransactionScreen = () => {
  const TransactionActionStack = createNativeStackNavigator<TransactionActionStackParamList>();

  return (
    <TransactionActionStack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: false }}>
      <TransactionActionStack.Screen name="SendNFT" component={SendNFT} />
      <TransactionActionStack.Screen name="SendFund" component={SendFund} />
      <TransactionActionStack.Screen name="Stake" component={Stake} />
      <TransactionActionStack.Screen name="Withdraw" component={Withdraw} />
      <TransactionActionStack.Screen name="Unbond" component={Unbond} />
      <TransactionActionStack.Screen name="ClaimReward" component={ClaimReward} />
      <TransactionActionStack.Screen name="CancelUnstake" component={CancelUnstake} />
    </TransactionActionStack.Navigator>
  );
};

export default React.memo(TransactionScreen);
