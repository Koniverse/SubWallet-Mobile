import { ChainRegistry, TokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { BalanceFormatType } from 'types/ui-types';
import { BN, BN_HUNDRED } from '@polkadot/util';
import { getTokenDisplayName } from 'utils/chainBalances';

export function getBalanceFormat(
  networkKey: string,
  token: string,
  chainRegistryMap: Record<string, ChainRegistry>,
): BalanceFormatType {
  const tokenInfo = chainRegistryMap[networkKey].tokenMap[token];

  return [tokenInfo?.decimals, tokenInfo?.symbol, tokenInfo?.symbolAlt];
}

function getPartialFee(
  fee: string | null,
  feeSymbol: string | null | undefined,
  selectedToken: string,
  mainTokenSymbol: string,
): BN {
  if (!fee) {
    return new BN('0');
  }

  if (feeSymbol) {
    if (feeSymbol !== selectedToken) {
      return new BN('0');
    }
  } else {
    // feeSymbol is null or undefined => use mainTokenSymbol
    if (selectedToken !== mainTokenSymbol) {
      return new BN('0');
    }
  }

  return new BN(fee);
}

export function getMaxTransferAndNoFees(
  fee: string | null,
  feeSymbol: string | null | undefined,
  selectedToken: string,
  mainTokenSymbol: string,
  senderFreeBalance: string,
  existentialDeposit: string,
): [BN | null, boolean] {
  const partialFee = getPartialFee(fee, feeSymbol, selectedToken, mainTokenSymbol);
  const adjFee = partialFee.muln(110).div(BN_HUNDRED);
  const maxTransfer = new BN(senderFreeBalance).sub(adjFee);

  return maxTransfer.gt(new BN(existentialDeposit)) ? [maxTransfer, false] : [null, true];
}

export function isContainGasRequiredExceedsError(message: string): boolean {
  return message.toLowerCase().includes('gas required exceeds');
}

export function getMainTokenInfo(networkKey: string, chainRegistryMap: Record<string, ChainRegistry>): TokenInfo {
  // chainRegistryMap always has main token
  return Object.values(chainRegistryMap[networkKey].tokenMap).find(t => t.isMainToken) as TokenInfo;
}

export function getAuthTransactionFeeInfo(
  fee: string | null,
  feeDecimal: number | null,
  feeSymbol: string | null | undefined,
  mainTokenInfo: TokenInfo,
  tokenMap: Record<string, TokenInfo>,
): [string | null, number, string] {
  const decimal = feeDecimal || mainTokenInfo.decimals;
  let symbol;

  if (feeSymbol) {
    symbol = getTokenDisplayName(feeSymbol, tokenMap[feeSymbol]?.symbolAlt);
  } else {
    symbol = mainTokenInfo.symbol;
  }

  return [fee, decimal, symbol];
}
