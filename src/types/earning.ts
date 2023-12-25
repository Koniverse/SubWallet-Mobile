import { _ChainAsset } from '@subwallet/chain-list/types';
import { AbstractYieldPositionInfo } from '@subwallet/extension-base/types';
import { BalanceValueInfo } from 'types/balance';

export interface ExtraYieldPositionInfo extends AbstractYieldPositionInfo {
  asset: _ChainAsset;
  price: number;
  exchangeRate: number;
}

export interface YieldGroupInfo {
  maxApy?: number;
  group: string;
  symbol: string;
  token: string;
  balance: BalanceValueInfo;
  isTestnet: boolean;
  name?: string;
}
