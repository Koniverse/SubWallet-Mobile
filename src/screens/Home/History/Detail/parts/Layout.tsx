import React from 'react';

import HistoryDetailAmount from './Amount';
import HistoryDetailFee from './Fee';
import HistoryDetailHeader from './Header';
import MetaInfo from 'components/MetaInfo';
import { HistoryStatusMap, TxTypeNameMap } from '../../shared';
import { TransactionHistoryDisplayItem } from 'types/history';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { formatHistoryDate } from 'utils/customFormatDate';
import { IconProps } from 'phosphor-react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailLayout: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const txtTypeNameMap = TxTypeNameMap();
  const historyStatusMap = HistoryStatusMap();
  const language = useSelector((state: RootState) => state.mobileSettings.language) as LanguageType;

  return (
    <MetaInfo>
      <MetaInfo.DisplayType label={i18n.historyScreen.label.transactionType} typeName={txtTypeNameMap[data.type]} />
      <HistoryDetailHeader data={data} />
      <MetaInfo.Status
        label={i18n.historyScreen.label.transactionStatus}
        statusIcon={historyStatusMap[data.status].icon as React.ElementType<IconProps>}
        statusName={historyStatusMap[data.status].name}
        valueColorSchema={historyStatusMap[data.status].schema}
      />
      {data.extrinsicHash && data.extrinsicHash.startsWith('0x') && (
        <MetaInfo.Default label={i18n.historyScreen.label.extrinsicHash}>
          {toShort(data.extrinsicHash, 8, 9)}
        </MetaInfo.Default>
      )}
      <MetaInfo.Default label={i18n.historyScreen.label.transactionTime}>
        {formatHistoryDate(data.time, language, 'detail')}
      </MetaInfo.Default>
      <HistoryDetailAmount data={data} />
      <HistoryDetailFee data={data} />
    </MetaInfo>
  );
};

export default HistoryDetailLayout;
