import { RequestSign } from '@subwallet/extension-base/background/types';
import { useEffect, useMemo, useState } from 'react';
import { TypeRegistry } from '@polkadot/types';
import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { isRawPayload } from 'utils/confirmation/request/substrate';
import { _isRuntimeUpdated, getMetadataHash } from '@subwallet/extension-base/utils';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import { Chain } from '@subwallet/extension-chains/types';
import { SignerPayloadJSON } from '@polkadot/types/types';

const registry = new TypeRegistry();

interface Result {
  payload: ExtrinsicPayload | string;
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

  const payload = useMemo<ExtrinsicPayload | string>(() => {
    if (!request) {
      return '';
    } else {
      const _payload = request.payload;

      if (isRawPayload(_payload)) {
        return _payload.data;
      } else {
        const _registry = chain?.registry || registry;

        _registry.setSignedExtensions(_payload.signedExtensions, chain?.definition.userExtensions); // Important

        const __payload: SignerPayloadJSON = {
          ..._payload,
        };

        if (metadataHash) {
          __payload.mode = 1;
          __payload.metadataHash = `0x${metadataHash}`;
        }

        return _registry.createType('ExtrinsicPayload', __payload, { version: _payload.version });
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
        .then(_metadataHash => {
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
      isMissingData: isMissingData,
      addExtraData,
    }),
    [addExtraData, hashLoading, isMissingData, payload],
  );
};

export default useParseSubstrateRequestPayload;
