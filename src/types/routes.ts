import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  LockScreen: undefined;
  FirstScreen: undefined;
  Home: undefined;
  CreateAccount: undefined;
  QrScanner: undefined;
  AccountsScreen: undefined;
  EditAccount: { address: string; name: string };
  RemoveAccount: undefined;
  RestoreJson: undefined;
  ExportPrivateKey: undefined;
  Settings: undefined;
  NetworkSelect: undefined;
  ImportSecretPhrase: undefined;
  NetworksSetting: undefined;
  SendFund: undefined;
  Languages: undefined;
  Security: undefined;
  ExportJson: undefined;
};

export type RootNavigationProps = NativeStackScreenProps<RootStackParamList>['navigation'];
export type RootRouteProps = NativeStackScreenProps<RootStackParamList>['route'];
