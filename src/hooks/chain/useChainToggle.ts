import { useCallback, useEffect, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { updateChainActiveState } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { ChainInfoWithStateAnhStatus } from 'hooks/chain/useChainInfoWithStateAndStatus';

// A toggle can outlive the screen -- the user may navigate away while a request is in
// flight -- so pending rows are remembered per caller rather than per mount. Keyed so
// that the screens toggling chains do not inherit each other's pending rows.
const pendingChainMapCache: Record<string, Record<string, boolean>> = {};

export interface ChainToggle {
  /** Requested state per slug, for rows the backend has not confirmed yet. */
  pendingChainMap: Record<string, boolean>;
  hasPendingChain: boolean;
  isChainPending: (slug: string) => boolean;
  /** The requested state while pending, otherwise the state the backend reports. */
  getChainActiveState: (slug: string) => boolean;
  toggleChain: (slug: string) => void;
}

/** Shared toggle state for the screens that switch chains on and off. */
export default function useChainToggle(
  chainInfoMap: Record<string, ChainInfoWithStateAnhStatus>,
  cacheKey: string,
): ChainToggle {
  const toast = useToast();
  const [pendingChainMap, setPendingChainMap] = useState<Record<string, boolean>>(
    () => pendingChainMapCache[cacheKey] || {},
  );

  useEffect(() => {
    pendingChainMapCache[cacheKey] = pendingChainMap;
  }, [cacheKey, pendingChainMap]);

  const releasePendingChains = useCallback((slugs: string[]) => {
    setPendingChainMap(prevPendingChainMap => {
      const nextPendingChainMap = { ...prevPendingChainMap };

      slugs.forEach(slug => {
        delete nextPendingChainMap[slug];
      });

      return nextPendingChainMap;
    });
  }, []);

  const isChainPending = useCallback((slug: string) => pendingChainMap[slug] !== undefined, [pendingChainMap]);

  const getChainActiveState = useCallback(
    (slug: string) => pendingChainMap[slug] ?? chainInfoMap[slug]?.active ?? false,
    [chainInfoMap, pendingChainMap],
  );

  const toggleChain = useCallback(
    (slug: string) => {
      if (pendingChainMap[slug] !== undefined) {
        return;
      }

      const nextActiveState = !(chainInfoMap[slug]?.active ?? false);

      setPendingChainMap(prevPendingChainMap => ({ ...prevPendingChainMap, [slug]: nextActiveState }));

      // Release the row when the request settles, the way the extension does, rather
      // than waiting for the store to report the new state. The backend publishes that
      // only after awaiting balance detection and API init, so waiting on it left rows
      // disabled indefinitely with no way to undo them.
      const release = () => releasePendingChains([slug]);

      const fail = () => {
        console.warn('Toggle network request failed!');
        release();
        toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
      };

      updateChainActiveState(slug, nextActiveState)
        .then(result => (result ? release() : fail()))
        .catch(fail);
    },
    [chainInfoMap, pendingChainMap, releasePendingChains, toast],
  );

  return {
    pendingChainMap,
    hasPendingChain: Object.keys(pendingChainMap).length > 0,
    isChainPending,
    getChainActiveState,
    toggleChain,
  };
}
