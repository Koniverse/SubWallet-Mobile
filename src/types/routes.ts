import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeypairType } from '@polkadot/util-crypto/types';

export type RootStackParamList = {
  LockScreen: undefined;
  FirstScreen: undefined;
  Home: undefined;
  CreateAccount: { keyTypes: KeypairType };
  QrScanner: undefined;
  AccountsScreen: undefined;
  EditAccount: { address: string; name: string };
  RemoveAccount: undefined;
  RestoreJson: undefined;
  ExportPrivateKey: undefined;
  Settings: undefined;
  NetworkSelect: undefined;
  ImportSecretPhrase: { keyTypes: KeypairType };
  ImportPrivateKey: undefined;
  NetworksSetting: undefined;
  SendFund: { selectedAccount: string; selectedNetworkKey: string; selectedToken: string };
  Languages: undefined;
  Security: undefined;
  PinCode: { isEditablePinCode: boolean };
  ExportJson: undefined;
  WebViewDebugger: undefined;
};

type NavigationProps = NativeStackScreenProps<RootStackParamList>;
export type RootNavigationProps = NavigationProps['navigation'];
export type RootRouteProps = NavigationProps['route'];
export type CreateAccountProps = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;
export type ImportSecretPhraseProps = NativeStackScreenProps<RootStackParamList, 'ImportSecretPhrase'>;
