import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { getAccountType } from 'utils/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { findAccountByAddress } from 'utils/account';
import { AccountType } from 'types/ui-types';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Linking, Platform } from 'react-native';
import { ServiceItem, baseServiceItems } from 'screens/Home/Crypto/ServiceModal';
import { BuyServiceInfo, BuyTokenInfo, CreateBuyOrderFunction, SupportService } from 'types/buy';
import { BrowserOptions, createBanxaOrder, createCoinbaseOrder, createTransakOrder } from 'utils/buy';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import useAppLock from 'hooks/useAppLock';
import { _isAssetFungibleToken } from '@subwallet/extension-base/services/chain-service/utils';

type BuyTokenSelectedResult = {
  selectedBuyAccount?: string;
  selectedBuyToken?: string;
};

const convertChainActivePriority = (active?: boolean) => (active ? 1 : 0);

export default function useBuyToken(currentSymbol?: string) {
  const { accounts, isAllAccount, currentAccount } = useSelector((state: RootState) => state.accountState);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { isLocked } = useAppLock();
  const { walletReference } = useSelector((state: RootState) => state.settings);
  const { chainInfoMap, chainStateMap } = useSelector((state: RootState) => state.chainStore);
  const { services, tokens } = useSelector((state: RootState) => state.buyService);
  const fixedTokenKey = useMemo((): string | undefined => {
    if (currentSymbol) {
      return Object.values(tokens).filter(value => value.slug === currentSymbol || value.symbol === currentSymbol)[0]
        ?.slug;
    } else {
      return undefined;
    }
  }, [currentSymbol, tokens]);
  const [{ selectedBuyAccount, selectedBuyToken }, setBuyTokenSelectedResult] = useState<BuyTokenSelectedResult>({
    selectedBuyAccount: isAllAccount ? undefined : currentAccount?.address,
    selectedBuyToken: fixedTokenKey || '',
  });
  const [{ selectedService }, setSelectedService] = useState<{ selectedService: SupportService | undefined }>({
    selectedService: undefined,
  });

  const getServiceItems = useCallback(
    (tokenSlug: string | undefined): ServiceItem[] => {
      if (!tokenSlug) {
        return [];
      }
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
  const serviceItems = useMemo(() => getServiceItems(selectedBuyToken), [getServiceItems, selectedBuyToken]);
  const disclaimerData = useMemo((): BuyServiceInfo => {
    if (!selectedService) {
      return { name: '', url: '', contactUrl: '', policyUrl: '', termUrl: '' };
    }
    return services[selectedService] || { name: '', url: '', contactUrl: '', policyUrl: '', termUrl: '' };
  }, [selectedService, services]);

  const accountBuyRef = useRef<ModalRef>();
  const tokenBuyRef = useRef<ModalRef>();
  const serviceBuyRef = useRef<ModalRef>();

  const filterAccountType = useMemo((): AccountType => {
    if (currentSymbol) {
      let result: AccountType = '' as AccountType;

      const list = Object.values(tokens).filter(
        value => value.slug === currentSymbol || value.symbol === currentSymbol,
      );

      list.forEach(info => {
        if (result) {
          if (result !== info.support) {
            if (result === 'SUBSTRATE' || result === 'ETHEREUM') {
              result = 'ALL';
            }
          }
        } else {
          result = info.support;
        }
      });

      return result;
    } else {
      return 'ALL';
    }
  }, [currentSymbol, tokens]);

  const accountsFilter = useCallback(
    (account: AccountJson) => {
      if (isAccountAll(account.address)) {
        return false;
      }

      if (filterAccountType !== 'ALL') {
        if (filterAccountType === 'ETHEREUM') {
          return isEthereumAddress(account.address);
        } else {
          return !isEthereumAddress(account.address);
        }
      }

      return true;
    },
    [filterAccountType],
  );
  const buyAccountSelectorItems = useMemo<AccountJson[]>(() => {
    return accounts.filter(accountsFilter);
  }, [accounts, accountsFilter]);

  const accountType = useMemo(
    () => (selectedBuyAccount ? getAccountType(selectedBuyAccount) : ''),
    [selectedBuyAccount],
  );

  const ledgerNetwork = useMemo((): string | undefined => {
    const account = findAccountByAddress(accounts, selectedBuyAccount);

    if (account?.originGenesisHash) {
      return findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash)?.slug;
    }

    return undefined;
  }, [accounts, chainInfoMap, selectedBuyAccount]);

  const tokenItems = useMemo<TokenItemType[]>(() => {
    const result: TokenItemType[] = [];

    const list = [...Object.values(tokens)];

    const filtered = currentSymbol
      ? list.filter(value => value.slug === currentSymbol || value.symbol === currentSymbol)
      : list;

    const convertToItem = (info: BuyTokenInfo): TokenItemType => {
      return {
        name: assetRegistry[info.slug]?.name || info.symbol,
        slug: info.slug,
        symbol: info.symbol,
        originChain: info.network,
      };
    };

    filtered.forEach(info => {
      const item = convertToItem(info);

      if (ledgerNetwork) {
        if (info.network === ledgerNetwork) {
          result.push(item);
        }
      } else {
        if (accountType === 'ALL' || accountType === info.support) {
          result.push(item);
        }
      }
    });

    return result;
  }, [accountType, assetRegistry, currentSymbol, ledgerNetwork, tokens]);

  const isSupportBuyTokens = useMemo(() => {
    if (selectedService && selectedBuyAccount && selectedBuyToken) {
      const buyInfo = tokens[selectedBuyToken];
      const _accountType = getAccountType(selectedBuyAccount);

      return (
        buyInfo &&
        buyInfo.support === _accountType &&
        buyInfo.services.includes(selectedService) &&
        tokenItems.find(item => item.slug === selectedBuyToken)
      );
    }

    return false;
  }, [selectedService, selectedBuyAccount, selectedBuyToken, tokens, tokenItems]);

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

  const openSelectBuyAccount = useCallback((account: AccountJson) => {
    setSelectedService({ selectedService: undefined });
    setBuyTokenSelectedResult({ selectedBuyAccount: account.address });
  }, []);

  const openSelectBuyToken = useCallback((item: TokenItemType) => {
    setBuyTokenSelectedResult(prevState => ({ ...prevState, selectedBuyToken: item.slug }));
    setSelectedService({ selectedService: undefined });
    tokenBuyRef && tokenBuyRef.current?.onCloseModal();
  }, []);

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
      if (!selectedBuyAccount || !selectedBuyToken || !selectedService) {
        console.warn(
          'no: selectedBuyAccount || selectedBuyToken || selectedService',
          selectedBuyAccount,
          selectedBuyToken,
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
      const buyInfo = tokens[selectedBuyToken];
      const serviceInfo = buyInfo.serviceInfo[selectedService];
      if (!serviceInfo) {
        console.warn('no serviceInfo');
        return;
      }
      const { network: serviceNetwork, symbol } = serviceInfo;
      const { network } = buyInfo;
      const networkPrefix = chainInfoMap[network].substrateInfo?.addressPrefix;
      const walletAddress = reformatAddress(selectedBuyAccount, networkPrefix === undefined ? -1 : networkPrefix);
      try {
        const url = await urlPromise(symbol, walletAddress, serviceNetwork, walletReference);
        if (await InAppBrowser.isAvailable()) {
          // A delay to change the StatusBar when the browser is opened
          isOpenInAppBrowser.current = true;
          await InAppBrowser.open(currentUrl || url, BrowserOptions);

          isOpenInAppBrowser.current = false;
        } else {
          Linking.openURL(currentUrl || url);
        }
      } catch (error) {
        await sleep(50);
        const errorMessage = (error as Error).message || (error as string);
        console.log('error message for buy feature', errorMessage);
      }
    },
    [chainInfoMap, selectedBuyAccount, selectedBuyToken, selectedService, tokens, walletReference],
  );

  const onPressItem = (currentValue: SupportService) => {
    setSelectedService({ selectedService: currentValue });
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
    setBuyTokenSelectedResult(prev => ({
      ...prev,
      selectedAccount: currentAccount?.address,
    }));
  }, [currentAccount?.address]);

  useEffect(() => {
    if (serviceItems.length) {
      const supportedSevices = serviceItems.filter(service => !service.disabled);
      if (!supportedSevices.length) {
        return;
      }

      if (supportedSevices.length === 1) {
        setSelectedService({ selectedService: supportedSevices[0].key });
      }
    }
  }, [selectedBuyToken, selectedService, serviceItems]);
  useEffect(() => {
    if (buyTokenSelectorItems.length) {
      if (!fixedTokenKey) {
        setBuyTokenSelectedResult(prevState => ({ ...prevState, selectedBuyToken: buyTokenSelectorItems[0].slug }));
      } else {
        const isSelectedTokenInList = buyTokenSelectorItems.some(i => i.slug === fixedTokenKey);

        if (!isSelectedTokenInList) {
          setBuyTokenSelectedResult(prevState => ({ ...prevState, selectedBuyToken: buyTokenSelectorItems[0].slug }));
        } else {
          setBuyTokenSelectedResult(prevState => ({ ...prevState, selectedBuyToken: fixedTokenKey }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenSelectorItems.toString(), fixedTokenKey]);

  return {
    openSelectBuyAccount,
    openSelectBuyToken,
    onCloseSelectBuyAccount,
    onCloseSelectBuyToken,
    onCloseSelectBuyService,
    selectedBuyAccount,
    selectedBuyToken,
    buyAccountSelectorItems,
    buyTokenSelectorItems,
    accountBuyRef,
    tokenBuyRef,
    serviceBuyRef,
    onBuyToken,
    onPressItem,
    selectedService,
    serviceItems,
    disclaimerData,
    isSupportBuyTokens,
  };
}
