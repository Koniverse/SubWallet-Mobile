import { NavigationState } from '@react-navigation/routers';
import React, { useCallback, useEffect, useState } from 'react';
import { LinkingOptions, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import AttachReadOnly from 'screens/Account/AttachReadOnly';
import ConnectKeystone from 'screens/Account/ConnectQrSigner/ConnectKeystone';
import ConnectParitySigner from 'screens/Account/ConnectQrSigner/ConnectParitySigner';
import ImportQrCode from 'screens/Account/ImportQrCode';
import { Home } from 'screens/Home';
import Login from 'screens/MasterPassword/Login';
import { NetworksSetting } from 'screens/NetworksSetting';
import { Settings } from 'screens/Settings';
import { SendFund } from 'screens/Transaction/SendFund';
import TransferNftScreen from 'screens/TransferNft/TransferNftScreen';
import { BrowserSearch } from 'screens/Home/Browser/BrowserSearch';
import { BrowserTabsManager } from 'screens/Home/Browser/BrowserTabsManager';
import { FavouritesDetail } from 'screens/Home/Browser/FavouritesDetail';
import { HistoryDetail } from 'screens/Home/Browser/HistoryDetail';
import { AccountsScreen } from 'screens/AccountsScreen';
import CreateMasterPassword from 'screens/MasterPassword/CreateMasterPassword';
import { CreateAccount } from 'screens/CreateAccount';
import { AccountDetail } from 'screens/Account/AccountDetail';
import { RestoreJson } from 'screens/Account/RestoreJson';
import { RemoveAccount } from 'screens/RemoveAccount';
import { ImportSecretPhrase } from 'screens/Account/ImportSecretPhrase';
import { ImportPrivateKey } from 'screens/Account/ImportPrivateKey';
import { DAppAccessScreen } from 'screens/Settings/Security/DAppAccess';
import { DAppAccessDetailScreen } from 'screens/Settings/Security/DAppAccess/DAppAccessDetailScreen';
import { Languages } from 'screens/Settings/Languages';
import { Security } from 'screens/Settings/Security';
import { PinCodeScreen } from 'screens/Settings/Security/PinCodeScreen';
import { AccountExport } from 'screens/Account/AccountExport';
import { CustomTokenSetting } from 'screens/Tokens';
import { NetworkConfig } from 'screens/Settings/NetworkConfig';
import { NetworkConfigDetail } from 'screens/Settings/NetworkConfigDetail';
import { ConfigureToken } from 'screens/Tokens/ConfigureToken';
import { ImportToken } from 'screens/ImportToken/ImportToken';
import StakeActionScreen from 'screens/Staking/Stake/StakeActionScreen';
import ImportNft from 'screens/ImportToken/ImportNft';
import { WebViewDebugger } from 'screens/WebViewDebugger';
import UnStakeActionScreen from 'screens/Staking/UnStake/UnStakeActionScreen';
import ClaimActionScreen from 'screens/Staking/Claim/ClaimActionScreen';
import WithdrawActionScreen from 'screens/Staking/Withdraw/WithdrawActionScreen';
import CompoundActionScreen from 'screens/Staking/Compound/CompoundActionScreen';
import SigningScreen from 'screens/Signing/SigningScreen';
import { LoadingScreen } from 'screens/LoadingScreen';
import { RootRouteProps, RootStackParamList } from './routes';
import { THEME_PRESET } from 'styles/themes';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getValidURL } from 'utils/browser';
import ErrorBoundary from 'react-native-error-boundary';
import ApplyMasterPassword from 'screens/MasterPassword/ApplyMasterPassword';
import { NetworkSettingDetail } from 'screens/NetworkSettingDetail';
import { Confirmations } from 'screens/Confirmations';
import { TransactionDone } from 'screens/Transaction';
import ErrorFallback from 'components/common/ErrorFallbackScreen';
import ChangeMasterPassword from 'screens/MasterPassword/ChangeMasterPassword';
import { ImportNetwork } from 'screens/ImportNetwork';
import History from 'screens/Home/History';
import withPageWrapper from 'components/pageWrapper';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AddProvider } from 'screens/AddProvider';

interface Props {
  isAppReady: boolean;
}

const config: LinkingOptions<RootStackParamList>['config'] = {
  screens: {
    BrowserTabsManager: {
      path: 'browser',
      parse: {
        url: url => {
          try {
            return getValidURL(decodeURIComponent(url));
          } catch (e) {
            console.log('Cannot decode url ' + url);
            return getValidURL(url);
          }
        },
        name: name => name || '',
      },
      stringify: {
        url: url => url,
        name: name => name || '',
      },
    },
  },
};

const HistoryScreen = (props: JSX.IntrinsicAttributes) => {
  return withPageWrapper(History, ['transactionHistory'])(props);
};

