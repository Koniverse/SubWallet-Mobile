import { isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import i18n from 'utils/i18n/i18n';

interface Props {
  bytes: string;
}

const SubstrateMessageDetail: React.FC<Props> = (props: Props) => {
  const { bytes } = props;

  const message = useMemo(() => (isAscii(bytes) ? u8aToString(u8aUnwrapBytes(bytes)) : bytes), [bytes]);

  return (
    <MetaInfo>
      <MetaInfo.Data label={i18n.common.rawData}>{bytes}</MetaInfo.Data>
      <MetaInfo.Data label={i18n.common.message}>{message}</MetaInfo.Data>
    </MetaInfo>
  );
};

export default SubstrateMessageDetail;
