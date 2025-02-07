import { isEthereumAddress } from '@polkadot/util-crypto';
import { reformatAddress } from '@subwallet/extension-base/utils';

const SPECIAL_CHAIN = ['rootstock'];

export function reformatContractAddress(chainSlug: string, contractAddress: string) {
  if (SPECIAL_CHAIN.includes(chainSlug) && isEthereumAddress(contractAddress.toLowerCase())) {
    return reformatAddress(contractAddress.toLowerCase());
  }

  return contractAddress;
}