const AppNavigator = ({ isAppReady }: Props) => {
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const [currentRoute, setCurrentRoute] = useState<RootRouteProps | undefined>(undefined);

  const { hasConfirmations } = useSelector((state: RootState) => state.requestState);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['subwallet://'],
    config,
  };

  const onError = (error: Error, stackTrace: string) => {
    console.log('error boundary', error, stackTrace);
  };

  const onUpdateRoute = useCallback((state: NavigationState | undefined) => {
    setCurrentRoute(state?.routes[state?.index]);
  }, []);

  useEffect(() => {
    if (hasConfirmations && currentRoute) {
      if (currentRoute.name !== 'Confirmations') {
        if (currentRoute.name !== 'CreateAccount') {
          navigationRef.current?.navigate('Confirmations');
        }
      }
    }
  }, [hasConfirmations, navigationRef, currentRoute]);

  return (
    <NavigationContainer linking={linking} ref={navigationRef} theme={theme} onStateChange={onUpdateRoute}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={onError}>
        <Stack.Navigator
          screenOptions={{
            animation: 'fade',
          }}>
          {isAppReady && (
            <>
              <Stack.Group screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
                <Stack.Screen name="Home" component={Home} options={{ gestureEnabled: false }} />
                <Stack.Screen name="NetworksSetting" component={NetworksSetting} />
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="SendFund" component={SendFund} options={{ gestureEnabled: false }} />
                <Stack.Screen name="TransferNft" component={TransferNftScreen} options={{ gestureEnabled: false }} />
                <Stack.Screen name="BrowserSearch" component={BrowserSearch} />
                <Stack.Screen name="BrowserTabsManager" component={BrowserTabsManager} />
                <Stack.Screen name="FavouritesGroupDetail" component={FavouritesDetail} />
                <Stack.Screen name="HistoryGroupDetail" component={HistoryDetail} />
                <Stack.Screen name="AccountsScreen" component={AccountsScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
              </Stack.Group>
              <Stack.Group screenOptions={{ headerShown: false, animation: 'default' }}>
                <Stack.Screen
                  name="CreatePassword"
                  component={CreateMasterPassword}
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="NetworkSettingDetail" component={NetworkSettingDetail} />
                <Stack.Screen name="ImportNetwork" component={ImportNetwork} />
                <Stack.Screen name="CreateAccount" component={CreateAccount} />
                <Stack.Screen
                  name="MigratePassword"
                  component={ApplyMasterPassword}
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="AddProvider" component={AddProvider} />
                <Stack.Screen name="EditAccount" component={AccountDetail} />
                <Stack.Screen name="RestoreJson" component={RestoreJson} />
                <Stack.Screen name="RemoveAccount" component={RemoveAccount} />
                <Stack.Screen name="ImportSecretPhrase" component={ImportSecretPhrase} />
                <Stack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
                <Stack.Screen name="DAppAccess" component={DAppAccessScreen} />
                <Stack.Screen name="DAppAccessDetail" component={DAppAccessDetailScreen} />
                <Stack.Screen name="Languages" component={Languages} />
                <Stack.Screen name="Security" component={Security} />
                <Stack.Screen name="PinCode" component={PinCodeScreen} />
                <Stack.Screen name="ChangePassword" component={ChangeMasterPassword} />
                <Stack.Screen name="AccountExport" component={AccountExport} />
                <Stack.Screen name="CustomTokenSetting" component={CustomTokenSetting} />
                <Stack.Screen name="NetworkConfig" component={NetworkConfig} />
                <Stack.Screen name="NetworkConfigDetail" component={NetworkConfigDetail} />
                <Stack.Screen name="ConfigureToken" component={ConfigureToken} />
                <Stack.Screen name="ImportToken" component={ImportToken} />
                <Stack.Screen name="StakeAction" component={StakeActionScreen} options={{ gestureEnabled: false }} />
                <Stack.Screen name="ImportNft" component={ImportNft} />
                <Stack.Screen name="WebViewDebugger" component={WebViewDebugger} />
                <Stack.Screen
                  name="UnStakeAction"
                  component={UnStakeActionScreen}
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                  name="ClaimStakeAction"
                  component={ClaimActionScreen}
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                  name="WithdrawStakeAction"
                  component={WithdrawActionScreen}
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen
                  name="CompoundStakeAction"
                  component={CompoundActionScreen}
                  options={{ gestureEnabled: false }}
                />
                <Stack.Screen name="SigningAction" component={SigningScreen} options={{ gestureEnabled: false }} />
                <Stack.Screen name="TransactionDone" component={TransactionDone} />
                <Stack.Screen name="ConnectParitySigner" component={ConnectParitySigner} />
                <Stack.Screen name="ConnectKeystone" component={ConnectKeystone} />
                <Stack.Screen name="AttachReadOnly" component={AttachReadOnly} />
                <Stack.Screen name="ImportQrCode" component={ImportQrCode} />
              </Stack.Group>
              <Stack.Group
                screenOptions={{
                  presentation: 'transparentModal',
                  contentStyle: { backgroundColor: theme.swThemes.colorBgMask },
                  headerShown: false,
                }}>
                <Stack.Screen
                  name="Confirmations"
                  component={Confirmations}
                  options={{ gestureEnabled: false, animationDuration: 100 }}
                />
                <Stack.Screen name="Login" component={Login} />
              </Stack.Group>
            </>
          )}
          {!isAppReady && <Stack.Screen name="LoadingScreen" component={LoadingScreen} />}
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

export default AppNavigator;
