// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import {
  AbstractYieldPositionInfo,
  EarningStatus,
  LendingYieldPositionInfo,
  LiquidYieldPositionInfo,
  NativeYieldPositionInfo,
  NominationYieldPositionInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isSameAddress } from 'utils/account/account';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';

const useGroupYieldPosition = (): YieldPositionInfo[] => {
  const poolInfoMap = useSelector((state: RootState) => state.earning.poolInfoMap);
  const yieldPositions = useSelector((state: RootState) => state.earning.yieldPositions);
  const { currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const chainsByAccountType = useGetChainSlugsByAccount();

  return useMemo(() => {
    const raw: Record<string, YieldPositionInfo[]> = {};
    const result: YieldPositionInfo[] = [];

    const checkAddress = (item: YieldPositionInfo) => {
      if (isAllAccount) {
        return true;
      } else {
        return currentAccountProxy?.accounts.some(({ address }) => isSameAddress(address, item.address));
      }
    };

    for (const info of yieldPositions) {
      if (chainsByAccountType.includes(info.chain) && poolInfoMap[info.slug]) {
        const isValid = checkAddress(info);
        const haveStake = new BigN(info.totalStake).gt(0);

        if (isValid && haveStake) {
          if (raw[info.slug]) {
            raw[info.slug].push(info);
          } else {
            raw[info.slug] = [info];
          }
        }
      }
    }

    for (const [slug, infoList] of Object.entries(raw)) {
      const positionInfo = infoList[0];

      if (!positionInfo) {
        continue;
      }

      if (isAllAccount) {
        const base: AbstractYieldPositionInfo = {
          slug: slug,
          chain: positionInfo.chain,
          type: positionInfo.type,
          address: ALL_ACCOUNT_KEY,
          group: positionInfo.group,
          balanceToken: positionInfo.balanceToken,
          totalStake: '0',
          activeStake: '0',
          unstakeBalance: '0',
          nominations: [],
          status: EarningStatus.NOT_STAKING,
          unstakings: [],
          isBondedBefore: false,
        };

        let rs: YieldPositionInfo;

        switch (positionInfo.type) {
          case YieldPoolType.LENDING:
            rs = {
              ...base,
              derivativeToken: positionInfo.derivativeToken,
            } as LendingYieldPositionInfo;
            break;
          case YieldPoolType.LIQUID_STAKING:
            rs = {
              ...base,
              derivativeToken: positionInfo.derivativeToken,
            } as LiquidYieldPositionInfo;
            break;
          case YieldPoolType.NATIVE_STAKING:
            rs = {
              ...base,
            } as NativeYieldPositionInfo;
            break;
          case YieldPoolType.NOMINATION_POOL:
            rs = {
              ...base,
            } as NominationYieldPositionInfo;
            break;
        }

        for (const info of infoList) {
          rs.totalStake = new BigN(rs.totalStake).plus(info.totalStake).toString();
          rs.activeStake = new BigN(rs.activeStake).plus(info.activeStake).toString();
          rs.unstakeBalance = new BigN(rs.unstakeBalance).plus(info.unstakeBalance).toString();
          rs.isBondedBefore = rs.isBondedBefore || info.isBondedBefore;
        }

        result.push(rs);
      } else {
        result.push(positionInfo);
      }
    }

    return result;
  }, [currentAccountProxy?.accounts, isAllAccount, yieldPositions, chainsByAccountType, poolInfoMap]);
};

export default useGroupYieldPosition;
