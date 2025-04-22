// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TokenSpendingApprovalParams } from '@subwallet/extension-base/types';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';

type Props = BaseTransactionConfirmationProps;

const TokenApproveConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const txParams = useMemo(
    (): TokenSpendingApprovalParams => transaction.data as TokenSpendingApprovalParams,
    [transaction.data],
  );

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={txParams.contractAddress} label={'Contract'} />

        <MetaInfo.Account address={txParams.spenderAddress} label={'Spender contract'} />

        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default TokenApproveConfirmation;
