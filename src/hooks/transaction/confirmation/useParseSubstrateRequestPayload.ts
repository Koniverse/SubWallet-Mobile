import { RequestSign } from '@subwallet/extension-base/background/types';
import { useMemo } from 'react';
import { TypeRegistry } from '@polkadot/types';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { isRawPayload } from 'utils/confirmation/request/substrate';

const registry = new TypeRegistry();

const useParseSubstrateRequestPayload = (request?: RequestSign): ExtrinsicPayload | string => {
  return useMemo(() => {
    if (!request) {
      return '';
    }

    const payload = request.payload;

    if (isRawPayload(payload)) {
      return payload.data;
    } else {
      registry.setSignedExtensions(payload.signedExtensions); // Important

      return registry.createType('ExtrinsicPayload', payload, { version: payload.version });
    }
  }, [request]);
};

export default useParseSubstrateRequestPayload;
