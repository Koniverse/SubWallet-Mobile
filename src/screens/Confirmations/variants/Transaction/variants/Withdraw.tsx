// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestYieldWithdrawal } from '@subwallet/extension-base/types';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

const WithdrawTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;

  const data = transaction.data as RequestYieldWithdrawal;

  const { poolInfoMap } = useSelector((state: RootState) => state.earning);

  const poolInfo = useMemo(() => poolInfoMap[data.slug], [poolInfoMap, data.slug]);

  const inputAsset = useGetChainAssetInfo(poolInfo?.metadata.inputAsset);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(data.unstakingInfo.chain);

  const amountDecimals = inputAsset?.decimals || 0;
  const amountSymbol = inputAsset?.symbol || '';

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={amountDecimals}
          label={i18n.inputLabel.amount}
          suffix={amountSymbol}
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
