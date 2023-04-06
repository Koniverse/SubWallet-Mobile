import { LinkingOptions, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Home } from 'screens/Home';
import { NetworksSetting } from 'screens/NetworksSetting';
import { Settings } from 'screens/Settings';
import { SendFund } from 'screens/Sending';
import TransferNftScreen from 'screens/TransferNft/TransferNftScreen';
import { BrowserSearch } from 'screens/Home/Browser/BrowserSearch';
import { BrowserTabsManager } from 'screens/Home/Browser/BrowserTabsManager';
import { FavouritesDetail } from 'screens/Home/Browser/FavouritesDetail';
import { HistoryDetail } from 'screens/Home/Browser/HistoryDetail';
import { AccountsScreen } from 'screens/AccountsScreen';
import CreateMasterPassword from 'screens/MasterPassword/CreateMasterPassword';
import { CreateAccount } from 'screens/CreateAccount';
import { EditAccount } from 'screens/EditAccount';
import { RestoreJson } from 'screens/RestoreJson';
import { RemoveAccount } from 'screens/RemoveAccount';
import { ImportSecretPhrase } from 'screens/ImportSecretPhrase';
import { ImportPrivateKey } from 'screens/ImportPrivateKey';
import { DAppAccessScreen } from 'screens/Settings/Security/DAppAccess';
import { DAppAccessDetailScreen } from 'screens/Settings/Security/DAppAccess/DAppAccessDetailScreen';
import { Languages } from 'screens/Settings/Languages';
import { Security } from 'screens/Settings/Security';
import { PinCodeScreen } from 'screens/Settings/Security/PinCodeScreen';
import { ExportAccount } from 'screens/ExportAccount';
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
import AttachAccountScreen from 'screens/AttachAccount/AttachAccountScreen';
import SigningScreen from 'screens/Signing/SigningScreen';
import { ColorMap } from 'styles/color';
import { ConfirmationPopup } from 'screens/Home/Browser/ConfirmationPopup';
import { LoadingScreen } from 'screens/LoadingScreen';
import { RootStackParamList } from './routes';
import { THEME_PRESET } from 'styles/themes';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getValidURL } from 'utils/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import MigrateMasterPasswordConfirmModal from 'screens/MasterPassword/MigrateMasterPasswordConfirmModal';
import ApplyMasterPassword from 'screens/MasterPassword/ApplyMasterPassword';
import {NetworkSettingDetail} from "screens/NetworkSettingDetail";

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

const AppNavigator = ({ isAppReady }: Props) => {
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['subwallet://'],
    config,
  };
  const { accounts, hasMasterPassword } = useSelector((state: RootState) => state.accountState);

  return (
    <>
      <NavigationContainer linking={linking} ref={navigationRef} theme={theme}>
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
              </Stack.Group>
              <Stack.Group screenOptions={{ headerShown: false, animation: 'default' }}>
                <Stack.Screen name="CreatePassword" component={CreateMasterPassword} />
                <Stack.Screen name="NetworkSettingDetail" component={NetworkSettingDetail} />
                <Stack.Screen name="CreateAccount" component={CreateAccount} />
                <Stack.Screen name="MigratePassword" component={ApplyMasterPassword} />
                <Stack.Screen name="EditAccount" component={EditAccount} />
                <Stack.Screen name="RestoreJson" component={RestoreJson} />
                <Stack.Screen name="RemoveAccount" component={RemoveAccount} />
                <Stack.Screen name="ImportSecretPhrase" component={ImportSecretPhrase} />
                <Stack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
                <Stack.Screen name="DAppAccess" component={DAppAccessScreen} />
                <Stack.Screen name="DAppAccessDetail" component={DAppAccessDetailScreen} />
                <Stack.Screen name="Languages" component={Languages} />
                <Stack.Screen name="Security" component={Security} />
                <Stack.Screen name="PinCode" component={PinCodeScreen} />
                <Stack.Screen name="ExportAccount" component={ExportAccount} />
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
                <Stack.Screen name="AttachAccount" component={AttachAccountScreen} />
                <Stack.Screen name="SigningAction" component={SigningScreen} options={{ gestureEnabled: false }} />
              </Stack.Group>
              <Stack.Group
                screenOptions={{
                  presentation: 'transparentModal',
                  contentStyle: { backgroundColor: ColorMap.modalBackDropDarkColor },
                  headerShown: false,
                }}>
                <Stack.Screen name="ConfirmationPopup" component={ConfirmationPopup} />
              </Stack.Group>
            </>
          )}
          {!isAppReady && <Stack.Screen name="LoadingScreen" component={LoadingScreen} />}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
