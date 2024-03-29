import { _ChainInfo } from '@subwallet/chain-list/types';
import { LedgerNetwork } from '@subwallet/extension-base/background/KoniTypes';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountOptions, LedgerAddress, LedgerSignature } from '@polkadot/hw-ledger/types';
import { assert } from '@polkadot/util';
import { Ledger } from 'types/ledger';
import { EVMLedger, SubstrateLedger } from '../../connector/Ledger';
import useGetSupportedLedger from 'hooks/ledger/useGetSupportedLedger';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { VoidFunction } from 'types/index';
import { convertLedgerError } from 'utils/connector';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

interface StateBase {
  isLedgerEnabled: boolean;
}

interface Result extends StateBase {
  error: string | null;
  isLoading: boolean;
  isLocked: boolean;
  ledger: Ledger | null;
  refresh: () => void;
  warning: string | null;
  getAddress: (accountIndex: number) => Promise<LedgerAddress>;
  signTransaction: Ledger['signTransaction'];
  signMessage: Ledger['signMessage'];
}

const baseState: StateBase = {
  isLedgerEnabled: false,
  /* disable setting about ledger */
  // && uiSettings.ledgerConn !== 'none'
};

const getNetwork = (
  ledgerChains: LedgerNetwork[],
  slug: string,
  isEthereumNetwork: boolean,
): LedgerNetwork | undefined => {
  return ledgerChains.find(network => network.slug === slug || (network.isEthereum && isEthereumNetwork));
};

const retrieveLedger = (
  slug: string,
  ledgerChains: LedgerNetwork[],
  chainInfoMap: Record<string, _ChainInfo>,
  transport?: TransportBLE,
) => {
  const chainInfo = chainInfoMap[slug];
  const isEthereumNetwork = _isChainEvmCompatible(chainInfo);

  const def = getNetwork(ledgerChains, slug, isEthereumNetwork);

  assert(def, 'There is no known Ledger app available for this chain');

  if (transport) {
    if (def.isEthereum) {
      return new EVMLedger(transport);
    } else {
      return new SubstrateLedger(transport, def.network);
    }
  } else {
    return null;
  }
};

export function useLedger(transport?: TransportBLE, slug?: string, active = true): Result {
  const ledgerChains = useGetSupportedLedger();
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const timeOutRef = useRef<NodeJS.Timer>();
  const destroyRef = useRef<VoidFunction>();

  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [refreshLock, setRefreshLock] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ledger = useMemo(() => {
    setError(null);
    setIsLocked(false);
    setIsLoading(true);
    setWarning(null);
    setRefreshLock(false);

    // this trick allows to refresh the ledger on demand
    // when it is shown as locked and the user has actually
    // unlocked it, which we can't know.
    if (refreshLock || slug) {
      if (!slug || !active) {
        return null;
      }

      try {
        return retrieveLedger(slug, ledgerChains, chainInfoMap, transport);
      } catch (_error) {
        setError((_error as Error).message);
      }
    }

    return null;
  }, [refreshLock, slug, active, ledgerChains, chainInfoMap, transport]);

  const appName = useMemo(() => {
    const unknownNetwork = 'unknown network';

    if (!slug) {
      return unknownNetwork;
    }

    const chainInfo = chainInfoMap[slug];
    const isEthereumNetwork = _isChainEvmCompatible(chainInfo);
    const { appName: currentAppName } = getNetwork(ledgerChains, slug, isEthereumNetwork) || {
      appName: unknownNetwork,
    };

    return currentAppName;
  }, [chainInfoMap, ledgerChains, slug]);

  const refresh = useCallback(() => {
    setRefreshLock(true);
  }, []);

  const handleError = useCallback(
    (_error: Error, expandError = true) => {
      const convertedError = convertLedgerError(_error, appName, expandError);
      const message = convertedError.message;

      switch (convertedError.status) {
        case 'error':
          setWarning(null);
          setError(message);
          break;
        case 'warning':
          setWarning(message);
          setError(null);
          break;
        default:
          setWarning(null);
          setError(null);
      }
    },
    [appName],
  );

  const getAddress = useCallback(
    async (accountIndex: number): Promise<LedgerAddress> => {
      if (ledger) {
        return ledger.getAddress(false, accountIndex, 0);
      } else {
        return new Promise((resolve, reject) => {
          reject(new Error("Can't find Ledger device"));
        });
      }
    },
    [ledger],
  );

  const signTransaction = useCallback(
    async (
      message: Uint8Array,
      accountOffset?: number,
      addressOffset?: number,
      accountOption?: Partial<AccountOptions>,
    ): Promise<LedgerSignature> => {
      if (ledger) {
        return new Promise((resolve, reject) => {
          setError(null);

          ledger
            .signTransaction(message, accountOffset, addressOffset, accountOption)
            .then(result => {
              resolve(result);
            })
            .catch((_error: Error) => {
              handleError(_error);
              reject(_error);
            });
        });
      } else {
        return new Promise((resolve, reject) => {
          reject(new Error("Can't find Ledger device"));
        });
      }
    },
    [handleError, ledger],
  );

  const signMessage = useCallback(
    async (
      message: Uint8Array,
      accountOffset?: number,
      addressOffset?: number,
      accountOption?: Partial<AccountOptions>,
    ): Promise<LedgerSignature> => {
      if (ledger) {
        return new Promise((resolve, reject) => {
          setError(null);

          ledger
            .signMessage(message, accountOffset, addressOffset, accountOption)
            .then(result => {
              resolve(result);
            })
            .catch((_error: Error) => {
              handleError(_error);
              reject(_error);
            });
        });
      } else {
        return new Promise((resolve, reject) => {
          reject(new Error("Can't find Ledger device"));
        });
      }
    },
    [handleError, ledger],
  );

  useEffect(() => {
    if (!ledger || !slug || !active) {
      return;
    }

    clearTimeout(timeOutRef.current);

    setWarning(null);
    setError(null);

    timeOutRef.current = setTimeout(() => {
      ledger
        .getAddress(false, 0, 0)
        .then(() => {
          setIsLoading(false);
        })
        .catch((_error: Error) => {
          setIsLoading(false);
          handleError(_error, false);
          setIsLocked(true);
        });
    }, 300);
  }, [slug, ledger, ledgerChains, active, chainInfoMap, appName, handleError]);

  useEffect(() => {
    destroyRef.current = () => {
      ledger?.disconnect().catch(console.error);
    };
  }, [ledger]);

  useEffect(() => {
    return () => {
      destroyRef.current?.();
    };
  }, []);

  return useMemo(
    () => ({
      ...baseState,
      error,
      isLoading,
      isLocked,
      ledger,
      refresh,
      warning,
      getAddress,
      signTransaction,
      signMessage,
    }),
    [error, isLoading, isLocked, ledger, refresh, warning, getAddress, signTransaction, signMessage],
  );
}
