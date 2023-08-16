import { _ChainInfo } from '@subwallet/chain-list/types';
import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getFreeBalance, updateAssetSetting } from 'messaging/index';
import i18n from 'utils/i18n/i18n';

const DEFAULT_BALANCE = { value: '0', symbol: '', decimals: 18 };

const useGetBalance = (chain = '', address = '', tokenSlug = '') => {
  const { chainInfoMap, chainStateMap } = useSelector((state: RootState) => state.chainStore);
  const { assetSettingMap, assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  const chainInfo = useMemo((): _ChainInfo | undefined => chainInfoMap[chain], [chainInfoMap, chain]);
  const nativeTokenSlug = useMemo(() => (chainInfo ? _getChainNativeTokenSlug(chainInfo) : undefined), [chainInfo]);

  const [nativeTokenBalance, setNativeTokenBalance] = useState<AmountData>(DEFAULT_BALANCE);
  const [tokenBalance, setTokenBalance] = useState<AmountData>(DEFAULT_BALANCE);
  const [isRefresh, setIsRefresh] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isChainActive = chainStateMap[chain]?.active;
  const nativeTokenActive = nativeTokenSlug && assetSettingMap[nativeTokenSlug]?.visible;
  const isTokenActive = assetSettingMap[tokenSlug]?.visible;

  const refreshBalance = useCallback(() => {
    setIsRefresh({});
  }, []);

  useEffect(() => {
    let cancel = false;

    setIsLoading(true);
    setTokenBalance(DEFAULT_BALANCE);

    if (address && chain) {
      const promiseList = [] as Promise<any>[];
      let childTokenActive = true;

      if (tokenSlug && tokenSlug !== nativeTokenSlug && !isTokenActive) {
        childTokenActive = false;
      }

      if (isChainActive) {
        if (!childTokenActive) {
          promiseList.push(
            updateAssetSetting({
              tokenSlug,
              assetSetting: {
                visible: true,
              },
              autoEnableNativeToken: true,
            }),
          );
        } else if (nativeTokenSlug && !nativeTokenActive) {
          promiseList.push(
            updateAssetSetting({
              tokenSlug: nativeTokenSlug,
              assetSetting: {
                visible: true,
              },
            }),
          );
        }

        promiseList.push(
          getFreeBalance({ address, networkKey: chain })
            .then(balance => {
              !cancel && setNativeTokenBalance(balance);
            })
            .catch((e: Error) => {
              !cancel && setError(i18n.message.cannotGetBalance);
              console.error(e);
            }),
        );

        if (tokenSlug && tokenSlug !== nativeTokenSlug) {
          promiseList.push(
            getFreeBalance({ address, networkKey: chain, token: tokenSlug })
              .then(balance => {
                !cancel && setTokenBalance(balance);
              })
              .catch((e: Error) => {
                !cancel && setError(i18n.message.cannotGetBalance);
                console.error(e);
              }),
          );
        }

        Promise.all(promiseList).finally(() => {
          !cancel && setIsLoading(false);
        });
      } else {
        const tokenNames = [];

        if (!isChainActive && nativeTokenSlug && assetRegistry[nativeTokenSlug]) {
          tokenNames.push(assetRegistry[nativeTokenSlug].symbol);
        }

        if (!isChainActive && tokenSlug && tokenSlug !== nativeTokenSlug && assetRegistry[tokenSlug]) {
          tokenNames.push(assetRegistry[tokenSlug].symbol);
        }

        !cancel && setNativeTokenBalance(DEFAULT_BALANCE);
        !cancel && setTokenBalance(DEFAULT_BALANCE);
        !cancel && setIsLoading(false);
        !cancel && setError(i18n.message.enableTokenOnChain(tokenNames.join(', '), chainInfo?.name || ''));
      }
    }

    return () => {
      cancel = true;
      setIsLoading(true);
      setError(null);
    };
  }, [
    address,
    chain,
    nativeTokenSlug,
    tokenSlug,
    isRefresh,
    assetRegistry,
    chainInfo?.name,
    isChainActive,
    isTokenActive,
    nativeTokenActive,
  ]);

  return { refreshBalance, tokenBalance, nativeTokenBalance, nativeTokenSlug, isLoading, error };
};

export default useGetBalance;
