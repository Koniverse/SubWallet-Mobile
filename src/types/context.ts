import { AccountBalanceHookType, TokenGroupHookType } from 'types/hook';

export type CryptoContextType = {
  tokenGroupStructure: TokenGroupHookType;
  accountBalance: AccountBalanceHookType;
};
