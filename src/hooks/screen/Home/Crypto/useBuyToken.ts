import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isAccountAll as checkIsAccountAll } from '@subwallet/extension-base/utils';
import { getAccountType } from 'utils/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { findAccountByAddress } from 'utils/account';
import { PREDEFINED_TRANSAK_TOKEN } from '../../../../predefined/transak';
import { AccountType } from 'types/ui-types';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ColorMap } from 'styles/color';
import { Linking } from 'react-native';
import i18n from 'utils/i18n/i18n';
import ToastContainer from 'react-native-toast-notifications';

type BuyTokenSelectedResult = {
  selectedBuyAccount?: string;
  selectedBuyToken?: string;
};

const getTokenItems = (accountType: AccountType, ledgerNetwork?: string): TokenItemType[] => {
  const result: TokenItemType[] = [];

  Object.values(PREDEFINED_TRANSAK_TOKEN).forEach(info => {
    if (ledgerNetwork) {
      if (info.chain === ledgerNetwork) {
        result.push({
          name: info.symbol,
          slug: info.slug,
          symbol: info.symbol,
          originChain: info.chain,
        });
      }
    } else {
      if (accountType === 'ALL' || accountType === info.support) {
        result.push({
          name: info.symbol,
          slug: info.slug,
          symbol: info.symbol,
          originChain: info.chain,
        });
      }
    }
  });

  return result;
};

export default function useBuyToken(tokenGroupSlug?: string, currentSymbol?: string) {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const fixedTokenKey = currentSymbol ? PREDEFINED_TRANSAK_TOKEN[currentSymbol]?.slug : undefined;
  const [{ selectedBuyAccount, selectedBuyToken }, setBuyTokenSelectedResult] = useState<BuyTokenSelectedResult>({
    selectedBuyAccount: isAllAccount ? undefined : currentAccount?.address,
    selectedBuyToken: fixedTokenKey || '',
  });
  const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));
  const [{ selectedService, isOpenInAppBrowser, serviceUrl }, setSelectedService] = useState<{
    selectedService: string | undefined;
    isOpenInAppBrowser: boolean;
    serviceUrl: string;
  }>({ selectedService: undefined, isOpenInAppBrowser: false, serviceUrl: '' });

  const toastRef = useRef<ToastContainer>(null);
  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text, { type: 'danger' });
    }
  }, []);

  const accountBuyRef = useRef<ModalRef>();
  const tokenBuyRef = useRef<ModalRef>();
  const serviceBuyRef = useRef<ModalRef>();

  const buyAccountSelectorItems = useMemo<AccountJson[]>(() => {
    if (!isAllAccount) {
      return [];
    }

    if (currentSymbol) {
      const currentAccountType = PREDEFINED_TRANSAK_TOKEN[currentSymbol].support;
      return accounts.filter(a => getAccountType(a.address) === currentAccountType);
    }

    return accounts.filter(a => !checkIsAccountAll(a.address));
  }, [isAllAccount, currentSymbol, accounts]);

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
    if (fixedTokenKey) {
      return getTokenItems('ALL', ledgerNetwork);
    }

    if (!accountType) {
      return [];
    }

    return getTokenItems(accountType, ledgerNetwork);
  }, [accountType, fixedTokenKey, ledgerNetwork]);

  const openSelectBuyAccount = useCallback((account: AccountJson) => {
    setBuyTokenSelectedResult({ selectedBuyAccount: account.address });
  }, []);

  const openSelectBuyToken = useCallback((item: TokenItemType) => {
    setBuyTokenSelectedResult(prevState => ({ ...prevState, selectedBuyToken: item.slug }));
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
      try {
        if (await InAppBrowser.isAvailable()) {
          // A delay to change the StatusBar when the browser is opened
          await InAppBrowser.open(currentUrl || serviceUrl, {
            // iOS Properties
            dismissButtonStyle: 'done',
            preferredBarTintColor: ColorMap.dark1,
            preferredControlTintColor: ColorMap.light,
            readerMode: true,
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
          // A delay to show an alert when the browser is closed
          // await sleep(800);
          // if (result.type === 'cancel') {
          //   InAppBrowser.close();
          // }
          setSelectedService(prevState => ({
            ...prevState,
            isOpenInAppBrowser: false,
          }));
        } else {
          Linking.openURL(currentUrl || serviceUrl);
        }
      } catch (error) {
        await sleep(50);
        const errorMessage = (error as Error).message || (error as string);
        console.log('error message for buy feature', errorMessage);
      }
    },
    [serviceUrl],
  );

  const onPressItem = (currentValue: string, currentUrl: string) => {
    setSelectedService({ selectedService: currentValue, isOpenInAppBrowser: true, serviceUrl: currentUrl });
    if (currentUrl) {
      serviceBuyRef?.current?.onCloseModal();
    } else {
      if (currentValue === 'transak') {
        show(i18n.common.unsupportedToken);
      }
    }
  };

  useEffect(() => {
    setBuyTokenSelectedResult(prev => ({
      ...prev,
      selectedAccount: currentAccount?.address,
    }));
  }, [currentAccount?.address]);

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
    isOpenInAppBrowser,
    serviceUrl,
  };
}
