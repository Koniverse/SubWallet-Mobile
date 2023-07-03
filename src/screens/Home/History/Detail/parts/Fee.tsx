import { ExtrinsicType, TransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import { TransactionHistoryDisplayItem } from 'types/history';
import { isTypeTransfer } from 'utils/transaction/detectType';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailFee: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { fee } = data;

  const xcmInfo = useMemo((): TransactionAdditionalInfo<ExtrinsicType.TRANSFER_XCM> | undefined => {
    if (isTypeTransfer(data.type) && data.additionalInfo && data.type === ExtrinsicType.TRANSFER_XCM) {
      return data.additionalInfo as TransactionAdditionalInfo<ExtrinsicType.TRANSFER_XCM>;
    }

    return undefined;
  }, [data.additionalInfo, data.type]);

  if (xcmInfo) {
    return (
      <>
        <MetaInfo.Number
          decimals={fee?.decimals || undefined}
          label={i18n.historyScreen.label.originChainFee}
          suffix={fee?.symbol || undefined}
          value={fee?.value || '0'}
        />
      </>
    );
  }

  return (
    <MetaInfo.Number
      decimals={fee?.decimals || undefined}
      label={i18n.historyScreen.label.networkFee}
      suffix={fee?.symbol || undefined}
      value={fee?.value || '0'}
    />
  );
};

export default HistoryDetailFee;
