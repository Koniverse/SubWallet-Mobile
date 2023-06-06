// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

const TransferBlock: React.FC<Props> = ({ transaction }: Props) => {
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_BALANCE];
  const xcmData = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_XCM];
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const tokenInfo =
    assetRegistryMap[transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM ? xcmData.tokenSlug : data.tokenSlug];

  const chainInfo = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);

  const { decimals: chainDecimals, symbol: chainSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const senderPrefix = useGetChainPrefixBySlug(transaction.chain);

  return (
    <ConfirmationContent isFullHeight>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.from} label={i18n.inputLabel.sendFrom} networkPrefix={senderPrefix} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={i18n.inputLabel.senderNetwork} />
        )}

        <MetaInfo.Account address={data.to} label={i18n.inputLabel.sendTo} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={xcmData.destinationNetworkKey} label={i18n.inputLabel.destinationNetwork} />
        )}

        {transaction.extrinsicType !== ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={i18n.inputLabel.network} />
        )}
      </MetaInfo>

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={tokenInfo.decimals || 0}
          label={i18n.inputLabel.amount}
          suffix={tokenInfo.symbol}
          value={data.value || 0}
        />

        <MetaInfo.Number
          decimals={chainDecimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={chainSymbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default TransferBlock;
