import {NetworkProtocols} from 'constants/networkSpecs';

export type NetworkProtocol = 'ethereum' | 'substrate';

export type NetworkParams = SubstrateNetworkParams | EthereumNetwork;

export type SubstrateNetworkDefaultConstant = {
  color: string;
  decimals: number;
  deleted?: boolean;
  genesisHash: string;
  logo?: number;
  metadataKey: string;
  order: number;
  pathId: string;
  protocol?: NetworkProtocol;
  prefix: number;
  secondaryColor?: string;
  title: string;
  unit: string;
};

export type SubstrateNetworkBasics = {
  color?: string;
  decimals: number;
  deleted?: boolean;
  genesisHash: string;
  order?: number;
  pathId: string;
  protocol?: NetworkProtocol;
  prefix: number;
  secondaryColor?: string;
  title: string;
  unit: string;
};

export type SubstrateNetworkParams = {
  color: string;
  decimals: number;
  deleted: boolean;
  genesisHash: string;
  logo: number;
  metadataKey: string;
  order: number;
  pathId: string;
  protocol: NetworkProtocol;
  prefix: number;
  secondaryColor: string;
  title: string;
  unit: string;
};

export type EthereumNetworkDefaultConstants = {
  color?: string;
  ethereumChainId: string;
  logo?: number;
  order: number;
  pathId: string;
  protocol?: NetworkProtocol;
  secondaryColor?: string;
  title: string;
};

export type EthereumNetwork = {
  color: string;
  ethereumChainId: string;
  logo: number;
  order: number;
  pathId: string;
  protocol: NetworkProtocol;
  secondaryColor: string;
  title: string;
};

export type Networks = Map<string, NetworkParams>;
export type SubstrateNetworks = Map<string, SubstrateNetworkParams>;

export function isSubstrateNetwork(
  network?: SubstrateNetworkParams | EthereumNetwork | null,
): network is SubstrateNetworkParams {
  if (!network) {
    return false;
  }

  return network.protocol === NetworkProtocols.SUBSTRATE;
}

export function isEthereumNetwork(
  network: SubstrateNetworkParams | EthereumNetwork,
): network is EthereumNetwork {
  return (network as EthereumNetwork).protocol === NetworkProtocols.ETHEREUM;
}
