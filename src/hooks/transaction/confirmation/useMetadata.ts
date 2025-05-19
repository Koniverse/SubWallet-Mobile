// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@subwallet/extension-chains/types';
import { getMetadata, getMetadataRaw } from 'messaging/index';

import { useEffect, useMemo, useState } from 'react';
import useGetChainInfoByGenesisHash from 'hooks/chain/useGetChainInfoByGenesisHash';
import { _ChainInfo } from '@subwallet/chain-list/types';

interface Result {
  chain: Chain | null;
  loadingChain: boolean;
}

const WAITING_TIME = 3 * 1000;

export default function useMetadata(genesisHash?: string | null, specVersion?: number): Result {
  const [chain, setChain] = useState<Chain | null>(null);
  const [loadingChain, setLoadingChain] = useState(true);
  const _chainInfo = useGetChainInfoByGenesisHash(genesisHash || '');
  const [chainInfo, setChainInfo] = useState<_ChainInfo | null>(_chainInfo);
  const chainString = useMemo(() => JSON.stringify(chainInfo), [chainInfo]);

  useEffect(() => {
    const updated = JSON.stringify(_chainInfo);

    if (updated !== chainString) {
      setChainInfo(_chainInfo);
    }
  }, [_chainInfo, chainString]);

  useEffect((): void => {
    let cancel = false;
    setLoadingChain(true);

    if (genesisHash) {
      const getChainByMetaStore = async () => {
        try {
          return await getMetadata(genesisHash);
        } catch (error) {
          console.error(error);

          return null;
        }
      };

      const fetchChain = async () => {
        const [chainFromRaw, chainFromMetaStore] = await Promise.all([
          getMetadataRaw(chainInfo, genesisHash),
          getChainByMetaStore(),
        ]);

        let _chain: Chain | null;

        if (cancel) {
          return null;
        }

        if (chainFromRaw && chainFromMetaStore) {
          if (chainFromRaw.specVersion >= chainFromMetaStore.specVersion) {
            _chain = chainFromRaw;
          } else {
            _chain = chainFromMetaStore;
          }
        } else {
          _chain = chainFromRaw || chainFromMetaStore || null;
        }

        return _chain;
      };

      fetchChain()
        .then(async (_chain): Promise<boolean> => {
          if (cancel) {
            return false;
          }

          setChain(_chain);

          if (specVersion) {
            if (_chain?.specVersion === specVersion) {
              return false;
            }

            return new Promise<boolean>(resolve =>
              setTimeout(() => {
                return resolve(true);
              }, WAITING_TIME),
            ); // wait metadata ready to avoid spamming warning alert
          } else {
            return false;
          }
        })
        .then(needRetry => {
          if (needRetry) {
            fetchChain()
              .then(_chain => {
                if (cancel) {
                  return;
                }

                setChain(_chain);
                setLoadingChain(false);
              })
              .catch(() => {
                if (cancel) {
                  return;
                }

                setChain(null);
                setLoadingChain(false);
              });
          } else {
            setLoadingChain(false);
          }
        })
        .catch(error => {
          console.error(error);

          if (cancel) {
            return;
          }

          setChain(null);
          setLoadingChain(false);
        });
    } else {
      setLoadingChain(false);
      setChain(null);
    }
  }, [chainInfo, genesisHash, specVersion]);

  return useMemo(() => ({ chain, loadingChain }), [chain, loadingChain]);
}
