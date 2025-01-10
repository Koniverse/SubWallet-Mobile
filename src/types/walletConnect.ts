import { AccountChainType } from '@subwallet/extension-base/types';
import { ChainInfo } from 'types/index';

export interface WalletConnectChainInfo {
  chainInfo: ChainInfo | null;
  slug: string;
  supported: boolean;
  accountType?: AccountChainType;
  wcChain: string;
}
