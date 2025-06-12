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
  SubnetYieldPositionInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';
import { reformatAddress } from '@subwallet/extension-base/utils';

const useGroupYieldPosition = (): YieldPositionInfo[] => {
  const poolInfoMap = useSelector((state: RootState) => state.earning.poolInfoMap);
  const yieldPositions = useSelector((state: RootState) => state.earning.yieldPositions);
  const { currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const chainsByAccountType = useGetChainSlugsByAccount();

  return useMemo(() => {
    const result: YieldPositionInfo[] = [];

    if (!currentAccountProxy) {
      return result;
    }

    if (!isAllAccount) {
      const accountAddresses = new Set(currentAccountProxy.accounts.map(({ address }) => reformatAddress(address, 0)));

      const rs: YieldPositionInfo[] = [];

      for (const info of yieldPositions) {
        const isChainValid = chainsByAccountType.includes(info.chain);

        if (!isChainValid) {
          continue;
        }

        const havePool = !!poolInfoMap[info.slug];

        if (!havePool) {
          continue;
        }

        const haveStake = new BigN(info.totalStake).gt(0);

        if (!haveStake) {
          continue;
        }

        const formatedAddress = reformatAddress(info.address, 0);
        const isSameAddress = accountAddresses.has(formatedAddress);

        if (isSameAddress) {
          rs.push(info);
        }
      }

      return rs;
    }

    const raw: Record<string, YieldPositionInfo[]> = {};

    for (const info of yieldPositions) {
      if (chainsByAccountType.includes(info.chain) && poolInfoMap[info.slug]) {
        const haveStake = new BigN(info.totalStake).gt(0);

        if (haveStake) {
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
        subnetData: positionInfo.subnetData,
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
        case YieldPoolType.SUBNET_STAKING:
          rs = {
            ...base,
          } as SubnetYieldPositionInfo;
          break;
      }

      for (const info of infoList) {
        rs.totalStake = new BigN(rs.totalStake).plus(info.totalStake).toString();
        rs.activeStake = new BigN(rs.activeStake).plus(info.activeStake).toString();
        rs.unstakeBalance = new BigN(rs.unstakeBalance).plus(info.unstakeBalance).toString();
        rs.isBondedBefore = rs.isBondedBefore || info.isBondedBefore;
      }

      result.push(rs);
    }

    return result;
  }, [currentAccountProxy, isAllAccount, yieldPositions, chainsByAccountType, poolInfoMap]);
};

export default useGroupYieldPosition;
