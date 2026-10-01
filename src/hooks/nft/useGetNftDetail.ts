// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftDetailRequest, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { getNftDetail } from 'messaging/index';
import { useEffect, useState } from 'react';

interface Result {
  data?: NftItem;
  isLoading: boolean;
}

interface CacheEntry {
  data: NftItem;
  storedAt: number;
}

/** Mirrors the `gcTime` the extension gives this query through react-query. */
const CACHE_TTL = 5 * 60 * 1000;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<NftItem>>();

function cacheKey(request: NftDetailRequest): string {
  return `${request.chainSlug}/${request.collectionId}/${request.tokenId}`;
}

function readCache(key: string): NftItem | undefined {
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  if (Date.now() - entry.storedAt > CACHE_TTL) {
    cache.delete(key);

    return undefined;
  }

  return entry.data;
}

function fetchDetail(key: string, request: NftDetailRequest): Promise<NftItem> {
  // Two screens can ask for the same token at once (a bundle detail and the structure view behind
  // it); without this they would each fire their own round trip to the web runner.
  const pending = inFlight.get(key);

  if (pending) {
    return pending;
  }

  const promise = getNftDetail(request)
    .then(response => {
      cache.set(key, { data: response, storedAt: Date.now() });

      return response;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);

  return promise;
}

/**
 * The bundle tree cached in the store only carries what the collection endpoint returns, so the
 * name/description of a nested token may be missing. The detail endpoint fills those in.
 *
 * The extension wraps this in react-query; mobile has no such dependency, so the cache, the
 * in-flight dedupe and the stale-while-revalidate behaviour live here instead.
 */
export default function useGetNftDetail(chain: string, collectionId: string, nftId: string): Result {
  const [data, setData] = useState<NftItem | undefined>(() =>
    readCache(cacheKey({ chainSlug: chain, collectionId, tokenId: nftId })),
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chain || !nftId) {
      setData(undefined);
      setIsLoading(false);

      return;
    }

    let cancelled = false;
    const request: NftDetailRequest = { chainSlug: chain, collectionId, tokenId: nftId };
    const key = cacheKey(request);
    const cached = readCache(key);

    // Show whatever is cached straight away, then revalidate — the token's name or description can
    // change between visits, so a cache hit is a head start rather than a reason to skip the call.
    setData(cached);
    setIsLoading(!cached);

    fetchDetail(key, request)
      .then(response => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch(error => {
        console.error(error);

        if (!cancelled && !cached) {
          setData(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chain, collectionId, nftId]);

  return { data, isLoading };
}
