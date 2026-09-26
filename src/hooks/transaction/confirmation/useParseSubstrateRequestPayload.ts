import { RequestSign, SubstratePayloadErrorType } from '@subwallet/extension-base/background/types';
import { useEffect, useMemo, useState } from 'react';
import { TypeRegistry } from '@polkadot/types';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { isRawPayload } from 'utils/confirmation/request/substrate';
import { _isRuntimeUpdated } from '@subwallet/extension-base/utils';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import { Chain } from '@subwallet/extension-chains/types';
import { SignerPayloadJSON } from '@polkadot/types/types';
import { getMetadataHash } from 'messaging/index';
import { HexString } from '@polkadot/util/types';

const registry = new TypeRegistry();

interface PayloadError {
  message?: string;
  type: SubstratePayloadErrorType;
}

interface Result {
  payload: ExtrinsicPayload | string;
  payloadError: PayloadError | null;
  hashLoading: boolean;
  isMissingData: boolean;
  addExtraData: boolean;
}

const useParseSubstrateRequestPayload = (chain: Chain | null, request?: RequestSign, isLedger?: boolean): Result => {
  const chainInfo = useGetChainInfoByGenesisHash(chain?.genesisHash || '');
  const chainSlug = useMemo(() => chainInfo?.slug || '', [chainInfo]);
  const isMissingData = useMemo(() => {
    if (!request) {
      return false;
    }

    const payload = request.payload;

    if (isRawPayload(payload)) {
      return false;
    } else {
      if (!isLedger) {
        return false;
      }

      const runtimeUpdated = _isRuntimeUpdated(payload.signedExtensions);

      return runtimeUpdated && (payload.mode !== 1 || !payload.metadataHash);
    }
  }, [request, isLedger]);

  const addExtraData = useMemo(() => {
    if (!isMissingData || !request) {
      return false;
    }

    const payload = request.payload as SignerPayloadJSON;

    return !!payload.withSignedTransaction;
  }, [request, isMissingData]);

  const [metadataHash, setMetadataHash] = useState<string>(''); // Have value only when missingData is true
  const [hashLoading, setHashLoading] = useState(true);

  const { payload, payloadError } = useMemo<Pick<Result, 'payload' | 'payloadError'>>(() => {
    if (!request) {
      return {
        payload: '',
        payloadError: null,
      };
    } else if (request.isRawDataInExtrinsic) {
      return {
        payload: '',
        payloadError: { type: SubstratePayloadErrorType.RawDataInExtrinsic },
      };
    } else {
      const _payload = request.payload;

      if (isRawPayload(_payload)) {
        return {
          payload: _payload.data,
          payloadError: null,
        };
      } else {
        try {
          const _registry = chain?.registry || registry;

          _registry.setSignedExtensions(_payload.signedExtensions, chain?.definition.userExtensions); // Important

          const __payload: SignerPayloadJSON = {
            ..._payload,
          };

          if (metadataHash) {
            __payload.mode = 1;
            __payload.metadataHash = metadataHash as HexString;
          }

          return {
            payload: _registry.createType('ExtrinsicPayload', __payload, { version: __payload.version }),
            payloadError: null,
          };
        } catch (error) {
          console.error('Error parsing substrate request payload', error);

          return {
            payload: '',
            payloadError: {
              message: error instanceof Error ? error.message : String(error),
              type: SubstratePayloadErrorType.Decode,
            },
          };
        }
      }
    }
  }, [chain, metadataHash, request]);

  // For metadata digest hash
  useEffect(() => {
    let cancel = false;

    if (!addExtraData) {
      setHashLoading(false);

      return;
    } else {
      setHashLoading(true);

      getMetadataHash(chainSlug)
        .then(({ metadataHash: _metadataHash }) => {
          setMetadataHash(_metadataHash);
        })
        .catch(console.log)
        .finally(() => {
          if (!cancel) {
            setHashLoading(false);
          }
        });
    }

    return () => {
      cancel = true;
    };
  }, [chainSlug, addExtraData]);

  return useMemo(
    () => ({
      hashLoading,
      payload,
      payloadError,
      isMissingData: isMissingData,
      addExtraData,
    }),
    [addExtraData, hashLoading, isMissingData, payload, payloadError],
  );
};

export default useParseSubstrateRequestPayload;
