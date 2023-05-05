import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeypairType } from '@polkadot/util-crypto/types';
import { HomeStackParamList } from 'routes/home';
import { ConfirmationsQueue } from '@subwallet/extension-base/background/KoniTypes';
import { NftTransferActionStackParamList } from 'routes/nft/transferAction';
import { SigningActionStackParamList } from 'routes/signing';
import { ClaimStakeActionStackParamList } from 'routes/staking/claimAction';
import { CompoundStakeActionStackParamList } from 'routes/staking/compoundAction';
import { StakeActionStackParamList } from 'routes/staking/stakeAction';
import { UnStakeActionStackParamList } from 'routes/staking/unStakeAction';
import { WithdrawStakeActionStackParamList } from 'routes/staking/withdrawAction';
import {TransactionActionStackParamList} from "routes/transaction/transactionAction";

export type RootStackParamList = {
  LockScreen: undefined;
  LoadingScreen: undefined;
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  CreatePassword: {
    pathName:
      | 'CreateAccount'
      | 'ImportSecretPhrase'
      | 'RestoreJson'
      | 'ImportPrivateKey'
      | 'ImportQrCode'
      | 'MigratePassword'
      | 'ConnectParitySigner'
      | 'ConnectKeystone'
      | 'AttachReadOnly';
    state?: string[];
  };
  ChangePassword: undefined;
  MigratePassword: undefined;
  CreateAccount: { keyTypes?: KeypairType[]; isBack?: boolean };
  QrScanner: undefined;
  AccountsScreen: undefined;
  EditAccount: { address: string; name: string };
  RemoveAccount: { address: string };
  RestoreJson: undefined;
  ExportPrivateKey: { address: string };
  Settings: undefined;
  NetworkSelect: undefined;
  ImportSecretPhrase: undefined;
  ImportPrivateKey: undefined;
  NetworksSetting: undefined;
  NetworkSettingDetail: { chainSlug: string };
  ImportNetwork: undefined;
  SendFund: { slug?: string };
  Languages: undefined;
  Security: undefined;
  PinCode: { screen: 'NewPinCode' | 'ChangePinCode' | 'TurnoffPinCode' };
  AccountExport: { address: string };
  ExportJson: { address: string };
  BrowserSearch: { isOpenNewTab: boolean } | undefined;
  BrowserTabsManager: { url?: string; name?: string; isOpenTabs?: boolean };
  ConfirmationPopup: undefined;
  Confirmations: undefined;
  FavouritesGroupDetail: undefined;
  HistoryGroupDetail: undefined;
  DAppAccess: undefined;
  DAppAccessDetail: { origin: string; accountAuthType: string };
  WebViewDebugger: undefined;
  ImportNft: { payload: ConfirmationsQueue['addTokenRequest'][0] } | undefined;
  TransferNft: NavigatorScreenParams<NftTransferActionStackParamList>;
  CustomTokenSetting: undefined;
  ConfigureToken: { tokenDetail: string };
  ImportToken: { payload: ConfirmationsQueue['addTokenRequest'][0] } | undefined;
  TransactionDone: { chainType: string; chain: string; extrinsicHash: string };
  NetworkConfig: undefined;
  NetworkConfigDetail: { key: string };
  SigningAction: NavigatorScreenParams<SigningActionStackParamList>;
  WebViewModal: undefined;
  History: { chain?: string; extrinsicHash?: string };
  Login: undefined;
  AddProvider: { slug: string };
  ConnectParitySigner: undefined;
  ConnectKeystone: undefined;
  AttachReadOnly: undefined;
  ImportQrCode: undefined;
  TransactionAction: NavigatorScreenParams<TransactionActionStackParamList>;
};

export type NavigationProps = NativeStackScreenProps<RootStackParamList>;
export type RootNavigationProps = NavigationProps['navigation'];
export type RootRouteProps = NavigationProps['route'];
export type CreateAccountProps = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;
export type CreatePasswordProps = NativeStackScreenProps<RootStackParamList, 'CreatePassword'>;
export type ImportSecretPhraseProps = NativeStackScreenProps<RootStackParamList, 'ImportSecretPhrase'>;
export type PinCodeProps = NativeStackScreenProps<RootStackParamList, 'PinCode'>;
export type SendFundProps = NativeStackScreenProps<RootStackParamList, 'SendFund'>;
export type EditAccountProps = NativeStackScreenProps<RootStackParamList, 'EditAccount'>;
export type ExportPrivateKeyProps = NativeStackScreenProps<RootStackParamList, 'ExportPrivateKey'>;
export type AccountExportProps = NativeStackScreenProps<RootStackParamList, 'AccountExport'>;
export type ExportJsonProps = NativeStackScreenProps<RootStackParamList, 'ExportJson'>;
export type RemoveAccountProps = NativeStackScreenProps<RootStackParamList, 'RemoveAccount'>;
export type TransferNftProps = NativeStackScreenProps<RootStackParamList, 'TransferNft'>;
export type DAppAccessDetailProps = NativeStackScreenProps<RootStackParamList, 'DAppAccessDetail'>;
export type BrowserTabsManagerProps = NativeStackScreenProps<RootStackParamList, 'BrowserTabsManager'>;
export type BrowserSearchProps = NativeStackScreenProps<RootStackParamList, 'BrowserSearch'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ConfigureTokenProps = NativeStackScreenProps<RootStackParamList, 'ConfigureToken'>;
export type ImportTokenProps = NativeStackScreenProps<RootStackParamList, 'ImportToken'>;
export type ImportNftProps = NativeStackScreenProps<RootStackParamList, 'ImportNft'>;
export type NetworkConfigDetailProps = NativeStackScreenProps<RootStackParamList, 'NetworkConfigDetail'>;
export type NetworkSettingDetailProps = NativeStackScreenProps<RootStackParamList, 'NetworkSettingDetail'>;
export type TransactionDoneProps = NativeStackScreenProps<RootStackParamList, 'TransactionDone'>;
export type AddProviderProps = NativeStackScreenProps<RootStackParamList, 'AddProvider'>;
export type TransactionActionProps = NativeStackScreenProps<RootStackParamList, 'TransactionAction'>;
export type HistoryProps = NativeStackScreenProps<RootStackParamList, 'History'>;
