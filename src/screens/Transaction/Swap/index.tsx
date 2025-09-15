import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { mmkvStore } from 'utils/storage';
import { SwapTermOfServiceModal } from 'components/Modal/TermModal/parts/SwapTermOfServiceModal';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { SwapFromField } from 'components/Swap/SwapFromField';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenSelectorItemType } from 'components/Modal/common/TokenSelector';
import { _ChainAsset, _ChainStatus } from '@subwallet/chain-list/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getMultiChainAsset,
  _getOriginChainOfAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
  _parseAssetRefKey,
} from '@subwallet/extension-base/services/chain-service/utils';
import { Alert, AppState, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { SwapToField } from 'components/Swap/SwapToField';
import BigN from 'bignumber.js';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { ModalRef } from 'types/modalRef';
import { isAccountAll } from 'utils/accountAll';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AddressInputRef, InputAddress } from 'components/Input/InputAddress';
import i18n from 'utils/i18n/i18n';
import { Button, Icon, PageIcon } from 'components/design-system-ui';
import { ArrowsDownUp, Book, Warning } from 'phosphor-react-native';
import { SlippageModal } from 'components/Modal/Swap/SlippageModal';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';
import { ChooseFeeTokenModal } from 'components/Modal/Swap/ChooseFeeTokenModal';
import { SwapQuotesSelectorModal } from 'components/Modal/Swap/SwapQuotesSelectorModal';
import {
  SIMPLE_SWAP_SLIPPAGE,
  SlippageType,
  SwapFeeType,
  SwapProviderId,
  SwapQuote,
  SwapRequest,
  SwapRequestResult,
  SwapRequestV2,
} from '@subwallet/extension-base/types/swap';
import { CommonOptimalSwapPath } from '@subwallet/extension-base/types/service-base';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { findAccountByAddress } from 'utils/account';
import { handleSwapStep, validateSwapProcess } from 'messaging/swap';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from 'reducers/transaction-process';
import { FormItem } from 'components/common/FormItem';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useToast } from 'react-native-toast-notifications';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import useChainChecker from 'hooks/chain/useChainChecker';
import { getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import UserInactivity from 'react-native-user-inactivity';
import { SwapIdleWarningModal } from 'components/Modal/Swap/SwapIdleWarningModal';
import { SendFundProps } from 'routes/transaction/transactionAction';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import useHandleSubmitMultiTransaction from 'hooks/transaction/useHandleSubmitMultiTransaction';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountAddressItemType } from 'types/account';
import { AccountProxy, AccountProxyType, ProcessType } from '@subwallet/extension-base/types';
import { isTokenCompatibleWithAccountChainTypes } from 'utils/chainAndAsset';
import { getChainsByAccountAll } from 'utils/index';
import { isChainInfoAccordantAccountChainType } from 'utils/chain';
import { validateRecipientAddress } from 'utils/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { CHAINFLIP_SLIPPAGE } from 'types/swap';
import { handleSwapRequestV2, submitProcess } from 'messaging/index';
import useOneSignProcess from 'hooks/account/useOneSignProcess';
import { getId } from '@subwallet/extension-base/utils/getId';
import useReformatAddress from 'hooks/common/useReformatAddress';
import { SortableTokenItem, sortTokensByBalanceInSelector } from 'utils/sort/token';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { TokenBalanceItemType } from 'types/balance';
import { useGetAccountTokenBalance, useGetBalance } from 'hooks/balance';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';
import { FontSemiBold } from 'styles/sharedStyles';
import { QuoteInfoArea } from './QuoteInfoArea';
import { AcrossErrorMsg } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { ThemeTypes } from 'styles/themes';
import { AppModalContext } from 'providers/AppModalContext';
import { KyberSwapQuoteMetadata } from '@subwallet/extension-base/services/swap-service/handler/kyber-handler';

interface SwapFormValues extends TransactionFormValues {
  fromAmount: string;
  fromTokenSlug: string;
  toTokenSlug: string;
  recipient?: string;
}

type ComponentProps = {
  targetAccountProxy: AccountProxy;
  defaultSlug?: string;
};

function getTokenSelectorItem(
  assetItem: _ChainAsset[],
  tokenBalanceMap: Record<string, TokenBalanceItemType | undefined>,
  chainState: Record<string, _ChainState>,
): SortableTokenSelectorItemType[] {
  const result: SortableTokenSelectorItemType[] = [];

  assetItem.forEach(asset => {
    const slug = asset.slug;
    const originChain = asset.originChain;

    const balanceInfo = (() => {
      if (!chainState[originChain]?.active) {
        return undefined;
      }

      const tokenBalanceInfo = tokenBalanceMap[slug];

      if (!tokenBalanceInfo) {
        return undefined;
      }

      return {
        isReady: tokenBalanceInfo.isReady,
        isNotSupport: tokenBalanceInfo.isNotSupport,
        free: tokenBalanceInfo.free,
        locked: tokenBalanceInfo.locked,
        total: tokenBalanceInfo.total,
        currency: tokenBalanceInfo.currency,
        isTestnet: tokenBalanceInfo.isTestnet,
      };
    })();

    result.push({
      originChain,
      slug,
      symbol: asset.symbol,
      name: asset.name,
      balanceInfo,
      showBalance: true,
      total: balanceInfo?.isReady && !balanceInfo?.isNotSupport ? balanceInfo?.free : undefined,
    });
  });

  return result;
}

export interface FeeItem {
  value: BigN;
  type: SwapFeeType;
  label: string;
  prefix?: string;
  suffix?: string;
}

type SortableTokenSelectorItemType = TokenSelectorItemType & SortableTokenItem;

