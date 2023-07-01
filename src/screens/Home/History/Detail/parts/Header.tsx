import { ExtrinsicType, TransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TransactionHistoryDisplayItem } from 'types/history';
import { RootState } from 'stores/index';
import { isTypeStaking, isTypeTransfer } from 'utils/transaction/detectType';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailHeader: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const isStaking = isTypeStaking(data.type);

  const xcmInfo = useMemo((): TransactionAdditionalInfo<ExtrinsicType.TRANSFER_XCM> | undefined => {
    if (isTypeTransfer(data.type) && data.additionalInfo && data.type === ExtrinsicType.TRANSFER_XCM) {
      return data.additionalInfo as TransactionAdditionalInfo<ExtrinsicType.TRANSFER_XCM>;
    }

    return undefined;
  }, [data.additionalInfo, data.type]);

  if (xcmInfo) {
    return (
      <MetaInfo.Transfer
        destinationChain={{
          slug: xcmInfo.destinationChain,
          name: _getChainName(chainInfoMap[xcmInfo.destinationChain]),
        }}
        originChain={{
          slug: xcmInfo.originalChain || data.chain,
          name: _getChainName(chainInfoMap[xcmInfo.originalChain || data.chain]),
        }}
        recipientAddress={data.to}
        recipientName={data.toName}
        senderAddress={data.from}
        senderName={data.fromName}
      />
    );
  }

  return (
    <>
      <MetaInfo.Chain chain={data.chain} label={i18n.historyScreen.label.network} />

      {isStaking ? (
        <MetaInfo.Account
          address={data.from}
          label={i18n.historyScreen.label.fromAccount}
          name={data.fromName}
          networkPrefix={chainInfoMap[data.chain]?.substrateInfo?.addressPrefix}
        />
      ) : (
        <MetaInfo.Transfer
          recipientAddress={data.to}
          recipientName={data.toName}
          senderAddress={data.from}
          senderName={data.fromName}
        />
      )}
    </>
  );
};

export default HistoryDetailHeader;
