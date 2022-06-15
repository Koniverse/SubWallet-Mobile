import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  CreateAccount: undefined;
  AccountList: undefined;
  QrScanner: undefined;
  AccountsScreen: undefined;
  EditAccount: undefined;
  RemoveAccount: undefined;
  RestoreJson: undefined;
  ExportPrivateKey: undefined;
};

export type RootNavigationProps = NativeStackScreenProps<RootStackParamList>['navigation'];
export type RootRouteProps = NativeStackScreenProps<RootStackParamList>['route'];