const Component = ({ targetAccountProxy, defaultSlug }: ComponentProps) => {
  const { show, hideAll } = useToast();
  const theme = useSubWalletTheme().swThemes;
  const { confirmModal } = useContext(AppModalContext);
  const styles = createStyles(theme);
  const { assetRegistry: assetRegistryMap } = useSelector((state: RootState) => state.assetRegistry);
  const priorityTokens = useSelector((state: RootState) => state.chainStore.priorityTokens);
  const { chainInfoMap, chainStateMap, ledgerGenericAllowNetworks } = useSelector(
    (state: RootState) => state.chainStore,
  );
  const { accountProxies, accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const hasInternalConfirmations = useSelector((state: RootState) => state.requestState.hasInternalConfirmations);
  const { priceMap } = useSelector((state: RootState) => state.price);
  const swapPairs = useSelector((state: RootState) => state.swap.swapPairs);
  const confirmTerm = mmkvStore.getBoolean('confirm-swap-term');
  const [termModalVisible, setTermModalVisible] = useState<boolean>(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [swapFromFieldRenderKey, setSwapFromFieldRenderKey] = useState<string>('SwapFromField');

  const {
    title,
    form: {
      control,
      setValue,
      trigger,
      handleSubmit,
      formState: { errors },
    },
    onChangeFromValue: setFrom,
    onChangeChainValue: setChain,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<SwapFormValues>('swap', {
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });
  let addressInputRef = useRef<AddressInputRef>(null);
  const isAddressInputReady = !!addressInputRef.current?.ready;
  const fromValue = useWatch<SwapFormValues>({ name: 'from', control });
  const fromAmountValue = useWatch<SwapFormValues>({ name: 'fromAmount', control });
  const fromTokenSlugValue = useWatch<SwapFormValues>({ name: 'fromTokenSlug', control });
  const toTokenSlugValue = useWatch<SwapFormValues>({ name: 'toTokenSlug', control });
  const chainValue = useWatch<SwapFormValues>({ name: 'chain', control });
  const recipientValue = useWatch<SwapFormValues>({ name: 'recipient', control });
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const accountInfo = useGetAccountByAddress(fromValue);
  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);
  const { onError, onSuccess } = useHandleSubmitMultiTransaction(
    onDone,
    setTransactionDone,
    dispatchProcessState,
    undefined,
    undefined,
    ProcessType.SWAP,
  );
  const onPreCheck = usePreCheckAction(fromValue);
  const oneSign = useOneSignProcess(fromValue);
  const getReformatAddress = useReformatAddress();
  const accountSelectorRef = useRef<ModalRef>();
  const [showQuoteArea, setShowQuoteArea] = useState<boolean>(false);
  const [quoteOptions, setQuoteOptions] = useState<SwapQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(undefined);
  const [quoteAliveUntil, setQuoteAliveUntil] = useState<number | undefined>(undefined);
  const [currentQuoteRequest, setCurrentQuoteRequest] = useState<SwapRequest | undefined>(undefined);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [currentOptimalSwapPath, setOptimalSwapPath] = useState<CommonOptimalSwapPath | undefined>(undefined);
  const [slippageModalVisible, setSlippageModalVisible] = useState<boolean>(false);
  const [chooseFeeModalVisible, setChooseFeeModalVisible] = useState<boolean>(false);
  const [warningIdleModalVisible, setWarningIdleModalVisible] = useState<boolean>(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const [swapQuoteSelectorModalVisible, setSwapQuoteSelectorModalVisible] = useState<boolean>(false);
  const [currentSlippage, setCurrentSlippage] = useState<any>({
    slippage: new BigN(0.01),
    isCustomType: true,
  });
  const [preferredProvider, setPreferredProvider] = useState<SwapProviderId | undefined>(undefined);
  const [handleRequestLoading, setHandleRequestLoading] = useState(true);
  const [swapError, setSwapError] = useState<SwapError | undefined>(undefined);
  const [feeOptions, setFeeOptions] = useState<string[] | undefined>([]);
  const [currentFeeOption, setCurrentFeeOption] = useState<string | undefined>(undefined);
  const [requestUserInteractToContinue, setRequestUserInteractToContinue] = useState<boolean>(false);
  const continueRefreshQuoteRef = useRef<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState<boolean>(false);
  const [isRecipientFieldManuallyVisible, setIsRecipientFieldManuallyVisible] = useState<boolean>(false);

  const availableBalanceHookResult = useGetBalance(chainValue, fromValue, fromTokenSlugValue, true, ExtrinsicType.SWAP);

  const currentFromTokenAvailableBalance = useMemo(() => {
    if (!fromTokenSlugValue || availableBalanceHookResult.isLoading || !availableBalanceHookResult.nativeTokenSlug) {
      return undefined;
    }

    if (availableBalanceHookResult.nativeTokenSlug !== fromTokenSlugValue) {
      return availableBalanceHookResult.tokenBalance;
    }

    return availableBalanceHookResult.nativeTokenBalance;
  }, [
    availableBalanceHookResult.isLoading,
    availableBalanceHookResult.nativeTokenBalance,
    availableBalanceHookResult.nativeTokenSlug,
    availableBalanceHookResult.tokenBalance,
    fromTokenSlugValue,
  ]);

  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    accountProxies.forEach(ap => {
      if (!(isAccountAll(targetAccountProxy.id) || ap.id === targetAccountProxy.id)) {
        return;
      }

      if ([AccountProxyType.READ_ONLY, AccountProxyType.LEDGER].includes(ap.accountType)) {
        return;
      }

      ap.accounts.forEach(a => {
        const address = getReformatAddress(a, chainInfo);

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
    });

    return result;
  }, [accountProxies, chainInfoMap, chainValue, targetAccountProxy, getReformatAddress]);

  const assetItems = useMemo<_ChainAsset[]>(() => {
    const result: _ChainAsset[] = [];

    Object.values(assetRegistryMap).forEach(chainAsset => {
      if (!_isAssetFungibleToken(chainAsset)) {
        return;
      }

      const chainSlug = chainAsset.originChain;

      if (chainInfoMap[chainSlug]?.chainStatus === _ChainStatus.ACTIVE) {
        result.push(chainAsset);
      }
    });

    return result;
  }, [assetRegistryMap, chainInfoMap]);

  const getAccountTokenBalance = useGetAccountTokenBalance();

  const targetAccountProxyIdForGetBalance = useMemo(() => {
    if (!isAccountAll(targetAccountProxy.id) || !fromValue) {
      return targetAccountProxy.id;
    }

    const accountProxyByFromValue = accountAddressItems.find(a => a.address === fromValue);

    return accountProxyByFromValue?.accountProxyId || targetAccountProxy.id;
  }, [accountAddressItems, fromValue, targetAccountProxy]);

  const tokenSelectorItems = useMemo<TokenSelectorItemType[]>(() => {
    const result = getTokenSelectorItem(
      assetItems,
      getAccountTokenBalance(assetItems, targetAccountProxyIdForGetBalance),
      chainStateMap,
    );

    sortTokensByBalanceInSelector(result, priorityTokens);

    return result;
  }, [assetItems, chainStateMap, getAccountTokenBalance, priorityTokens, targetAccountProxyIdForGetBalance]);

  const fromTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    const allowChainSlugs = isAccountAll(targetAccountProxy.id)
      ? getChainsByAccountAll(targetAccountProxy, accountProxies, chainInfoMap)
      : undefined;

    return tokenSelectorItems.filter(item => {
      const slug = item.slug;
      const assetInfo = assetRegistryMap[slug];

      if (!assetInfo) {
        return false;
      }

      if (allowChainSlugs && !allowChainSlugs.includes(assetInfo.originChain)) {
        return false;
      }

      if (!isTokenCompatibleWithAccountChainTypes(slug, targetAccountProxy.chainTypes, chainInfoMap)) {
        return false;
      }

      if (!defaultSlug) {
        return true;
      }

      return defaultSlug === slug || _getMultiChainAsset(assetInfo) === defaultSlug;
    });
  }, [accountProxies, assetRegistryMap, chainInfoMap, defaultSlug, targetAccountProxy, tokenSelectorItems]);

  const toTokenItems = useMemo(() => {
    return tokenSelectorItems.filter(item => item.slug !== fromTokenSlugValue);
  }, [fromTokenSlugValue, tokenSelectorItems]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[fromTokenSlugValue] || undefined;
  }, [assetRegistryMap, fromTokenSlugValue]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[toTokenSlugValue] || undefined;
  }, [assetRegistryMap, toTokenSlugValue]);

  const destChainValue = _getAssetOriginChain(toAssetInfo);

  const isSwitchable = useMemo(() => {
    if (!toTokenSlugValue) {
      return false;
    }

    return isTokenCompatibleWithAccountChainTypes(toTokenSlugValue, targetAccountProxy.chainTypes, chainInfoMap);
  }, [chainInfoMap, targetAccountProxy.chainTypes, toTokenSlugValue]);

  // Unable to use useEffect due to infinity loop caused by conflict setCurrentSlippage and currentQuote
  const slippage = useMemo(() => {
    const providerId = currentQuote?.provider?.id;
    const slippageMap = {
      [SwapProviderId.CHAIN_FLIP_MAINNET]: CHAINFLIP_SLIPPAGE,
      [SwapProviderId.CHAIN_FLIP_TESTNET]: CHAINFLIP_SLIPPAGE,
      [SwapProviderId.SIMPLE_SWAP]: SIMPLE_SWAP_SLIPPAGE,
    };

    return providerId && providerId in slippageMap
      ? slippageMap[providerId as keyof typeof slippageMap]
      : currentSlippage.slippage.toNumber();
  }, [currentQuote?.provider?.id, currentSlippage.slippage]);

  const isNotShowAccountSelector = !isAllAccount && accountAddressItems.length < 2;

  const isRecipientFieldAllowed = useMemo(() => {
    if (!fromValue || !destChainValue || !chainInfoMap[destChainValue]) {
      return false;
    }

    // todo: convert this find logic to util
    const fromAccountJson = accounts.find(account => isSameAddress(account.address, fromValue));

    if (!fromAccountJson) {
      return false;
    }

    return !isChainInfoAccordantAccountChainType(chainInfoMap[destChainValue], fromAccountJson.chainType);
  }, [accounts, chainInfoMap, destChainValue, fromValue]);

  const toChainValue = useMemo(() => _getAssetOriginChain(toAssetInfo), [toAssetInfo]);

  const recipientAddressRules = useMemo(
    () => ({
      validate: (_recipientAddress: string, { from, chain, toTokenSlug }: SwapFormValues): Promise<ValidateResult> => {
        if (!isRecipientFieldAllowed) {
          return Promise.resolve(undefined);
        }

        const destChain = assetRegistryMap[toTokenSlug].originChain;
        const destChainInfo = chainInfoMap[destChain];
        const account = findAccountByAddress(accounts, _recipientAddress);

        return validateRecipientAddress({
          srcChain: chain,
          destChainInfo,
          fromAddress: from,
          toAddress: _recipientAddress,
          account,
          actionType: ActionType.SWAP,
          autoFormatValue: false,
          allowLedgerGenerics: ledgerGenericAllowNetworks,
        });
      },
    }),
    [accounts, assetRegistryMap, chainInfoMap, isRecipientFieldAllowed, ledgerGenericAllowNetworks],
  );

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    currentQuote?.feeInfo.feeComponent.forEach(feeItem => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, currentQuote?.feeInfo.feeComponent, priceMap]);

  const canShowAvailableBalance = useMemo(() => {
    if (fromValue && chainValue && chainInfoMap[chainValue]) {
      return isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[chainValue]);
    }

    return false;
  }, [fromValue, chainValue, chainInfoMap]);

  const currentPair = useMemo(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      const pairSlug = _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue);

      return swapPairs.find(item => item.slug === pairSlug);
    }

    return undefined;
  }, [fromTokenSlugValue, swapPairs, toTokenSlugValue]);

  const altChain = useMemo(() => {
    if (currentPair) {
      const alternativeAssetSlug = getSwapAlternativeAsset(currentPair);

      if (alternativeAssetSlug) {
        return _getOriginChainOfAsset(alternativeAssetSlug);
      }
    }

    return undefined;
  }, [currentPair]);

  const isNotConnectedAltChain = useMemo(() => {
    if (altChain && !checkChainConnected(altChain)) {
      return true;
    }

    return false;
  }, [altChain, checkChainConnected]);

  const onSelectFromToken = useCallback(
    (tokenSlug: string) => {
      setValue('fromTokenSlug', tokenSlug);
    },
    [setValue],
  );

  const onIdle = useCallback(() => {
    !hasInternalConfirmations && !!confirmTerm && showQuoteArea && setRequestUserInteractToContinue(true);
  }, [confirmTerm, hasInternalConfirmations, showQuoteArea]);

  const onSelectToToken = useCallback(
    (tokenSlug: string) => {
      setValue('toTokenSlug', tokenSlug);
    },
    [setValue],
  );

  const onConfirmStillThere = useCallback(() => {
    setWarningIdleModalVisible(false);
    setHandleRequestLoading(true);
    setRequestUserInteractToContinue(false);
    setIsUserActive(true);
    continueRefreshQuoteRef.current = true;
  }, []);

  const onSelectSlippage = useCallback((_slippage: SlippageType) => {
    setCurrentSlippage(_slippage);
  }, []);

  const onSelectFeeOption = useCallback((slug: string) => {
    setCurrentFeeOption(slug);
    setChooseFeeModalVisible(false);
  }, []);

  const notifyTooLowAmount = useCallback(() => {
    show('Amount too low. Increase your amount and try again', { type: 'danger' });
  }, [show]);

  const notifyTooHighAmount = useCallback(() => {
    show('Amount too high. Lower your amount and try again', { type: 'danger' });
  }, [show]);

  const onConfirmSelectedQuote = useCallback(async (quote: SwapQuote) => {
    setPreferredProvider(quote.provider.id);

    return Promise.resolve();
  }, []);

  const notifyNoQuote = useCallback(() => {
    hideAll();
    show('Swap pair not supported. Select another pair and try again', { type: 'danger' });
  }, [hideAll, show]);

  const updateSwapStates = useCallback((rs: SwapRequestResult) => {
    setOptimalSwapPath(rs.process);
    setQuoteOptions(rs.quote.quotes);
    setCurrentQuote(rs.quote.optimalQuote);
    setQuoteAliveUntil(rs.quote.aliveUntil);
    setFeeOptions(rs.quote.optimalQuote?.feeInfo?.feeOptions || []);
    setCurrentFeeOption(rs.quote.optimalQuote?.feeInfo?.feeOptions?.[0]);
    setSwapError(rs.quote.error);
  }, []);

  const onChangeAmount = useCallback(
    (value: string) => {
      setIsUserActive(true);
      setValue('fromAmount', value);
    },
    [setValue],
  );

  const onPressMaxAmountButton = useCallback(() => {
    if (!currentFromTokenAvailableBalance) {
      return;
    }

    const result = new BigN(currentFromTokenAvailableBalance.value).multipliedBy(92).dividedToIntegerBy(100).toFixed();
    onChangeAmount(result);
    setSwapFromFieldRenderKey(`SwapFromField-${Date.now()}`);
  }, [currentFromTokenAvailableBalance, onChangeAmount]);

  const onPressHaftAmountButton = useCallback(() => {
    if (!currentFromTokenAvailableBalance) {
      return;
    }

    const result = new BigN(currentFromTokenAvailableBalance.value).dividedToIntegerBy(2).toFixed();

    onChangeAmount(result);
    setSwapFromFieldRenderKey(`SwapFromField-${Date.now()}`);
  }, [currentFromTokenAvailableBalance, onChangeAmount]);

  const reValidateField = useCallback((name: string) => trigger(name), [trigger]);

  const onSwitchSide = useCallback(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      setValue('fromTokenSlug', toTokenSlugValue);
      setValue('toTokenSlug', fromTokenSlugValue);
      setValue('from', '');
      setValue('recipient', undefined, { shouldDirty: false, shouldTouch: false });

      setIsFormInvalid(true);
    }
  }, [fromTokenSlugValue, setValue, toTokenSlugValue]);

  const toggleAddressInputManually = useCallback(() => {
    setIsRecipientFieldManuallyVisible(true);
  }, []);

  const isChainConnected = useMemo(() => {
    return checkChainConnected(chainValue);
  }, [chainValue, checkChainConnected]);

  const onSubmit = useCallback(
    (values: SwapFormValues) => {
      if (chainValue && !checkChainConnected(chainValue)) {
        Alert.alert(
          'Pay attention!',
          'Your selected network might have lost connection. Try updating it by either re-enabling it or changing network provider',
          [
            {
              text: 'I understand',
            },
          ],
        );

        return;
      }

      if (isChainConnected && swapError) {
        hideAll();
        show(swapError?.message, { type: 'danger', duration: 3000 });
      }

      if (!currentQuote || !currentOptimalSwapPath) {
        notifyNoQuote();

        return;
      }

      const account = findAccountByAddress(accounts, values.from);

      if (account?.isHardware) {
        hideAll();
        show('The account you are using is Ledger account, you cannot use this feature with it', { type: 'danger' });

        return;
      }

      const transactionBlockProcess = () => {
        setSubmitLoading(true);

        const { from, recipient } = values;
        let processId = processState.processId;

        const submitData = async (step: number): Promise<boolean> => {
          const isFirstStep = step === 0;
          const isLastStep = step === processState.steps.length - 1;
          const needRollback = step === 1;

          if (isFirstStep) {
            processId = getId();
          }

          dispatchProcessState({
            type: CommonActionType.STEP_SUBMIT,
            payload: isFirstStep ? { processId } : null,
          });

          try {
            if (isFirstStep) {
              const validatePromise = validateSwapProcess({
                address: from,
                process: currentOptimalSwapPath,
                selectedQuote: currentQuote,
                recipient,
                currentStep: 0,
              });

              const _errors = await validatePromise;

              if (_errors.length) {
                onError(_errors[0]);

                return false;
              } else {
                dispatchProcessState({
                  type: CommonActionType.STEP_COMPLETE,
                  payload: true,
                });
                dispatchProcessState({
                  type: CommonActionType.STEP_SUBMIT,
                  payload: null,
                });

                return await submitData(step + 1);
              }
            } else {
              if (oneSign && currentOptimalSwapPath.steps.length > 2) {
                const submitPromise: Promise<SWTransactionResponse> = submitProcess({
                  address: from,
                  id: processId,
                  type: ProcessType.SWAP,
                  request: {
                    cacheProcessId: processId,
                    process: currentOptimalSwapPath,
                    currentStep: step,
                    quote: currentQuote,
                    address: from,
                    slippage: slippage,
                    recipient,
                  },
                });

                const rs = await submitPromise;

                onSuccess(true, needRollback)(rs);

                return true;
              } else {
                const submitPromise: Promise<SWTransactionResponse> = handleSwapStep({
                  cacheProcessId: processId,
                  process: currentOptimalSwapPath,
                  currentStep: step,
                  quote: currentQuote,
                  address: from,
                  slippage: slippage,
                  recipient,
                });

                const rs = await submitPromise;
                const success = onSuccess(isLastStep, needRollback)(rs);

                if (success) {
                  return await submitData(step + 1);
                } else {
                  return false;
                }
              }
            }
          } catch (e) {
            onError(e as Error);

            return false;
          }
        };

        setTimeout(() => {
          submitData(processState.currentStep)
            .catch(onError)
            .finally(() => {
              setSubmitLoading(false);
            });
        }, 300);
      };

      if (currentQuote.isLowLiquidity) {
        const metadata = currentQuote.metadata as KyberSwapQuoteMetadata;
        const isHighPriceImpact = metadata?.priceImpact;

        confirmModal.setConfirmModal({
          visible: true,
          title: isHighPriceImpact ? 'High price impact!' : 'Pay attention!',
          message:
            isHighPriceImpact && metadata.priceImpact
              ? `Swapping this amount will result in a -${metadata.priceImpact}% price impact, and you will receive less than expected. Lower amount and try again, or continue at your own risk`
              : 'Low liquidity. Swap is available but not recommended as swap rate is unfavorable',
          completeBtnTitle: 'Continue',
          cancelBtnTitle: 'Cancel',
          onCompleteModal: () => {
            confirmModal.hideConfirmModal();
            transactionBlockProcess();
          },
          onCancelModal: () => {
            confirmModal.hideConfirmModal();
          },
          customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
        });
      } else {
        transactionBlockProcess();
      }
    },
    [
      accounts,
      chainValue,
      checkChainConnected,
      confirmModal,
      currentOptimalSwapPath,
      currentQuote,
      hideAll,
      isChainConnected,
      notifyNoQuote,
      onError,
      onSuccess,
      oneSign,
      processState.currentStep,
      processState.processId,
      processState.steps.length,
      show,
      slippage,
      swapError,
      theme.colorWarning,
    ],
  );

  const recipientAutoFilledInfo = useMemo(() => {
    if (!isRecipientFieldAllowed || targetAccountProxy.accountType !== AccountProxyType.UNIFIED) {
      return undefined;
    }

    const destChainInfo = chainInfoMap[destChainValue];

    if (!destChainInfo) {
      return undefined;
    }

    const accountJsonForRecipientAutoFilled = targetAccountProxy.accounts.find(a =>
      isChainInfoAccordantAccountChainType(destChainInfo, a.chainType),
    );

    if (!accountJsonForRecipientAutoFilled) {
      return undefined;
    }

    const formatedAddress = getReformatAddress(accountJsonForRecipientAutoFilled, destChainInfo);

    if (!formatedAddress) {
      return undefined;
    }

    return JSON.stringify({
      address: formatedAddress,
      name: accountJsonForRecipientAutoFilled.name,
    });
  }, [
    chainInfoMap,
    destChainValue,
    getReformatAddress,
    isRecipientFieldAllowed,
    targetAccountProxy.accountType,
    targetAccountProxy.accounts,
  ]);

  const hideRecipientField = useMemo(() => {
    return !isRecipientFieldAllowed || (!!recipientAutoFilledInfo && !isRecipientFieldManuallyVisible);
  }, [isRecipientFieldAllowed, isRecipientFieldManuallyVisible, recipientAutoFilledInfo]);

  const openSwapQuotesModal = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      setSwapQuoteSelectorModalVisible(true);
    }, 100);
  }, []);

  const closeSwapQuotesModal = useCallback(() => {
    setSwapQuoteSelectorModalVisible(false);
  }, []);

  const openSlippageModal = useCallback(() => {
    setSlippageModalVisible(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!!currentQuote && !isScrollEnd) {
        setIsScrollEnd(true);
        scrollRef.current?.scrollToEnd();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentQuote, isScrollEnd]);

  useEffect(() => {
    if (!confirmTerm) {
      setTermModalVisible(true);
    }
  }, [confirmTerm]);

  useEffect(() => {
    const chain = _getAssetOriginChain(fromAssetInfo);
    setChain(chain);
  }, [fromAssetInfo, setChain, setValue]);

  useEffect(() => {
    const unsubscribe = AppState.addEventListener('change', state => {
      setAppState(state);
    });

    return () => {
      unsubscribe.remove();
    };
  }, []);

  useEffect(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      const addressInputCurrent = addressInputRef.current;
      if (recipientAutoFilledInfo) {
        try {
          setIsRecipientFieldManuallyVisible(false);
          const { address } = JSON.parse(recipientAutoFilledInfo) as {
            address: string;
            name: string;
          };

          // addressInputCurrent?.setInputValue?.(address);
          // addressInputCurrent?.setSelectedOption?.({
          //   address,
          //   formatedAddress: address,
          //   analyzedGroup: AnalyzedGroup.RECENT,
          //   displayName: name,
          // });

          setValue('recipient', address);
        } catch (e) {
          console.log('Parse recipientAutoFilledInfo error', e);
        }
      } else {
        addressInputCurrent?.setInputValue?.('');
        addressInputCurrent?.setSelectedOption?.(undefined);
        setValue('recipient', undefined);
      }
    }
  }, [fromTokenSlugValue, isAddressInputReady, recipientAutoFilledInfo, setValue, toTokenSlugValue]);

  useEffect(() => {
    let sync = true;
    let timeout: NodeJS.Timeout;

    if (fromValue && fromTokenSlugValue && toTokenSlugValue && fromAmountValue && appState === 'active') {
      timeout = setTimeout(() => {
        const fromFieldPromise = reValidateField('from');
        const recipientFieldPromise = reValidateField('recipient');
        const fieldsToBeValidated: Promise<boolean>[] = [fromFieldPromise];
        if (isRecipientFieldAllowed) {
          fieldsToBeValidated.push(recipientFieldPromise);
        }
        Promise.all(fieldsToBeValidated)
          .then(() => {
            if (!sync) {
              return;
            }

            setHandleRequestLoading(true);
            setCurrentQuoteRequest(undefined);
            setQuoteAliveUntil(undefined);
            setCurrentQuote(undefined);
            setSwapError(undefined);
            setIsFormInvalid(false);
            setShowQuoteArea(true);

            const currentRequest: SwapRequestV2 = {
              address: fromValue,
              pair: {
                slug: _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue),
                from: fromTokenSlugValue,
                to: toTokenSlugValue,
              },
              fromAmount: fromAmountValue,
              slippage: currentSlippage.slippage.toNumber(),
              recipient: recipientValue || undefined,
              preferredProvider: preferredProvider,
            };

            handleSwapRequestV2(currentRequest)
              .then(result => {
                if (sync) {
                  setCurrentQuoteRequest(currentRequest);
                  dispatchProcessState({
                    payload: {
                      steps: result.process.steps,
                      feeStructure: result.process.totalFee,
                    },
                    type: CommonActionType.STEP_CREATE,
                  });

                  updateSwapStates(result);
                  setHandleRequestLoading(false);
                }
              })
              .catch(e => {
                console.log('handleSwapRequest error', e);

                if (sync) {
                  if (
                    e.message.toLowerCase().startsWith('failed to fetch swap quote') ||
                    e.message.toLowerCase().startsWith('swap pair is not found')
                  ) {
                    notifyNoQuote();
                  }

                  if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_LOW)) {
                    notifyTooLowAmount();
                  }

                  if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_HIGH)) {
                    notifyTooHighAmount();
                  }

                  setHandleRequestLoading(false);
                }
              });
          })
          .catch(() => {
            if (sync) {
              setIsFormInvalid(true);
            }
          });
      }, 300);
    } else {
      setIsFormInvalid(true);
    }

    return () => {
      sync = false;
      clearTimeout(timeout);
    };
  }, [
    appState,
    currentSlippage.slippage,
    fromAmountValue,
    fromTokenSlugValue,
    fromValue,
    isRecipientFieldAllowed,
    notifyNoQuote,
    notifyTooHighAmount,
    notifyTooLowAmount,
    preferredProvider,
    reValidateField,
    recipientValue,
    toTokenSlugValue,
    updateSwapStates,
  ]);

  useEffect(() => {
    if (fromTokenItems.length) {
      if (!fromTokenSlugValue) {
        setValue('fromTokenSlug', fromTokenItems[0].slug);
      } else {
        if (!fromTokenItems.some(item => item.slug === fromTokenSlugValue)) {
          setValue('fromTokenSlug', fromTokenItems[0].slug);
        }
      }
    } else {
      if (fromTokenSlugValue) {
        setValue('fromTokenSlug', '');
        setValue('toTokenSlug', '');
        onChangeAmount('');
        setCurrentQuote(undefined);
      }
    }
  }, [fromTokenItems, fromTokenSlugValue, onChangeAmount, setValue]);

  useEffect(() => {
    if (toTokenItems.length) {
      if (!toTokenSlugValue || !toTokenItems.some(t => t.slug === toTokenSlugValue)) {
        setValue('toTokenSlug', toTokenItems[0].slug);
      }
    }
  }, [setValue, toTokenItems, toTokenSlugValue]);

  useEffect(() => {
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        if (!fromValue || accountAddressItems[0].address !== fromValue) {
          setValue('from', accountAddressItems[0].address);
        }
      } else {
        if (fromValue && !accountAddressItems.some(i => i.address === fromValue)) {
          setValue('from', '');
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, fromValue, setValue]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    let sync = true;

    const refreshSwapRequestResult = () => {
      if (currentQuoteRequest) {
        if (sync) {
          setHandleRequestLoading(true);
        }

        handleSwapRequestV2(currentQuoteRequest)
          .then(rs => {
            if (sync) {
              updateSwapStates(rs);
              updateSwapStates(rs);
              setHandleRequestLoading(false);
            }
          })
          .catch(e => {
            if (
              e.message.toLowerCase().startsWith('failed to fetch swap quote') ||
              e.message.toLowerCase().startsWith('swap pair is not found')
            ) {
              notifyNoQuote();
            }

            if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_LOW)) {
              notifyTooLowAmount();
            }

            if (e.message.toLowerCase().startsWith(AcrossErrorMsg.AMOUNT_TOO_HIGH)) {
              notifyTooHighAmount();
            }
          })
          .finally(() => {
            if (sync) {
              setHandleRequestLoading(false);
            }
          });
      }
    };

    const updateQuoteHandler = () => {
      if (!quoteAliveUntil) {
        clearInterval(timer);

        if (continueRefreshQuoteRef.current && sync) {
          setHandleRequestLoading(false);
        }

        return;
      }

      if (quoteAliveUntil + 2000 < Date.now() && !continueRefreshQuoteRef.current) {
        clearInterval(timer);

        if (!requestUserInteractToContinue && !hasInternalConfirmations) {
          refreshSwapRequestResult();
        }
      } else {
        if (continueRefreshQuoteRef.current) {
          continueRefreshQuoteRef.current = false;

          refreshSwapRequestResult();
        }
      }
    };

    timer = setInterval(updateQuoteHandler, 1000);

    updateQuoteHandler();

    return () => {
      sync = false;
      clearInterval(timer);
    };
  }, [
    currentQuoteRequest,
    hasInternalConfirmations,
    notifyNoQuote,
    notifyTooHighAmount,
    notifyTooLowAmount,
    quoteAliveUntil,
    requestUserInteractToContinue,
    updateSwapStates,
  ]);

  useEffect(() => {
    if (isFormInvalid) {
      setQuoteAliveUntil(undefined);
      setShowQuoteArea(false);
      setQuoteOptions([]);
      setCurrentQuote(undefined);
      setCurrentQuoteRequest(undefined);
    }
  }, [isFormInvalid]);

  useEffect(() => {
    if (requestUserInteractToContinue) {
      setChooseFeeModalVisible(false);
      setSwapQuoteSelectorModalVisible(false);
      setSlippageModalVisible(false);
      setWarningIdleModalVisible(true);
    }
  }, [requestUserInteractToContinue]);

  useEffect(() => {
    if (altChain && !checkChainConnected(altChain)) {
      turnOnChain(altChain);
    }
  }, [checkChainConnected, altChain, turnOnChain]);
  // useEffect(() => {
  //   if (hideRecipientField) {
  //     setValue('recipient', '');
  //   }
  // }, [setValue, hideRecipientField]);

  useEffect(() => {
    if (isChainConnected && swapError) {
      show(swapError?.message, {
        type: 'danger',
      });
    }
  }, [isChainConnected, show, swapError, swapError?.message]);

  return (
    <>
      {!isTransactionDone || (oneSign && currentOptimalSwapPath?.steps && currentOptimalSwapPath?.steps.length > 2) ? (
        <UserInactivity
          isActive={isUserActive}
          skipKeyboard={false}
          timeForInactivity={300000}
          onAction={active => {
            setIsUserActive(active);
            if (!active) {
              Keyboard.dismiss();
              showQuoteArea && onIdle();
            }
          }}>
          <TransactionLayout title={title} disableLeftButton={submitLoading}>
            <ScrollView
              style={styles.scrollViewContainer}
              showsVerticalScrollIndicator={false}
              ref={scrollRef}
              keyboardShouldPersistTaps={'handled'}>
              {!!currentFromTokenAvailableBalance && (
                <View style={styles.swapFromFieldBtnWrapper}>
                  <Button
                    style={{ paddingHorizontal: 0 }}
                    onPress={onPressMaxAmountButton}
                    size={'xs'}
                    type={'ghost'}
                    externalTextStyle={styles.swapFromFieldBtnText}>
                    Max
                  </Button>
                  <Button
                    style={{ paddingHorizontal: 0 }}
                    onPress={onPressHaftAmountButton}
                    size={'xs'}
                    type={'ghost'}
                    externalTextStyle={styles.swapFromFieldBtnText}>
                    50%
                  </Button>
                </View>
              )}
              <SwapFromField
                key={swapFromFieldRenderKey}
                fromAsset={fromAssetInfo}
                onChangeInput={onChangeAmount}
                assetValue={fromTokenSlugValue}
                chainValue={chainValue}
                tokenSelectorItems={fromTokenItems}
                amountValue={fromAmountValue}
                chainInfo={chainInfoMap[chainValue]}
                onSelectToken={onSelectFromToken}
              />

              <View style={styles.switchableButtonWrapper}>
                <Button
                  disabled={!isSwitchable}
                  onPress={onSwitchSide}
                  activeStyle={styles.switchableActiveBtn}
                  style={styles.switchableBtn}
                  size={'xs'}
                  icon={<Icon phosphorIcon={ArrowsDownUp} size={'sm'} iconColor={theme['gray-5']} />}
                  shape={'circle'}
                />
              </View>

              <View style={{ position: 'relative' }}>
                {!!recipientAutoFilledInfo && !isRecipientFieldManuallyVisible && (
                  <View style={{ position: 'absolute', top: -2, zIndex: 10, right: 4 }}>
                    <Button
                      type={'ghost'}
                      icon={<Icon phosphorIcon={Book} size={'xs'} iconColor={theme['gray-5']} />}
                      size={'xs'}
                      onPress={toggleAddressInputManually}
                    />
                  </View>
                )}

                <SwapToField
                  decimals={_getAssetDecimals(toAssetInfo)}
                  toAsset={toAssetInfo}
                  assetValue={toTokenSlugValue}
                  chainValue={toChainValue}
                  tokenSelectorItems={toTokenItems}
                  swapValue={currentQuote?.toAmount || 0}
                  chainInfo={chainInfoMap[toChainValue]}
                  onSelectToken={onSelectToToken}
                  loading={handleRequestLoading && showQuoteArea}
                />
              </View>

              {!isNotShowAccountSelector && (
                <AccountSelector
                  items={accountAddressItems}
                  selectedValueMap={{ [fromValue]: true }}
                  accountSelectorRef={accountSelectorRef}
                  disabled={false}
                  onSelectItem={item => {
                    setFrom(item.address);
                    accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                  }}
                  renderSelected={() => (
                    <AccountSelectField
                      label={'From:'}
                      horizontal
                      accountName={accountInfo?.name || ''}
                      value={fromValue}
                      showIcon
                      labelStyle={{ width: 48 }}
                      outerStyle={{ marginTop: theme.sizeSM }}
                    />
                  )}
                />
              )}

              {!hideRecipientField && (
                <FormItem
                  name={'recipient'}
                  control={control}
                  rules={recipientAddressRules}
                  render={({ field: { value, ref, onChange, onBlur } }) => (
                    <InputAddress
                      containerStyle={{ marginTop: theme.marginXS }}
                      ref={el => {
                        if (el) {
                          (addressInputRef as React.MutableRefObject<AddressInputRef>).current = el;
                          ref?.(el);
                        }
                      }}
                      label={'To:'}
                      value={value}
                      horizontal
                      showAvatar={false}
                      onChangeText={onChange}
                      onSideEffectChange={onBlur}
                      onBlur={onBlur}
                      // reValidate={() => reValidateField('recipient')}
                      placeholder={'Input your recipient account'}
                      chain={destChainValue}
                      showAddressBook
                      fitNetwork
                      saveAddress
                    />
                  )}
                />
              )}

              <View style={{ marginTop: theme.marginXS }}>
                <FreeBalance
                  address={fromValue}
                  chain={chainValue}
                  extrinsicType={ExtrinsicType.SWAP}
                  hidden={!canShowAvailableBalance}
                  isSubscribe={true}
                  label={`${i18n.inputLabel.availableBalance}`}
                  tokenSlug={fromTokenSlugValue}
                  labelTooltip={'Available balance for swap'}
                  showNetwork={false}
                />
              </View>

              {showQuoteArea && (
                <QuoteInfoArea
                  currentOptimalSwapPath={currentOptimalSwapPath}
                  currentQuote={currentQuote}
                  estimatedFeeValue={estimatedFeeValue}
                  fromAssetInfo={fromAssetInfo}
                  handleRequestLoading={handleRequestLoading}
                  isFormInvalid={isFormInvalid}
                  openSlippageModal={openSlippageModal}
                  openSwapQuotesModal={openSwapQuotesModal}
                  quoteAliveUntil={quoteAliveUntil}
                  quoteOptions={quoteOptions}
                  slippage={slippage}
                  swapError={swapError}
                  toAssetInfo={toAssetInfo}
                />
              )}
              {defaultSlug && !fromAssetInfo && (
                <AlertBox
                  type={'warning'}
                  title={'Pay attention!'}
                  description={`No swap pair for this token found. Switch to ${
                    isEthereumAddress(fromValue) ? 'Polkadot' : 'Ethereum'
                  } account to see available swap pairs `}
                />
              )}
            </ScrollView>
            <View style={{ margin: theme.margin }}>
              <Button
                onPress={onPreCheck(handleSubmit(onSubmit), ExtrinsicType.SWAP)}
                disabled={
                  submitLoading ||
                  handleRequestLoading ||
                  isNotConnectedAltChain ||
                  !fromTokenItems.length ||
                  !!swapError ||
                  !!errors.recipient ||
                  !currentQuote
                }
                loading={submitLoading}>
                {'Swap'}
              </Button>
            </View>

            <SwapTermOfServiceModal
              modalVisible={termModalVisible}
              setModalVisible={setTermModalVisible}
              onPressAcceptBtn={() => {
                mmkvStore.set('confirm-swap-term', true);
                setTermModalVisible(false);
              }}
            />

            <SlippageModal
              modalVisible={slippageModalVisible}
              setModalVisible={setSlippageModalVisible}
              slippageValue={currentSlippage}
              onApplySlippage={onSelectSlippage}
            />

            {swapQuoteSelectorModalVisible && (
              <SwapQuotesSelectorModal
                applyQuote={onConfirmSelectedQuote}
                disableConfirmButton={handleRequestLoading}
                modalVisible={swapQuoteSelectorModalVisible}
                setModalVisible={setSwapQuoteSelectorModalVisible}
                items={quoteOptions}
                onCancel={closeSwapQuotesModal}
                quoteAliveUntil={quoteAliveUntil}
                selectedItem={currentQuote}
              />
            )}

            <ChooseFeeTokenModal
              modalVisible={chooseFeeModalVisible}
              setModalVisible={setChooseFeeModalVisible}
              estimatedFee={estimatedFeeValue}
              items={feeOptions}
              selectedItem={currentFeeOption}
              onSelectItem={onSelectFeeOption}
            />

            <SwapIdleWarningModal
              modalVisible={warningIdleModalVisible}
              setModalVisible={setWarningIdleModalVisible}
              onPressOk={onConfirmStillThere}
            />
          </TransactionLayout>
        </UserInactivity>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.SWAP} />
      )}
    </>
  );
};

