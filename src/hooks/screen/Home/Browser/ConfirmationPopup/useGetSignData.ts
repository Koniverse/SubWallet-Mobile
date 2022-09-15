import { useEffect, useState } from 'react';
import { SignData } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { RequestSign } from '@subwallet/extension-base/background/types';
import { TypeRegistry } from '@polkadot/types';

function isRawPayload(payload: SignerPayloadJSON | SignerPayloadRaw): payload is SignerPayloadRaw {
  return !!(payload as SignerPayloadRaw).data;
}

const registry = new TypeRegistry();

export default function useGetSignData(request: RequestSign) {
  const [{ hexBytes, payload }, setSignData] = useState<SignData>({ hexBytes: null, payload: null });

  useEffect((): void => {
    const _payload = request.payload;

    if (isRawPayload(_payload)) {
      setSignData({
        hexBytes: _payload.data,
        payload: null,
      });
    } else {
      registry.setSignedExtensions(_payload.signedExtensions);

      setSignData({
        hexBytes: null,
        payload: registry.createType('ExtrinsicPayload', _payload, { version: _payload.version }),
      });
    }
  }, [request]);

  return {
    hexBytes,
    payload,
  };
}
