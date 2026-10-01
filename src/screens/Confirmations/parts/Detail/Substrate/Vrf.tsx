import { isAscii, u8aToString, u8aToU8a } from '@polkadot/util';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: string;
  context?: string;
  url: string;
}

const VrfDetail: React.FC<Props> = ({ context, data, url }: Props) => {
  // the origin is what binds the derived key: show the exact value the wallet signs over, not the
  // full url, so the user can tell `http://` and `https://` on the same host apart
  const origin = useMemo(() => {
    try {
      return new URL(url).origin;
    } catch {
      return url;
    }
  }, [url]);

  // the VRF payload is never `wrapBytes`-framed, so it is decoded as-is
  const message = useMemo(() => (isAscii(data) ? u8aToString(u8aToU8a(data)) : data), [data]);

  return (
    <MetaInfo>
      <MetaInfo.Data label={i18n.confirmation.boundTo}>{origin}</MetaInfo.Data>
      <MetaInfo.Data label={i18n.common.rawData}>{data}</MetaInfo.Data>
      <MetaInfo.Data label={i18n.common.message}>{message}</MetaInfo.Data>
      {!!context && <MetaInfo.Data label={i18n.confirmation.context}>{context}</MetaInfo.Data>}
    </MetaInfo>
  );
};

export default VrfDetail;
