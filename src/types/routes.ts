export type RootStackParamList = {
  About: undefined;
  AccountDetails: undefined;
  ChangeAccountName: undefined;
  AccountPin: {isNew: boolean} | undefined;
  AccountNew: undefined;
  AccountUnlockAndSign: {next: string};
  AccountUnlock: {
    next: string;
    onDelete?: () => void;
    changeCurrentAccountNetwork?: boolean;
    isDerivation?: boolean;
  };
  IdentityBackup: {isNew: true} | {isNew: false; seedPhrase: string};
  RecoverAccount: {isDerivation: boolean} | undefined;
  MessageDetails: undefined;
  Loading: undefined;
  Main: {isNew: boolean} | undefined;
  Mnemonic:
    | {
        isNew: boolean;
      }
    | undefined;
  AccountList: undefined;
  NetworkList:
    | {changeCurrentAccountNetwork?: boolean; substrateOnly?: boolean}
    | undefined;
  NetworkDetails: {pathId: string};
  NetworkSettings: undefined;
  PathsList: {networkKey: string};
  PinNew: {resolve: (pin: string) => void};
  PrivacyPolicy: undefined;
  QrScanner:
    | undefined
    | {
        isScanningNetworkSpec: true;
      };
  Security: undefined;
  SignedMessage: undefined;
  SignedTx: undefined;
  TermsAndConditions: undefined;
  TxDetails: undefined;
};
