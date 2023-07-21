import { ChainInfo } from 'types/index';

export interface WalletConnectChainInfo {
  chainInfo: ChainInfo | null;
  slug: string;
  supported: boolean;
}
