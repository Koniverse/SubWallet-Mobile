import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { CrowdloanContributeValueType } from 'hooks/types';
import useGetNetworkMetadata from 'hooks/screen/useGetNetworkMetadata';
import { APIItemState, ChainRegistry, NetWorkGroup } from '@subwallet/extension-base/background/KoniTypes';
import { getBalances } from 'utils/chainBalances';

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

function getGroupNetworkKey(groups: NetWorkGroup[]): string {
  if (groups.includes('POLKADOT_PARACHAIN')) {
    return 'polkadot';
  }

  if (groups.includes('KUSAMA_PARACHAIN')) {
    return 'kusama';
  }

  return '';
}

export default function useGetCrowdloanContributeMap(
  crowdloanNetworks: string[],
): Record<string, CrowdloanContributeValueType> {
  const chainRegistryMap = useSelector((state: RootState) => state.chainRegistry.details);
  const crowdloanMap = useSelector((state: RootState) => state.crowdloan.details);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const networkMetadataMap = useGetNetworkMetadata();
  const crowdloanContributeMap: Record<string, CrowdloanContributeValueType> = {};
  crowdloanNetworks.forEach(networkKey => {
    const networkMetadata = networkMetadataMap[networkKey];

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
