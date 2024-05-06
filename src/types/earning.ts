import { _ChainAsset } from '@subwallet/chain-list/types';
import { YieldPositionInfo } from '@subwallet/extension-base/types';
import { NominationPoolInfo, ValidatorInfo } from '@subwallet/extension-base/types/yield/info/chain/target';
import { SWIconProps } from 'components/design-system-ui/icon';
import { BalanceValueInfo } from 'types/balance';
import { PhosphorIcon } from 'utils/campaign';
import BigN from 'bignumber.js';
import { CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';

export type ExtraYieldPositionInfo = YieldPositionInfo & {
  asset: _ChainAsset;
  price: number;
  currency?: CurrencyJson;
  // exchangeRate: number;
};

export interface YieldGroupInfo {
  maxApy?: number;
  group: string;
  symbol: string;
  token: string;
  balance: BalanceValueInfo;
  isTestnet: boolean;
  name?: string;
  chain: string;
  poolListLength: number;
  poolSlugs: string[];
  description: string;
  totalValueStaked: BigN;
  minJoin?: string;
  isRelatedToRelayChain: boolean;
}

export interface EarningTagType {
  label: string;
  icon: PhosphorIcon;
  bgColor: string;
  color: string;
  weight: SWIconProps['weight'];
}

export interface NominationPoolDataType extends NominationPoolInfo {
  symbol: string;
  decimals: number;
  idStr: string;
}

export interface ValidatorDataType extends ValidatorInfo {
  symbol: string;
  decimals: number;
}

export type PoolTargetData = NominationPoolDataType | ValidatorDataType;
