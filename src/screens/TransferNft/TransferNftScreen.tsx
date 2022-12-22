import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { NftTransferActionStackParamList } from 'routes/nft/transferAction';
import NftTransferAuth from 'screens/TransferNft/NftTransferAuth';
import NftTransferConfirm from 'screens/TransferNft/NftTransferConfirm';
import NftTransferResult from 'screens/TransferNft/NftTransferResult';

const TransferNftScreen = () => {
  const StakeActionStack = createNativeStackNavigator<NftTransferActionStackParamList>();

  return (
    <StakeActionStack.Navigator screenOptions={{ headerShown: false }}>
      <StakeActionStack.Screen name="NftTransferConfirm" component={NftTransferConfirm} />
      <StakeActionStack.Screen name="NftTransferAuth" component={NftTransferAuth} options={{ gestureEnabled: false }} />
      <StakeActionStack.Screen
        name="NftTransferResult"
        component={NftTransferResult}
        options={{ gestureEnabled: false }}
      />
    </StakeActionStack.Navigator>
  );
};

export default React.memo(TransferNftScreen);
