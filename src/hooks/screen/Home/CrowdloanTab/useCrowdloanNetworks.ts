import { NetWorkMetadataDef } from '@subwallet/extension-base/background/KoniTypes';
import useGetNetworkMetadata from 'hooks/screen/useGetNetworkMetadata';

function getCrowdloanNetworkMaps(source: Record<string, NetWorkMetadataDef>): Record<string, string[]> {
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

function getCrowdloanNetworks(
  networkMetadata: Record<string, NetWorkMetadataDef>,
  currentNetworkKey: string,
): string[] {
  const crowdloanNetworkMap = getCrowdloanNetworkMaps(networkMetadata);

  if (currentNetworkKey === 'all') {
    return [...crowdloanNetworkMap.all];
  }

  if (currentNetworkKey === 'polkadot') {
    return [...crowdloanNetworkMap.polkadot];
  }

  if (currentNetworkKey === 'kusama') {
    return [...crowdloanNetworkMap.kusama];
  }

  return [currentNetworkKey];
}

export default function useCrowdloanNetworks(currentNetworkKey: string): string[] {
  const networkMetadata = useGetNetworkMetadata();

  return getCrowdloanNetworks(networkMetadata, currentNetworkKey);
}
