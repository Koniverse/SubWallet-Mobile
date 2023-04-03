import React from 'react';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import { CryptoContext } from 'providers/screen/Home/CryptoContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TokenGroups } from 'screens/Home/Crypto/TokenGroups';
import { TokenGroupsDetail } from 'screens/Home/Crypto/TokenGroupsDetail';
import { CryptoStackParamList } from 'routes/home';
import withPageWrapper from 'components/pageWrapper';

export const CryptoScreen = () => {
  const chainsByAccountType = useGetChainSlugs();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const Stack = createNativeStackNavigator<CryptoStackParamList>();

  return (
    <CryptoContext.Provider value={{ tokenGroupStructure, accountBalance }}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen
          name="TokenGroups"
          component={withPageWrapper(TokenGroups, ['price', 'chainStore', 'assetRegistry', 'balance'])}
        />
        <Stack.Screen name="TokenGroupsDetail" component={TokenGroupsDetail} />
      </Stack.Navigator>
    </CryptoContext.Provider>
  );
};
