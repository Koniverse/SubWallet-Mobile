// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { convertDerivativeToOriginToken } from '@subwallet/extension-base/koni/api/yield/helper/utils';
import { SpecialYieldPoolInfo, YieldPoolType } from '@subwallet/extension-base/types';
import { RequestYieldLeave } from '@subwallet/extension-base/types/yield/actions/others';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const FastWithdrawTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const { estimateFee } = transaction;
  const { amount, slug } = transaction.data as RequestYieldLeave;

  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { poolInfoMap, minAmountPercentMap } = useSelector((state: RootState) => state.earning);
  const yieldPoolInfo = poolInfoMap[slug] as SpecialYieldPoolInfo;

  const isLendingPool = useMemo(() => {
    return yieldPoolInfo.type === YieldPoolType.LENDING;
  }, [yieldPoolInfo.type]);

  const assetInfo = useMemo(() => {
    const tokenSlug = isLendingPool ? yieldPoolInfo.metadata.inputAsset : yieldPoolInfo.metadata.derivativeAssets[0];

    return assetRegistry[tokenSlug || ''];
  }, [assetRegistry, isLendingPool, yieldPoolInfo.metadata.derivativeAssets, yieldPoolInfo.metadata.inputAsset]);

  const receivedAssetInfo = useMemo(() => {
    const tokenSlug = yieldPoolInfo.metadata.inputAsset;

    return assetRegistry[tokenSlug || ''];
  }, [assetRegistry, yieldPoolInfo.metadata.inputAsset]);

  const estimatedReceivables = useMemo(() => {
    const derivativeTokenSlug = yieldPoolInfo.metadata.derivativeAssets[0] || '';
    const originTokenSlug = yieldPoolInfo.metadata.inputAsset;

    const derivativeTokenInfo = assetRegistry[derivativeTokenSlug];
    const originTokenInfo = assetRegistry[originTokenSlug];

    return convertDerivativeToOriginToken(amount, yieldPoolInfo, derivativeTokenInfo, originTokenInfo);
  }, [amount, assetRegistry, yieldPoolInfo]);

  const percent = useMemo(() => {
    return minAmountPercentMap[yieldPoolInfo.slug] || minAmountPercentMap.default;
  }, [minAmountPercentMap, yieldPoolInfo.slug]);

  return (
    <ConfirmationContent isFullHeight={true} isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Number decimals={assetInfo.decimals || 0} label={'Amount'} suffix={assetInfo.symbol} value={amount} />

        {!isLendingPool && (
          <MetaInfo.Number
            decimals={receivedAssetInfo.decimals || 0}
            label={'Estimated receivables'}
            suffix={receivedAssetInfo.symbol}
            value={estimatedReceivables}
          />
        )}

        {!isLendingPool && (
          <MetaInfo.Number
            decimals={receivedAssetInfo.decimals || 0}
            label={'Minimum receivables'}
            suffix={receivedAssetInfo.symbol}
            value={Math.floor(estimatedReceivables * percent)}
          />
        )}

        {estimateFee && (
          <MetaInfo.Number
            decimals={estimateFee.decimals}
            label={'Estimated fee'}
            suffix={estimateFee.symbol}
            value={estimateFee.value}
          />
        )}
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default FastWithdrawTransactionConfirmation;
