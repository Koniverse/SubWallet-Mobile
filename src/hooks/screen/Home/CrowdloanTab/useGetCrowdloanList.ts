import {
  APIItemState,
  ChainRegistry,
  CrowdloanItem,
  NetWorkGroup,
  NetworkJson,
} from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_ZERO, getBalances } from 'utils/chainBalances';
import { CrowdloanContributeValueType } from 'hooks/types';
import { CrowdloanItemType } from '../../../../types';
import BigN from 'bignumber.js';
import { useMemo } from 'react';

const GroupDisplayNameMap: Record<string, string> = {
  POLKADOT_PARACHAIN: 'Polkadot parachain',
  KUSAMA_PARACHAIN: 'Kusama parachain',
};

function getGroupDisplayName(groups: NetWorkGroup[]): string {
  for (const group of groups) {
    if (GroupDisplayNameMap[group]) {
      return GroupDisplayNameMap[group];
    }
  }

  return '';
}

function getGroupNetworkKey(groups: NetWorkGroup[]): string {
  if (groups.includes('POLKADOT_PARACHAIN')) {
    return 'polkadot';
  }

  if (groups.includes('KUSAMA_PARACHAIN')) {
    return 'kusama';
  }

  return '';
}

function getCrowdloanChainRegistry(
  groups: NetWorkGroup[],
  chainRegistryMap: Record<string, ChainRegistry>,
): ChainRegistry | null {
  if (groups.includes('POLKADOT_PARACHAIN') && chainRegistryMap.polkadot) {
    return chainRegistryMap.polkadot;
  }

  if (groups.includes('KUSAMA_PARACHAIN') && chainRegistryMap.kusama) {
    return chainRegistryMap.kusama;
  }

  return null;
}

function getCrowdloanNetworkMaps(source: Record<string, NetworkJson>): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  result.all = [];
  result.polkadot = [];
  result.kusama = [];

  for (const networkKey in source) {
    if (!source.hasOwnProperty(networkKey)) {
      continue;
    }

    const networkInfo = source[networkKey];

    if (networkInfo.paraId == undefined) {
      continue;
    }

    result.all.push(networkKey);

    if (networkInfo.groups.includes('POLKADOT_PARACHAIN')) {
      result.polkadot.push(networkKey);
    } else if (networkInfo.groups.includes('KUSAMA_PARACHAIN')) {
      result.kusama.push(networkKey);
    }
  }

  return result;
}

function getCrowdloanNetworks(networkMetadata: Record<string, NetworkJson>, currentNetworkKey: string): string[] {
  const crowdloanNetworkMap = getCrowdloanNetworkMaps(networkMetadata);

  if (currentNetworkKey === 'polkadot') {
    return [...crowdloanNetworkMap.polkadot];
  } else if (currentNetworkKey === 'kusama') {
    return [...crowdloanNetworkMap.kusama];
  } else {
    return [...crowdloanNetworkMap.all];
  }
}

function getCrowdloanContributeMap(
  crowdloanNetworks: string[],
  networkMap: Record<string, NetworkJson>,
  chainRegistryMap: Record<string, ChainRegistry>,
  crowdloanMap: Record<string, CrowdloanItem>,
  priceMap: Record<string, number>,
) {
  const crowdloanContributeMap: Record<string, CrowdloanContributeValueType> = {};
  crowdloanNetworks.forEach(networkKey => {
    const networkMetadata = networkMap[networkKey];

    if (
      !networkMetadata ||
      !['POLKADOT_PARACHAIN', 'KUSAMA_PARACHAIN'].some(g => networkMetadata.groups.includes(g as NetWorkGroup))
    ) {
      return;
    }

    const registry = getCrowdloanChainRegistry(networkMetadata.groups, chainRegistryMap);
    const crowdloanItem = crowdloanMap[networkKey];

    if (!registry || !crowdloanItem || crowdloanItem.state.valueOf() !== APIItemState.READY.valueOf()) {
      return;
    }

    const groupNetworkKey = getGroupNetworkKey(networkMetadata.groups);
    const price = groupNetworkKey ? priceMap[groupNetworkKey] : undefined;

    const contributeInfo = getBalances({
      balance: crowdloanItem.contribute,
      decimals: registry.chainDecimals[0],
      symbol: registry.chainTokens[0],
      price,
    });

    crowdloanContributeMap[networkKey] = {
      paraState: crowdloanItem.paraState,
      contribute: contributeInfo,
    };
  });

  return crowdloanContributeMap;
}

function getCrowdloanItem(
  networkKey: string,
  contributeValueInfo: CrowdloanContributeValueType,
  networkMetadata: NetworkJson,
): CrowdloanItemType {
  const groupDisplayName = getGroupDisplayName(networkMetadata.groups);
  const { balanceValue, convertedBalanceValue, symbol } = contributeValueInfo.contribute;

  return {
    contribute: balanceValue,
    contributeToUsd: convertedBalanceValue,
    logo: networkKey,
    networkDisplayName: networkMetadata.chain,
    networkKey,
    symbol,
    groupDisplayName,
    paraState: contributeValueInfo.paraState,
    crowdloanUrl: networkMetadata.crowdloanUrl,
  };
}

function getCrowdloanContributeList(
  networkMap: Record<string, NetworkJson>,
  networkKeys: string[],
  crowdloanContributeMap: Record<string, CrowdloanContributeValueType>,
  includeZeroBalance = false,
): CrowdloanItemType[] {
  const result: CrowdloanItemType[] = [];

  networkKeys.forEach(n => {
    const networkMetadata = networkMap[n];

    if (!networkMetadata) {
      return;
    }

    const contributeValueInfo: CrowdloanContributeValueType = crowdloanContributeMap[n] || {
      contribute: {
        balanceValue: new BigN(0),
        convertedBalanceValue: new BigN(0),
        symbol: 'Unit',
      },
    };
    if (!includeZeroBalance && !BN_ZERO.lt(new BigN(contributeValueInfo.contribute.balanceValue))) {
      return;
    }

    result.push(getCrowdloanItem(n, contributeValueInfo, networkMetadata));
  });

  return result;
}

export default function useGetCrowdloanList() {
  const chainRegistryMap = useSelector((state: RootState) => state.chainRegistry.details);
  const crowdloanMap = useSelector((state: RootState) => state.crowdloan.details);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const crowdloanNetworks = getCrowdloanNetworks(networkMap, 'all');
  const crowdloanContributeMap = getCrowdloanContributeMap(
    crowdloanNetworks,
    networkMap,
    chainRegistryMap,
    crowdloanMap,
    priceMap,
  );
  const dep1 = JSON.stringify(crowdloanContributeMap);
  const dep2 = JSON.stringify(crowdloanNetworks);
  const dep3 = JSON.stringify(networkMap);
  return useMemo<CrowdloanItemType[]>(() => {
    return getCrowdloanContributeList(networkMap, crowdloanNetworks, crowdloanContributeMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep1, dep2, dep3]);
}
