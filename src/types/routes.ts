import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  FirstScreen: undefined;
  Home: undefined;
  CreateAccount: undefined;
  AccountList: undefined;
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
};

export type RootNavigationProps = NativeStackScreenProps<RootStackParamList>['navigation'];
export type RootRouteProps = NativeStackScreenProps<RootStackParamList>['route'];
