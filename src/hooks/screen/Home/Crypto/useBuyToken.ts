import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getReformatedAddressRelatedToChain } from 'utils/account';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Linking, Platform } from 'react-native';
import { ServiceItem, baseServiceItems } from 'screens/Home/Crypto/ServiceModal';
import { BuyServiceInfo, CreateBuyOrderFunction, SupportService } from 'types/buy';
import { BrowserOptions, createBanxaOrder, createCoinbaseOrder, createTransakOrder } from 'utils/buy';
import { isAccountAll } from 'utils/accountAll';
import useAppLock from 'hooks/useAppLock';
import { _getOriginChainOfAsset, _isAssetFungibleToken } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountProxy, BuyTokenInfo } from '@subwallet/extension-base/types';
import { AccountAddressItemType } from 'types/account';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';
import useAssetChecker from 'hooks/chain/useAssetChecker';
import { reformatAddress } from '@subwallet/extension-base/utils';

const convertChainActivePriority = (active?: boolean) => (active ? 1 : 0);

export default function useBuyToken(currentAccountProxy: AccountProxy | null, currentSymbol?: string) {
  const { accountProxies } = useSelector((state: RootState) => state.accountState);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { isLocked } = useAppLock();
  const { walletReference } = useSelector((state: RootState) => state.settings);
  const { chainInfoMap, chainStateMap } = useSelector((state: RootState) => state.chainStore);
  const { services, tokens } = useSelector((state: RootState) => state.buyService);
  const checkAsset = useAssetChecker();
  const allowedChains = useGetChainSlugsByAccount();
  const fixedTokenSlug = useMemo((): string | undefined => {
    if (currentSymbol) {
      return Object.values(tokens).filter(value => value.slug === currentSymbol || value.symbol === currentSymbol)[0]
        ?.slug;
    } else {
      return undefined;
    }
  }, [currentSymbol, tokens]);

  const formConfig = useMemo((): FormControlConfig => {
    return {
      address: {
        name: 'address',
        value: '',
        require: true,
      },
      tokenSlug: {
        name: 'token',
        value: fixedTokenSlug || '',
      },
      service: {
        name: 'service',
        value: '' as SupportService,
      },
    };
  }, [fixedTokenSlug]);

  const { formState, onChangeValue } = useFormControl(formConfig, {
    onSubmitForm: () => {},
  });

  const getServiceItems = useCallback(
    (tokenSlug: string): ServiceItem[] => {
      const buyInfo = tokens[tokenSlug];
      const result: ServiceItem[] = [];

      for (const serviceItem of baseServiceItems) {
        const temp: ServiceItem = {
          ...serviceItem,
          disabled: buyInfo ? !buyInfo.services.includes(serviceItem.key) : true,
        };

        result.push(temp);
      }

      return result;
    },
    [tokens],
  );

  const isCloseByLockScreen = useRef(false);
  const isOpenInAppBrowser = useRef(false);
  const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));
  const serviceItems = useMemo(
    () => getServiceItems(formState.data.tokenSlug),
    [getServiceItems, formState.data.tokenSlug],
  );
  const disclaimerData = useMemo((): BuyServiceInfo => {
    return services[formState.data.service] || { name: '', url: '', contactUrl: '', policyUrl: '', termUrl: '' };
  }, [formState.data.service, services]);

  const accountBuyRef = useRef<ModalRef>();
  const tokenBuyRef = useRef<ModalRef>();
  const serviceBuyRef = useRef<ModalRef>();

  const accountAddressItems = useMemo(() => {
    const selectedTokenSlug = formState.data.tokenSlug;
    const chainSlug = selectedTokenSlug ? _getOriginChainOfAsset(selectedTokenSlug) : undefined;
    const chainInfo = chainSlug ? chainInfoMap[chainSlug] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
      ap.accounts.forEach(a => {
        const address = getReformatedAddressRelatedToChain(a, chainInfo);

        if (address) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address,
          });
        }
      });
    };

    if (currentAccountProxy && isAccountAll(currentAccountProxy.id)) {
      accountProxies.forEach(ap => {
        if (isAccountAll(ap.id)) {
          return;
        }

        updateResult(ap);
      });
    } else {
      currentAccountProxy && updateResult(currentAccountProxy);
    }

    return result;
  }, [accountProxies, chainInfoMap, currentAccountProxy, formState.data.tokenSlug]);

  const tokenItems = useMemo<TokenItemType[]>(() => {
    const result: TokenItemType[] = [];

    const convertToItem = (info: BuyTokenInfo): TokenItemType => {
      return {
        name: assetRegistry[info.slug]?.name || info.symbol,
        slug: info.slug,
        symbol: info.symbol,
        originChain: info.network,
      };
    };

    Object.values(tokens).forEach(item => {
      if (!allowedChains.includes(item.network)) {
        return;
      }

      if (!currentSymbol || item.slug === currentSymbol || item.symbol === currentSymbol) {
        result.push(convertToItem(item));
      }
    });

    return result;
  }, [allowedChains, assetRegistry, currentSymbol, tokens]);

  const isSupportBuyTokens = useMemo(() => {
    const selectedTokenSlug = formState.data.tokenSlug;
    const selectedAddress = formState.data.address;
    const selectedService = formState.data.service as SupportService;
    if (selectedService && selectedTokenSlug && selectedAddress) {
      const buyInfo = tokens[selectedTokenSlug];

      return (
        buyInfo &&
        buyInfo.services.includes(selectedService) &&
        tokenItems.find(item => item.slug === selectedTokenSlug)
      );
    }

    return false;
  }, [formState.data.tokenSlug, formState.data.address, formState.data.service, tokens, tokenItems]);

  const buyTokenSelectorItems = useMemo<TokenItemType[]>(() => {
    const raw = tokenItems.filter(item => {
      const chainAsset = assetRegistry[item.slug];

      return chainAsset ? _isAssetFungibleToken(chainAsset) : false;
    });

    raw.sort((a, b) => {
      return (
        convertChainActivePriority(chainStateMap[b.originChain]?.active) -
        convertChainActivePriority(chainStateMap[a.originChain]?.active)
      );
    });

    return raw;
  }, [assetRegistry, chainStateMap, tokenItems]);

  const openSelectBuyAccount = useCallback(
    (account: AccountAddressItemType) => {
      onChangeValue('address')(account.address);
    },
    [onChangeValue],
  );

  const openSelectBuyToken = useCallback(
    (item: TokenItemType) => {
      onChangeValue('tokenSlug')(item.slug);
      tokenBuyRef && tokenBuyRef.current?.onCloseModal();
    },
    [onChangeValue],
  );

  const onCloseSelectBuyAccount = useCallback(() => {
    accountBuyRef && accountBuyRef.current?.onCloseModal();
  }, []);

  const onCloseSelectBuyToken = useCallback(() => {
    tokenBuyRef && tokenBuyRef.current?.onCloseModal();
  }, []);

  const onCloseSelectBuyService = useCallback(() => {
    serviceBuyRef && serviceBuyRef.current?.onCloseModal();
  }, []);

  const onBuyToken = useCallback(
    async (currentUrl?: string) => {
      const selectedTokenSlug = formState.data.tokenSlug;
      const selectedAddress = formState.data.address;
      const selectedService = formState.data.service as SupportService;
      if (!selectedAddress || !selectedTokenSlug || !selectedService) {
        console.warn(
          'no: selectedBuyAccount || selectedBuyToken || selectedService',
          selectedAddress,
          selectedTokenSlug,
          selectedService,
        );
        return;
      }

      let urlPromise: CreateBuyOrderFunction | undefined;
      switch (selectedService) {
        case 'transak':
          urlPromise = createTransakOrder;
          break;
        case 'banxa':
          urlPromise = createBanxaOrder;
          break;
        case 'coinbase':
          urlPromise = createCoinbaseOrder;
          break;
      }
      if (!urlPromise) {
        console.warn('no urlPromise');
        return;
      }
      const buyInfo = tokens[selectedTokenSlug];
      const serviceInfo = buyInfo.serviceInfo[selectedService];
      if (!serviceInfo) {
        console.warn('no serviceInfo');
        return;
      }
      const { network: serviceNetwork, symbol } = serviceInfo;
      const { network } = buyInfo;
      const networkPrefix = chainInfoMap[network].substrateInfo?.addressPrefix;
      const walletAddress = reformatAddress(selectedAddress, networkPrefix === undefined ? -1 : networkPrefix);
      try {
        const url = await urlPromise(symbol, walletAddress, serviceNetwork, walletReference);
        if (Platform.OS === 'android' && selectedService === 'coinbase') {
          Linking.openURL(currentUrl || url);
        } else {
          if (await InAppBrowser.isAvailable()) {
            // A delay to change the StatusBar when the browser is opened
            isOpenInAppBrowser.current = true;
            await InAppBrowser.open(currentUrl || url, BrowserOptions);

            isOpenInAppBrowser.current = false;
          } else {
            Linking.openURL(currentUrl || url);
          }
        }
      } catch (error) {
        await sleep(50);
        const errorMessage = (error as Error).message || (error as string);
        console.log('error message for buy feature', errorMessage);
      }
    },
    [chainInfoMap, formState.data.address, formState.data.service, formState.data.tokenSlug, tokens, walletReference],
  );

  const onPressItem = (currentValue: SupportService) => {
    onChangeValue('service')(currentValue);
    serviceBuyRef?.current?.onCloseModal();
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      return;
    }
    if (isLocked && isOpenInAppBrowser.current) {
      isCloseByLockScreen.current = true;
      InAppBrowser.close();
      return;
    }
    if (!isOpenInAppBrowser.current && Platform.OS === 'ios' && isCloseByLockScreen.current) {
      setTimeout(() => onBuyToken(), 100);
      isCloseByLockScreen.current = false;
    }
  }, [isLocked, onBuyToken]);

  useEffect(() => {
    if (!fixedTokenSlug && tokenItems.length) {
      const tokenSlug = formState.data.tokenSlug;

      if (!tokenSlug) {
        onChangeValue('tokenSlug')(tokenItems[0].slug);
      } else {
        const isSelectedTokenInList = tokenItems.some(i => i.slug === tokenSlug);

        if (!isSelectedTokenInList) {
          onChangeValue('tokenSlug')(tokenItems[0].slug);
        }
      }
    } else if (fixedTokenSlug) {
      setTimeout(() => {
        onChangeValue('tokenSlug')(fixedTokenSlug);
      }, 100);
    }
  }, [fixedTokenSlug, formState.data.tokenSlug, onChangeValue, tokenItems]);

  useEffect(() => {
    formState.data.tokenSlug && checkAsset(formState.data.tokenSlug);
  }, [checkAsset, formState.data.tokenSlug]);

  useEffect(() => {
    const selectedAddress = formState.data.address;
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        if (!selectedAddress || accountAddressItems[0].address !== selectedAddress) {
          onChangeValue('address')(accountAddressItems[0].address);
        }
      } else {
        if (selectedAddress && !accountAddressItems.some(i => i.address === selectedAddress)) {
          onChangeValue('address')('');
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, formState.data.address, formState.data.service, formState.data.tokenSlug, onChangeValue]);

  useEffect(() => {
    const selectedTokenSlug = formState.data.tokenSlug;

    if (selectedTokenSlug) {
      const _services = getServiceItems(selectedTokenSlug);
      const filtered = _services.filter(service => !service.disabled);

      if (filtered.length > 1) {
        onChangeValue('service')('');
      } else {
        onChangeValue('service')(filtered[0]?.key || '');
      }
    }
  }, [getServiceItems, formState.data.tokenSlug, onChangeValue]);

  return {
    openSelectBuyAccount,
    openSelectBuyToken,
    onCloseSelectBuyAccount,
    onCloseSelectBuyToken,
    onCloseSelectBuyService,
    selectedBuyAccount: formState.data.address,
    selectedBuyToken: formState.data.tokenSlug,
    buyAccountSelectorItems: accountAddressItems,
    buyTokenSelectorItems: buyTokenSelectorItems,
    accountBuyRef,
    tokenBuyRef,
    serviceBuyRef,
    onBuyToken,
    onPressItem,
    selectedService: formState.data.service,
    serviceItems,
    disclaimerData,
    isSupportBuyTokens,
  };
}
