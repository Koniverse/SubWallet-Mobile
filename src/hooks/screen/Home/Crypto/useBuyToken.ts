import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { getAccountType } from 'utils/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { findAccountByAddress } from 'utils/account';
import { BUY_SERVICE_CONTACTS, LIST_PREDEFINED_BUY_TOKEN, MAP_PREDEFINED_BUY_TOKEN } from 'constants/buy';
import { AccountType } from 'types/ui-types';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ColorMap } from 'styles/color';
import { Linking, Platform } from 'react-native';
import { ServiceItem, baseServiceItems } from 'screens/Home/Crypto/ServiceModal';
import { BuyServiceInfo, CreateBuyOrderFunction, SupportService } from 'types/buy';
import { createBanxaOrder, createCoinbaseOrder, createTransakOrder } from 'utils/buy';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import useAppLock from 'hooks/useAppLock';

type BuyTokenSelectedResult = {
  selectedBuyAccount?: string;
  selectedBuyToken?: string;
};

const getServiceItems = (tokenSlug: string | undefined): ServiceItem[] => {
  if (!tokenSlug) {
    return [];
  }
  const buyInfo = MAP_PREDEFINED_BUY_TOKEN[tokenSlug];
  const result: ServiceItem[] = [];

  for (const serviceItem of baseServiceItems) {
    const temp: ServiceItem = {
      ...serviceItem,
      disabled: buyInfo ? !buyInfo.services.includes(serviceItem.key) : true,
    };

    result.push(temp);
  }

  return result;
};

export default function useBuyToken(currentSymbol?: string) {
  const { accounts, isAllAccount, currentAccount } = useSelector((state: RootState) => state.accountState);
  const { isLocked } = useAppLock();
  const { walletReference } = useSelector((state: RootState) => state.settings);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const fixedTokenKey = useMemo((): string | undefined => {
    if (currentSymbol) {
      return LIST_PREDEFINED_BUY_TOKEN.filter(
        value => value.slug === currentSymbol || value.symbol === currentSymbol,
      )[0]?.slug;
    } else {
      return undefined;
    }
  }, [currentSymbol]);
  const [{ selectedBuyAccount, selectedBuyToken }, setBuyTokenSelectedResult] = useState<BuyTokenSelectedResult>({
    selectedBuyAccount: isAllAccount ? undefined : currentAccount?.address,
    selectedBuyToken: fixedTokenKey || '',
  });
  const [{ selectedService }, setSelectedService] = useState<{ selectedService: SupportService | undefined }>({
    selectedService: undefined,
  });
  const isCloseByLockScreen = useRef(false);
  const isOpenInAppBrowser = useRef(false);
  const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));
  const serviceItems = useMemo(() => getServiceItems(selectedBuyToken), [selectedBuyToken]);
  const disclaimerData = useMemo((): BuyServiceInfo => {
    if (!selectedService) {
      return { name: '', url: '', contactUrl: '', policyUrl: '', termUrl: '' };
    }
    return BUY_SERVICE_CONTACTS[selectedService] || { name: '', url: '', contactUrl: '', policyUrl: '', termUrl: '' };
  }, [selectedService]);

  const accountBuyRef = useRef<ModalRef>();
  const tokenBuyRef = useRef<ModalRef>();
  const serviceBuyRef = useRef<ModalRef>();

  const filterAccountType = useMemo((): AccountType => {
    if (currentSymbol) {
      let result: AccountType = '' as AccountType;

      const list = LIST_PREDEFINED_BUY_TOKEN.filter(
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
  }, [currentSymbol]);

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

  const buyTokenSelectorItems = useMemo<TokenItemType[]>(() => {
    const result: TokenItemType[] = [];

    const list = [...LIST_PREDEFINED_BUY_TOKEN];

    const filtered = currentSymbol
      ? list.filter(value => value.slug === currentSymbol || value.symbol === currentSymbol)
      : list;

    filtered.forEach(info => {
      if (ledgerNetwork) {
        if (info.network === ledgerNetwork) {
          result.push({
            name: info.symbol,
            slug: info.slug,
            symbol: info.symbol,
            originChain: info.network,
          });
        }
      } else {
        if (accountType === 'ALL' || accountType === info.support) {
          result.push({
            name: info.symbol,
            slug: info.slug,
            symbol: info.symbol,
            originChain: info.network,
          });
        }
      }
    });

    return result;
  }, [accountType, currentSymbol, ledgerNetwork]);

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
    async (currentUrl?: string, animated = true) => {
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
      const buyInfo = MAP_PREDEFINED_BUY_TOKEN[selectedBuyToken];
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
          await InAppBrowser.open(currentUrl || url, {
            // iOS Properties
            dismissButtonStyle: 'done',
            preferredBarTintColor: ColorMap.dark1,
            preferredControlTintColor: ColorMap.light,
            animated,
            modalEnabled: true,
            enableBarCollapsing: false,
            // Android Properties
            showTitle: true,
            toolbarColor: ColorMap.dark1,
            secondaryToolbarColor: ColorMap.dark1,
            navigationBarColor: ColorMap.dark1,
            navigationBarDividerColor: 'white',
            enableUrlBarHiding: true,
            enableDefaultShare: true,
            forceCloseOnRedirection: false,
            // Specify full animation resource identifier(package:anim/name)
            // or only resource name(in case of animation bundled with app).
            animations: {
              startEnter: 'slide_in_right',
              startExit: 'slide_out_left',
              endEnter: 'slide_in_left',
              endExit: 'slide_out_right',
            },
            headers: {
              'my-custom-header': 'my custom header value',
            },
            hasBackButton: true,
            browserPackage: undefined,
            showInRecents: true,
            includeReferrer: true,
          });

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
    [chainInfoMap, selectedBuyAccount, selectedBuyToken, selectedService, walletReference],
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
  }, [buyTokenSelectorItems, fixedTokenKey]);

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
  };
}
