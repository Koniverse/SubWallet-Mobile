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
  YieldPoolInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { isAccountAll, isSameAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { useGetChainSlugs } from 'hooks/screen/Home/useGetChainSlugs';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useGroupYieldPosition = (): YieldPositionInfo[] => {
  const { poolInfoMap, yieldPositions } = useSelector((state: RootState) => state.earning);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const chainsByAccountType = useGetChainSlugs();
  const poolInfoMapRef = useRef<Record<string, YieldPoolInfo>>(poolInfoMap);
  const yieldPositionInfoListRef = useRef<YieldPositionInfo[]>(yieldPositions);
  const chainsByAccountTypeRef = useRef<string[]>(chainsByAccountType);

  useEffect(() => {
    poolInfoMapRef.current = poolInfoMap;
    yieldPositionInfoListRef.current = yieldPositions;
  }, [poolInfoMap, yieldPositions]);

  return useMemo(() => {
    const raw: Record<string, YieldPositionInfo[]> = {};
    const result: YieldPositionInfo[] = [];

    const address = currentAccount?.address || '';
    const isAll = isAccountAll(address);

    const checkAddress = (item: YieldPositionInfo) => {
      if (isAll) {
        return true;
      } else {
        return isSameAddress(address, item.address);
      }
    };

    for (const info of yieldPositionInfoListRef.current) {
      if (chainsByAccountTypeRef.current.includes(info.chain) && poolInfoMapRef.current[info.slug]) {
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

      if (isAll) {
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
  }, [currentAccount?.address]);
};

export default useGroupYieldPosition;
