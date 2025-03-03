import React from 'react';
import { FeeDetail, TransactionFee } from '@subwallet/extension-base/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';

interface Props {
  feeOptionsInfo?: FeeDetail;
  onSelectOption: (option: TransactionFee) => void;
  symbol: string;
  decimals: number;
  tokenSlug: string;
  priceValue: number;
  feeType?: string;
  listTokensCanPayFee?: TokenHasBalanceInfo[];
  onSetTokenPayFee: (token: string) => void;
  currentTokenPayFee?: string;
  chainValue?: string;
  selectedFeeOption?: TransactionFee;
}

export const FeeEditorModal = ({}: Props) => {
  return <></>;
};
