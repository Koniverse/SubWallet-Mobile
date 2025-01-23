import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { TransactionActionStackParamList } from 'routes/transaction/transactionAction';
import EarnTransaction from 'screens/Transaction/Earn';
import { Unbond } from 'screens/Transaction/Unbond';
import ClaimReward from 'screens/Transaction/ClaimReward';
import { CancelUnstake } from 'screens/Transaction/CancelUnstake';
import { Withdraw } from 'screens/Transaction/Withdraw';
import { SendFund } from 'screens/Transaction/SendFund';
import SendNFT from 'screens/Transaction/NFT';
import withPageWrapper from 'components/pageWrapper';
import { Swap } from 'screens/Transaction/Swap';
import { ClaimBridge } from 'screens/Transaction/ClaimBridge';

const TransactionScreen = () => {
  const TransactionActionStack = createNativeStackNavigator<TransactionActionStackParamList>();

  return (
    <TransactionActionStack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: false }}>
      <TransactionActionStack.Screen name="SendNFT" component={SendNFT} />
      <TransactionActionStack.Screen name="SendFund" component={SendFund} />
      <TransactionActionStack.Screen name="Withdraw" component={Withdraw} />
      <TransactionActionStack.Screen name="Unbond" component={Unbond} />
      <TransactionActionStack.Screen name="ClaimReward" component={ClaimReward} />
      <TransactionActionStack.Screen name="CancelUnstake" component={CancelUnstake} />
      <TransactionActionStack.Screen
        name="ClaimBridge"
        component={withPageWrapper(ClaimBridge, ['notification', 'settings'])}
      />
      <TransactionActionStack.Screen
        name="Earning"
        component={withPageWrapper(EarnTransaction, ['price', 'balance', 'earning'])}
      />
      <TransactionActionStack.Screen name="Swap" component={withPageWrapper(Swap, ['price', 'balance', 'swap'])} />
    </TransactionActionStack.Navigator>
  );
};

export default React.memo(TransactionScreen);
