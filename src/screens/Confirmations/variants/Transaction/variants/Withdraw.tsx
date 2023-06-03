// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestStakeWithdrawal } from '@subwallet/extension-base/background/KoniTypes';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import React from 'react';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

const WithdrawTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const data = transaction.data as RequestStakeWithdrawal;

  const { decimals, symbol } = useGetNativeTokenBasicInfo(data.chain);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.amount}
          suffix={symbol}
          value={data.unstakingInfo.claimable}
        />

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

export default WithdrawTransactionConfirmation;