const Swap = ({ route: { params } }: SendFundProps) => {
  const { accountProxies, currentAccountProxy } = useSelector((state: RootState) => state.accountState);
  const navigation = useNavigation<RootNavigationProps>();

  const targetAccountProxy = useMemo(() => {
    return accountProxies.find(ap => {
      if (!currentAccountProxy) {
        return isAccountAll(ap.id);
      }

      return ap.id === currentAccountProxy.id;
    });
  }, [accountProxies, currentAccountProxy]);

  useEffect(() => {
    if (!targetAccountProxy) {
      navigation.goBack();
    }
  }, [navigation, targetAccountProxy]);

  if (!targetAccountProxy) {
    return <></>;
  }

  return <Component targetAccountProxy={targetAccountProxy} defaultSlug={params?.slug} />;
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    scrollViewContainer: { flex: 1, paddingHorizontal: theme.padding, marginTop: theme.paddingXS },
    swapFromFieldBtnWrapper: {
      position: 'relative',
      flexDirection: 'row',
      zIndex: 10,
      justifyContent: 'flex-end',
      height: 0,
    },
    swapFromFieldBtnText: { fontSize: theme.fontSizeSM, lineHeight: 40, height: 40, ...FontSemiBold },
    switchableButtonWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      height: theme.sizeXS,
      position: 'relative',
      zIndex: 10000,
    },
    switchableActiveBtn: { backgroundColor: theme['gray-2'] },
    switchableBtn: { position: 'absolute', backgroundColor: theme['gray-2'] },
  });
}

export default Swap;
