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
import AlertBox from 'components/design-system-ui/alert-box/simple';

type Props = BaseTransactionConfirmationProps;

const TransferBlock: React.FC<Props> = ({ transaction }: Props) => {
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_BALANCE];
  const xcmData = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_XCM];
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const tokenInfo =
    assetRegistryMap[transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM ? xcmData.tokenSlug : data.tokenSlug];

  const chainInfo = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);

  const receiveChain = useMemo(() => {
    if (xcmData) {
      return xcmData.destinationNetworkKey || transaction.chain;
    } else {
      return transaction.chain;
    }
  }, [transaction.chain, xcmData]);

  const { decimals: nativeTokenDecimals, symbol: nativeTokenSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const feeInfo = transaction.estimateFee;
  const senderPrefix = useGetChainPrefixBySlug(transaction.chain);
  const network = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);
  const receiverPrefix = useGetChainPrefixBySlug(receiveChain);

  return (
    <ConfirmationContent isFullHeight>
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.from} label={i18n.inputLabel.sendFrom} networkPrefix={senderPrefix} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={i18n.inputLabel.senderNetwork} />
        )}

        <MetaInfo.Account address={data.to} label={i18n.inputLabel.sendTo} networkPrefix={receiverPrefix} />

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
          decimals={feeInfo ? feeInfo.decimals : nativeTokenDecimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={feeInfo ? feeInfo.symbol : nativeTokenSymbol}
          value={feeInfo ? feeInfo.value : 0}
        />
      </MetaInfo>
      {!!transaction.estimateFee?.tooHigh && (
        <AlertBox
          description={'Gas fees on {{networkName}} are high due to high demands, so gas estimates are less accurate.'.replace(
            '{{networkName}}',
            network.name,
          )}
          title={'Pay attention!'}
          type="warning"
        />
      )}

      {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && (
        <AlertBox
          type={'warning'}
          title={i18n.message.xcmTransferWarningTitle}
          description={i18n.message.xcmTransferWarningMessage}
        />
      )}
    </ConfirmationContent>
  );
};

export default TransferBlock;
