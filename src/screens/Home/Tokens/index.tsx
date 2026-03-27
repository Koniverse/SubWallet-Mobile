import { CryptoStackParamList } from 'routes/home.ts';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentType, JSX } from 'react';
import { TokenGroups } from './TokenGroup';
import withPageWrapper from 'components/pageWrapper';
import { TokenGroupsDetail } from 'screens/Home/Tokens/TokenGroupsDetail';

const TokenGroupsScreen = (props: JSX.IntrinsicAttributes) => {
  return withPageWrapper(TokenGroups as ComponentType, ['chainStore', 'swap'])(props);
};

const TokenGroupsDetailScreen = (props: JSX.IntrinsicAttributes) => {
  return withPageWrapper(TokenGroupsDetail as ComponentType, ['chainStore'])(props);
};

export const TokensScreen = () => {
  const Stack = createNativeStackNavigator<CryptoStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="TokenGroups" component={TokenGroupsScreen} />
      <Stack.Screen name="TokenGroupsDetail" component={TokenGroupsDetailScreen} />
    </Stack.Navigator>
  );
}