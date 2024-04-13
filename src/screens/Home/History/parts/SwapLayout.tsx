import { TransactionHistoryDisplayItem } from 'types/history';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SwapTxData } from '@subwallet/extension-base/types/swap';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';
import React, { useMemo } from 'react';
import BigN from 'bignumber.js';
import { findAccountByAddress } from 'utils/account';
import MetaInfo from 'components/MetaInfo';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';
import { _getAssetName, _getAssetOriginChain } from '@subwallet/extension-base/services/chain-service/utils';
import { HistoryStatusMap, TxTypeNameMap } from 'screens/Home/History/shared';
import AlertBox from 'components/design-system-ui/alert-box/simple';

interface Props {
  data: TransactionHistoryDisplayItem;
}

export const SwapLayout = ({ data }: Props) => {
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const swapInfo = data.additionalInfo as SwapTxData | undefined;
  const { accounts } = useSelector((state: RootState) => state.accountState);

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    swapInfo?.quote.feeInfo.feeComponent.forEach(feeItem => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, swapInfo?.quote.feeInfo.feeComponent, priceMap]);

  if (!swapInfo) {
    return <></>;
  }

  const assetFrom = assetRegistryMap[swapInfo.quote.pair.from];
  const assetTo = assetRegistryMap[swapInfo.quote.pair.to];
  const recipientAddress = data.to || (swapInfo.recipient as string);
  const account = findAccountByAddress(accounts, recipientAddress);
  const txtTypeNameMap = TxTypeNameMap();
  const historyStatusMap = HistoryStatusMap();

  return (
    <MetaInfo>
      <SwapTransactionBlock data={swapInfo} />
      {_getAssetOriginChain(assetFrom) === _getAssetOriginChain(assetTo) ? (
        <MetaInfo.Chain chain={_getAssetOriginChain(assetFrom)} label={'Network'} />
      ) : (
        <MetaInfo.Transfer
          destinationChain={{
            slug: _getAssetOriginChain(assetTo),
            name: _getAssetName(assetTo),
          }}
          originChain={{
            slug: _getAssetOriginChain(assetFrom),
            name: _getAssetName(assetFrom),
          }}
          recipientAddress={recipientAddress}
          recipientName={account?.name}
          senderAddress={data.from}
          senderName={data.fromName}
        />
      )}
      <MetaInfo.DisplayType label={'Transaction type'} typeName={txtTypeNameMap[data.type]} />
      <MetaInfo.Status
        label={'Transaction status'}
        statusIcon={historyStatusMap[data.status].icon}
        statusName={historyStatusMap[data.status].name}
        valueColorSchema={historyStatusMap[data.status].schema}
      />
      <MetaInfo.Number decimals={0} label={'Estimated transaction fee'} prefix={'$'} value={estimatedFeeValue} />
      <AlertBox
        description={'You can view your swap process and details by clicking View on explorer'}
        title={'Helpful tip'}
        type="info"
      />
    </MetaInfo>
  );
};
