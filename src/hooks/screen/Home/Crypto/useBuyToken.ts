import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isAccountAll as checkIsAccountAll } from '@subwallet/extension-base/utils';
import { getAccountType } from 'utils/index';
import { getAccountTypeByTokenGroup } from 'hooks/screen/Home/Crypto/utils';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { findAccountByAddress } from 'utils/account';
import { PREDEFINED_TRANSAK_TOKEN } from '../../../../predefined/transak';
import { AccountType } from 'types/ui-types';
import { TokenItemType } from 'components/Modal/common/TokenSelector';

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
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const fixedTokenKey = currentSymbol ? PREDEFINED_TRANSAK_TOKEN[currentSymbol]?.slug : undefined;
  const [isBuyTokenSelectorModalVisible, setBuyTokenSelectorModalVisible] = useState<boolean>(false);
  const [isBuyAccountSelectorModalVisible, setBuyAccountSelectorModalVisible] = useState<boolean>(false);
  const [isBuyServiceSelectorModalVisible, setBuyServiceSelectorModalVisible] = useState<boolean>(false);
  const [{ selectedBuyAccount, selectedBuyToken }, setBuyTokenSelectedResult] = useState<BuyTokenSelectedResult>({
    selectedBuyAccount: isAllAccount ? undefined : currentAccount?.address,
    selectedBuyToken: fixedTokenKey || '',
  });

  const buyAccountSelectorItems = useMemo<AccountJson[]>(() => {
    if (!isAllAccount) {
      return [];
    }

    if (tokenGroupSlug) {
      const targetAccountType = getAccountTypeByTokenGroup(tokenGroupSlug, assetRegistryMap, chainInfoMap);
      if (targetAccountType === 'ALL') {
        return accounts.filter(a => !checkIsAccountAll(a.address));
      }
      return accounts.filter(a => getAccountType(a.address) === targetAccountType);
    }

    return accounts.filter(a => !checkIsAccountAll(a.address));
  }, [isAllAccount, tokenGroupSlug, accounts, assetRegistryMap, chainInfoMap]);

  const accountType = selectedBuyAccount ? getAccountType(selectedBuyAccount) : '';

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

  const actionWithSetTimeout = useCallback((action: () => void) => {
    setTimeout(action, HIDE_MODAL_DURATION);
  }, []);

  const onOpenBuyToken = useCallback(() => {
    if (!currentAccount) {
      return;
    }

    if (checkIsAccountAll(currentAccount.address)) {
      setBuyAccountSelectorModalVisible(true);
    } else {
      setBuyTokenSelectorModalVisible(true);
    }
  }, [currentAccount]);

  const openSelectBuyAccount = useCallback(
    (account: AccountJson) => {
      setBuyTokenSelectedResult({ selectedBuyAccount: account.address });
      setBuyAccountSelectorModalVisible(false);
      actionWithSetTimeout(() => {
        setBuyTokenSelectorModalVisible(true);
      });
    },
    [actionWithSetTimeout],
  );

  const openSelectBuyToken = useCallback(
    (item: TokenItemType) => {
      setBuyTokenSelectedResult(prevState => ({ ...prevState, selectedBuyToken: item.slug }));
      setBuyTokenSelectorModalVisible(false);
      actionWithSetTimeout(() => {
        setBuyServiceSelectorModalVisible(true);
      });
    },
    [actionWithSetTimeout],
  );

  const onCloseSelectBuyAccount = useCallback(() => {
    setBuyAccountSelectorModalVisible(false);
  }, []);

  const onCloseSelectBuyToken = useCallback(() => {
    setBuyTokenSelectorModalVisible(false);
  }, []);

  const onCloseSelectBuyService = useCallback(() => {
    setBuyServiceSelectorModalVisible(false);
  }, []);

  useEffect(() => {
    setBuyTokenSelectedResult(prev => ({
      ...prev,
      selectedAccount: currentAccount?.address,
    }));
  }, [currentAccount?.address]);

  return {
    isBuyTokenSelectorModalVisible,
    isBuyAccountSelectorModalVisible,
    isBuyServiceSelectorModalVisible,
    onOpenBuyToken,
    openSelectBuyAccount,
    openSelectBuyToken,
    onCloseSelectBuyAccount,
    onCloseSelectBuyToken,
    onCloseSelectBuyService,
    selectedBuyAccount,
    selectedBuyToken,
    buyAccountSelectorItems,
    buyTokenSelectorItems,
  };
}
