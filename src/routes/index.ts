import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeypairType } from '@polkadot/util-crypto/types';
import { ConfirmationsQueue } from '@subwallet/extension-base/background/KoniTypes';
import { NftTransferActionStackParamList } from 'routes/nft/transferAction';
import { SigningActionStackParamList } from 'routes/signing';
import { TransactionActionStackParamList } from 'routes/transaction/transactionAction';
import { WrapperParamList } from 'routes/wrapper';

export type RootStackParamList = {
  LockScreen: undefined;
  LoadingScreen: undefined;
  Home: NavigatorScreenParams<WrapperParamList> | undefined;
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
  UnlockModal: { isUpdateBiometric?: boolean };
  ChangePassword: undefined;
  ConnectList: { isDelete?: boolean };
  ConnectDetail: { topic: string };
  ConnectWalletConnect: undefined;
  MigratePassword: undefined;
  CreateAccount: { keyTypes?: KeypairType[]; isBack?: boolean };
  QrScanner: undefined;
  AccountsScreen: { pathName?: string };
  EditAccount: { address: string; name: string };
  RemoveAccount: { address: string };
  RestoreJson: undefined;
  ExportPrivateKey: { address: string };
  Settings: undefined;
  GeneralSettings: undefined;
  NetworkSelect: undefined;
  ImportSecretPhrase: undefined;
  ImportPrivateKey: undefined;
  NetworksSetting: undefined;
  NetworkSettingDetail: { chainSlug: string };
  ImportNetwork: undefined;
  SendFund: { slug?: string; recipient?: string };
  Drawer: NavigatorScreenParams<WrapperParamList>;
  Languages: undefined;
  Security: undefined;
  AccountExport: { address: string };
  ExportJson: { address: string };
  BrowserHome?: NavigatorScreenParams<undefined> | undefined;
  BrowserSearch: { isOpenNewTab: boolean } | undefined;
  BrowserTabsManager: { url?: string; name?: string; isOpenTabs?: boolean };
  BrowserListByTabview: { type: string };
  MissionPoolsByTabview: { type: string };
  ConfirmationPopup: undefined;
  Confirmations: undefined;
  DAppAccess: undefined;
  DAppAccessDetail: { origin: string; accountAuthType: string };
  WebViewDebugger: undefined;
  ImportNft: { payload: ConfirmationsQueue['addTokenRequest'][0] } | undefined;
  TransferNft: NavigatorScreenParams<NftTransferActionStackParamList>;
  CustomTokenSetting: undefined;
  ConfigureToken: { tokenDetail: string };
  ImportToken: { payload: ConfirmationsQueue['addTokenRequest'][0] } | undefined;
  TransactionDone: { chainType: string; chain: string; id: string; path: string };
  NetworkConfig: undefined;
  SigningAction: NavigatorScreenParams<SigningActionStackParamList>;
  WebViewModal: undefined;
  History: { address?: string; chain?: string; extrinsicHash?: string; transactionId?: string };
  Login: undefined;
  AddProvider: { slug: string };
  ConnectParitySigner: undefined;
  ConnectKeystone: undefined;
  AttachReadOnly: undefined;
  ImportQrCode: undefined;
  TransactionAction: NavigatorScreenParams<TransactionActionStackParamList>;
  SendNFT: {
    chain: string;
    collectionId: string;
    itemId: string;
    owner: string;
  };
  ManageAddressBook: undefined;
};

export type NavigationProps = NativeStackScreenProps<RootStackParamList>;
export type RootNavigationProps = NavigationProps['navigation'];
export type RootRouteProps = NavigationProps['route'];
export type CreateAccountProps = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;
export type CreatePasswordProps = NativeStackScreenProps<RootStackParamList, 'CreatePassword'>;
export type ImportSecretPhraseProps = NativeStackScreenProps<RootStackParamList, 'ImportSecretPhrase'>;
export type AccountsScreenProps = NativeStackScreenProps<RootStackParamList, 'AccountsScreen'>;
export type SendFundProps = NativeStackScreenProps<RootStackParamList, 'SendFund'>;
export type EditAccountProps = NativeStackScreenProps<RootStackParamList, 'EditAccount'>;
export type ExportPrivateKeyProps = NativeStackScreenProps<RootStackParamList, 'ExportPrivateKey'>;
export type AccountExportProps = NativeStackScreenProps<RootStackParamList, 'AccountExport'>;
export type ExportJsonProps = NativeStackScreenProps<RootStackParamList, 'ExportJson'>;
export type RemoveAccountProps = NativeStackScreenProps<RootStackParamList, 'RemoveAccount'>;
export type TransferNftProps = NativeStackScreenProps<RootStackParamList, 'TransferNft'>;
export type DAppAccessDetailProps = NativeStackScreenProps<RootStackParamList, 'DAppAccessDetail'>;
export type BrowserTabsManagerProps = NativeStackScreenProps<RootStackParamList, 'BrowserTabsManager'>;
export type BrowserListByTabviewProps = NativeStackScreenProps<RootStackParamList, 'BrowserListByTabview'>;
export type MissionPoolsByTabviewProps = NativeStackScreenProps<RootStackParamList, 'MissionPoolsByTabview'>;
export type BrowserHomeProps = NativeStackScreenProps<RootStackParamList, 'BrowserHome'>;
export type BrowserSearchProps = NativeStackScreenProps<RootStackParamList, 'BrowserSearch'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ConfigureTokenProps = NativeStackScreenProps<RootStackParamList, 'ConfigureToken'>;
export type ImportTokenProps = NativeStackScreenProps<RootStackParamList, 'ImportToken'>;
export type ImportNftProps = NativeStackScreenProps<RootStackParamList, 'ImportNft'>;
export type UnlockModalProps = NativeStackScreenProps<RootStackParamList, 'UnlockModal'>;
export type ConnectListProps = NativeStackScreenProps<RootStackParamList, 'ConnectList'>;
export type ConnectDetailProps = NativeStackScreenProps<RootStackParamList, 'ConnectDetail'>;
export type NetworkSettingDetailProps = NativeStackScreenProps<RootStackParamList, 'NetworkSettingDetail'>;
export type TransactionDoneProps = NativeStackScreenProps<RootStackParamList, 'TransactionDone'>;
export type AddProviderProps = NativeStackScreenProps<RootStackParamList, 'AddProvider'>;
export type TransactionActionProps = NativeStackScreenProps<RootStackParamList, 'TransactionAction'>;
export type HistoryProps = NativeStackScreenProps<RootStackParamList, 'History'>;
