import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { mmkvStore } from 'utils/storage';
import { SwapTermOfServiceModal } from 'components/Modal/TermModal/parts/SwapTermOfServiceModal';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { SwapFromField } from 'components/Swap/SwapFromField';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenItemType, TokenSelectorItemType } from 'components/Modal/common/TokenSelector';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getAssetSymbol,
  _getChainNativeTokenSlug,
  _getMultiChainAsset,
  _getOriginChainOfAsset,
  _isChainEvmCompatible,
  _parseAssetRefKey,
} from '@subwallet/extension-base/services/chain-service/utils';
import { Alert, AppState, Keyboard, Platform, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { SwapToField } from 'components/Swap/SwapToField';
import BigN from 'bignumber.js';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { ModalRef } from 'types/modalRef';
import { isAccountAll } from 'utils/accountAll';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { InputAddress } from 'components/Input/InputAddress';
import i18n from 'utils/i18n/i18n';
import { ActivityIndicator, Button, Divider, Icon, Number, Typography } from 'components/design-system-ui';
import { ArrowsDownUp, CaretRight, Info, PencilSimpleLine } from 'phosphor-react-native';
import { SlippageModal } from 'components/Modal/Swap/SlippageModal';
import MetaInfo from 'components/MetaInfo';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';
import { Warning } from 'components/Warning';
import { ChooseFeeTokenModal } from 'components/Modal/Swap/ChooseFeeTokenModal';
import { SwapQuoteDetailModal } from 'components/Modal/Swap/SwapQuoteDetailModal';
import { SwapQuotesSelectorModal } from 'components/Modal/Swap/SwapQuotesSelectorModal';
import {
  SIMPLE_SWAP_SLIPPAGE,
  SlippageType,
  SwapFeeType,
  SwapProviderId,
  SwapQuote,
  SwapRequest,
} from '@subwallet/extension-base/types/swap';
import { CommonFeeComponent, CommonOptimalPath, CommonStepType } from '@subwallet/extension-base/types/service-base';
import { formatNumberString, isSameAddress, swapCustomFormatter } from '@subwallet/extension-base/utils';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { findAccountByAddress, getReformatedAddressRelatedToChain } from 'utils/account';
import { getLatestSwapQuote, handleSwapRequest, handleSwapStep, validateSwapProcess } from 'messaging/swap';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from 'reducers/transaction-process';
import { FormItem } from 'components/common/FormItem';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useToast } from 'react-native-toast-notifications';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import useChainChecker from 'hooks/chain/useChainChecker';
import { getSwapAlternativeAsset } from '@subwallet/extension-base/services/swap-service/utils';
import FreeBalanceToYield from 'screens/Transaction/parts/FreeBalanceToEarn';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { QuoteResetTime } from 'components/Swap/QuoteResetTime';
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
import { AccountProxyType, ProcessType } from '@subwallet/extension-base/types';
import { isTokenCompatibleWithAccountChainTypes } from 'utils/chainAndAsset';
import { getChainsByAccountAll } from 'utils/index';
import { isChainInfoAccordantAccountChainType } from 'utils/chain';
import { validateRecipientAddress } from 'utils/core/logic-validation/recipientAddress';
import { ActionType } from '@subwallet/extension-base/core/types';
import { CHAINFLIP_SLIPPAGE } from 'types/swap';
import Tooltip from 'react-native-walkthrough-tooltip';
import { submitProcess } from 'messaging/index';
import useOneSignProcess from 'hooks/account/useOneSignProcess';
import { getId } from '@subwallet/extension-base/utils/getId';

interface SwapFormValues extends TransactionFormValues {
  fromAmount: string;
  fromTokenSlug: string;
  toTokenSlug: string;
  recipient?: string;
}

function getTokenSelectorItem(tokenSlugs: string[], assetRegistryMap: Record<string, _ChainAsset>): TokenItemType[] {
  const result: TokenItemType[] = [];

  tokenSlugs.forEach(slug => {
    const asset = assetRegistryMap[slug];

    if (Platform.OS === 'android') {
      // if (asset && asset.originChain !== 'hydradx_main') {
      result.push({
        originChain: asset.originChain,
        slug,
        symbol: asset.symbol,
        name: asset.name,
      });
      // }
    } else {
      result.push({
        originChain: asset.originChain,
        slug,
        symbol: asset.symbol,
        name: asset.name,
      });
    }
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

const numberMetadata = { maxNumberFormat: 8 };

export const Swap = ({ route: { params } }: SendFundProps) => {
  const { show, hideAll } = useToast();
  const theme = useSubWalletTheme().swThemes;
  const { assetRegistry: assetRegistryMap, multiChainAssetMap } = useSelector(
    (state: RootState) => state.assetRegistry,
  );
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((state: RootState) => state.chainStore);
  const { accountProxies, accounts, currentAccountProxy, isAllAccount } = useSelector(
    (state: RootState) => state.accountState,
  );
  const hasInternalConfirmations = useSelector((state: RootState) => state.requestState.hasInternalConfirmations);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const swapPairs = useSelector((state: RootState) => state.swap.swapPairs);
  const confirmTerm = mmkvStore.getBoolean('confirm-swap-term');
  const [termModalVisible, setTermModalVisible] = useState<boolean>(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const tokenGroupSlug = params?.slug;

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

  const fromValue = useWatch<SwapFormValues>({ name: 'from', control });
  const fromAmountValue = useWatch<SwapFormValues>({ name: 'fromAmount', control });
  const fromTokenSlugValue = useWatch<SwapFormValues>({ name: 'fromTokenSlug', control });
  const toTokenSlugValue = useWatch<SwapFormValues>({ name: 'toTokenSlug', control });
  const chainValue = useWatch<SwapFormValues>({ name: 'chain', control });
  const recipientValue = useWatch<SwapFormValues>({ name: 'recipient', control });
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const accountInfo = useGetAccountByAddress(fromValue);
  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);
  const { onError, onSuccess } = useHandleSubmitMultiTransaction(onDone, setTransactionDone, dispatchProcessState);
  const onPreCheck = usePreCheckAction(fromValue);
  const oneSign = useOneSignProcess(fromValue);
  const accountSelectorRef = useRef<ModalRef>();
  const [showQuoteArea, setShowQuoteArea] = useState<boolean>(false);
  const [quoteOptions, setQuoteOptions] = useState<SwapQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(undefined);
  const [quoteAliveUntil, setQuoteAliveUntil] = useState<number | undefined>(undefined);
  const [currentQuoteRequest, setCurrentQuoteRequest] = useState<SwapRequest | undefined>(undefined);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [currentOptimalSwapPath, setOptimalSwapPath] = useState<CommonOptimalPath | undefined>(undefined);
  const [slippageModalVisible, setSlippageModalVisible] = useState<boolean>(false);
  const [swapQuoteModalVisible, setSwapQuoteModalVisible] = useState<boolean>(false);
  const [chooseFeeModalVisible, setChooseFeeModalVisible] = useState<boolean>(false);
  const [warningIdleModalVisible, setWarningIdleModalVisible] = useState<boolean>(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const [swapQuoteSelectorModalVisible, setSwapQuoteSelectorModalVisible] = useState<boolean>(false);
  const [currentSlippage, setCurrentSlippage] = useState<any>({
    slippage: new BigN(0.01),
    isCustomType: true,
  });
  const [handleRequestLoading, setHandleRequestLoading] = useState(true);
  const [swapError, setSwapError] = useState<SwapError | undefined>(undefined);
  const [feeOptions, setFeeOptions] = useState<string[] | undefined>([]);
  const [currentFeeOption, setCurrentFeeOption] = useState<string | undefined>(undefined);
  const optimalQuoteRef = useRef<SwapQuote | undefined>(undefined);
  const [requestUserInteractToContinue, setRequestUserInteractToContinue] = useState<boolean>(false);
  const continueRefreshQuoteRef = useRef<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState<boolean>(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    accountProxies.forEach(ap => {
      if (!currentAccountProxy || !(isAccountAll(currentAccountProxy.id) || ap.id === currentAccountProxy.id)) {
        return;
      }

      if ([AccountProxyType.READ_ONLY, AccountProxyType.LEDGER].includes(ap.accountType)) {
        return;
      }

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
    });

    return result;
  }, [accountProxies, chainInfoMap, chainValue, currentAccountProxy]);
  const fromAndToTokenMap = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};

    swapPairs.forEach(pair => {
      if (!result[pair.from]) {
        result[pair.from] = [pair.to];
      } else {
        result[pair.from].push(pair.to);
      }
    });

    return result;
  }, [swapPairs]);

  const fromTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    if (!currentAccountProxy) {
      return [];
    }

    const rawTokenSlugs = Object.keys(fromAndToTokenMap);
    let targetTokenSlugs: string[] = [];

    (() => {
      // defaultSlug is just TokenSlug
      if (tokenGroupSlug && rawTokenSlugs.includes(tokenGroupSlug)) {
        if (isTokenCompatibleWithAccountChainTypes(tokenGroupSlug, currentAccountProxy.chainTypes, chainInfoMap)) {
          targetTokenSlugs.push(tokenGroupSlug);
        }

        return;
      }

      rawTokenSlugs.forEach(rts => {
        const assetInfo = assetRegistryMap[rts];
        if (!assetInfo) {
          return;
        }

        if (tokenGroupSlug) {
          // defaultSlug is MultiChainAssetSlug
          if (
            _getMultiChainAsset(assetInfo) === tokenGroupSlug &&
            isTokenCompatibleWithAccountChainTypes(rts, currentAccountProxy.chainTypes, chainInfoMap)
          ) {
            targetTokenSlugs.push(rts);
          }

          return;
        }

        if (isTokenCompatibleWithAccountChainTypes(rts, currentAccountProxy.chainTypes, chainInfoMap)) {
          targetTokenSlugs.push(rts);
        }

        if (isAllAccount) {
          const allowChainSlug = getChainsByAccountAll(currentAccountProxy, accountProxies, chainInfoMap);

          targetTokenSlugs = targetTokenSlugs.filter(tokenSlug => {
            const chainSlug = _getOriginChainOfAsset(tokenSlug);

            return allowChainSlug.includes(chainSlug);
          });
        }
      });
    })();

    if (targetTokenSlugs.length) {
      return getTokenSelectorItem(targetTokenSlugs, assetRegistryMap);
    }

    return [];
  }, [
    accountProxies,
    assetRegistryMap,
    chainInfoMap,
    tokenGroupSlug,
    fromAndToTokenMap,
    isAllAccount,
    currentAccountProxy,
  ]);

  const toTokenItems = useMemo<TokenSelectorItemType[]>(() => {
    return getTokenSelectorItem(fromAndToTokenMap[fromTokenSlugValue] || [], assetRegistryMap);
  }, [assetRegistryMap, fromAndToTokenMap, fromTokenSlugValue]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[fromTokenSlugValue] || undefined;
  }, [assetRegistryMap, fromTokenSlugValue]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[toTokenSlugValue] || undefined;
  }, [assetRegistryMap, toTokenSlugValue]);

  const destChainValue = _getAssetOriginChain(toAssetInfo);

  const feeAssetInfo = useMemo(() => {
    return currentFeeOption ? assetRegistryMap[currentFeeOption] : undefined;
  }, [assetRegistryMap, currentFeeOption]);

  const toChainValue = useMemo(() => _getAssetOriginChain(toAssetInfo), [toAssetInfo]);

  const isSwitchable = useMemo(() => {
    if (!fromAndToTokenMap[toTokenSlugValue] || !currentAccountProxy) {
      return false;
    }

    return isTokenCompatibleWithAccountChainTypes(toTokenSlugValue, currentAccountProxy.chainTypes, chainInfoMap);
  }, [fromAndToTokenMap, toTokenSlugValue, currentAccountProxy, chainInfoMap]);

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

  const recipientAddressRules = useMemo(
    () => ({
      validate: (_recipientAddress: string, { from, chain, toTokenSlug }: SwapFormValues): Promise<ValidateResult> => {
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
    [accounts, assetRegistryMap, chainInfoMap, ledgerGenericAllowNetworks],
  );

  const getConvertedBalance = useCallback(
    (feeItem: CommonFeeComponent) => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        return new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price);
      }

      return BN_ZERO;
    },
    [assetRegistryMap, priceMap],
  );

  const notSupportSlippageSelection = useMemo(() => {
    const unsupportedProviders = [
      SwapProviderId.CHAIN_FLIP_TESTNET,
      SwapProviderId.CHAIN_FLIP_MAINNET,
      SwapProviderId.SIMPLE_SWAP,
    ];

    return currentQuote?.provider.id ? unsupportedProviders.includes(currentQuote.provider.id) : false;
  }, [currentQuote?.provider.id]);

  const isSimpleSwapSlippage = useMemo(() => {
    if (currentQuote?.provider.id === SwapProviderId.SIMPLE_SWAP) {
      return true;
    }

    return false;
  }, [currentQuote?.provider.id]);

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

  const minimumReceived = useMemo(() => {
    const adjustedValue = new BigN(currentQuote?.toAmount || '0')
      .multipliedBy(new BigN(1).minus(new BigN(slippage)))
      .integerValue(BigN.ROUND_DOWN);

    const adjustedValueStr = adjustedValue.toString();

    return adjustedValueStr.includes('e') ? formatNumberString(adjustedValueStr) : adjustedValueStr;
  }, [slippage, currentQuote?.toAmount]);

  const isNotShowAccountSelector = !isAllAccount && accountAddressItems.length < 2;

  const showRecipientField = useMemo(() => {
    if (!fromValue || !destChainValue || !chainInfoMap[destChainValue]) {
      return false;
    }

    const fromAccountJson = accounts.find(account => isSameAddress(account.address, fromValue));

    if (!fromAccountJson) {
      return false;
    }

    return !isChainInfoAccordantAccountChainType(chainInfoMap[destChainValue], fromAccountJson.chainType);
  }, [accounts, chainInfoMap, destChainValue, fromValue]);

  const feeItems = useMemo(() => {
    const result: FeeItem[] = [];
    const feeTypeMap: Record<SwapFeeType, FeeItem> = {
      NETWORK_FEE: {
        label: 'Network fee',
        value: new BigN(0),
        prefix: `${currencyData.symbol}`,
        type: SwapFeeType.NETWORK_FEE,
      },
      PLATFORM_FEE: {
        label: 'Protocol fee',
        value: new BigN(0),
        prefix: `${currencyData.symbol}`,
        type: SwapFeeType.PLATFORM_FEE,
      },
      WALLET_FEE: {
        label: 'Wallet commission',
        value: new BigN(0),
        prefix: `${(currencyData.isPrefix && currencyData.symbol) || ''}`,
        suffix: `${(!currencyData.isPrefix && currencyData.symbol) || ''}`,
        type: SwapFeeType.WALLET_FEE,
      },
    };

    currentQuote?.feeInfo.feeComponent.forEach(feeItem => {
      const { feeType } = feeItem;

      feeTypeMap[feeType].value = feeTypeMap[feeType].value.plus(getConvertedBalance(feeItem));
    });

    Object.values(feeTypeMap).forEach(fee => {
      if (!fee.value.lte(new BigN(0))) {
        result.push(fee);
      }
    });

    return result;
  }, [currencyData.isPrefix, currencyData.symbol, currentQuote?.feeInfo.feeComponent, getConvertedBalance]);

  const canShowAvailableBalance = useMemo(() => {
    if (fromValue && chainValue && chainInfoMap[chainValue]) {
      return isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[chainValue]);
    }

    return false;
  }, [fromValue, chainValue, chainInfoMap]);

  const isSwapXCM = useMemo(() => {
    return processState.steps.some(item => item.type === CommonStepType.XCM);
  }, [processState.steps]);

  const isSwapAssetHub = useMemo(() => {
    const providerId = currentQuote?.provider?.id;

    return providerId
      ? [SwapProviderId.KUSAMA_ASSET_HUB, SwapProviderId.POLKADOT_ASSET_HUB, SwapProviderId.ROCOCO_ASSET_HUB].includes(
          providerId,
        )
      : false;
  }, [currentQuote?.provider?.id]);

  const currentPair = useMemo(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      const pairSlug = _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue);

      return swapPairs.find(item => item.slug === pairSlug);
    }

    return undefined;
  }, [fromTokenSlugValue, swapPairs, toTokenSlugValue]);

  const xcmBalanceTokens = useMemo(() => {
    if (!isSwapXCM || !fromAssetInfo || !currentPair) {
      return [];
    }

    const result: {
      token: string;
      chain: string;
    }[] = [
      {
        token: fromAssetInfo.slug,
        chain: fromAssetInfo.originChain,
      },
    ];

    const chainInfo = chainInfoMap[fromAssetInfo.originChain];

    if (chainInfo) {
      const _nativeSlug = _getChainNativeTokenSlug(chainInfo);

      if (_nativeSlug !== fromAssetInfo.slug) {
        result.push({
          token: _getChainNativeTokenSlug(chainInfo),
          chain: fromAssetInfo.originChain,
        });
      }
    }

    const alternativeAssetSlug = getSwapAlternativeAsset(currentPair);

    if (alternativeAssetSlug) {
      result.push({
        token: alternativeAssetSlug,
        chain: _getOriginChainOfAsset(alternativeAssetSlug),
      });
    }

    return result;
  }, [chainInfoMap, currentPair, fromAssetInfo, isSwapXCM]);

  const altChain = useMemo(() => {
    if (currentPair) {
      const alternativeAssetSlug = getSwapAlternativeAsset(currentPair);

      if (alternativeAssetSlug) {
        return _getOriginChainOfAsset(alternativeAssetSlug);
      }
    }

    return undefined;
  }, [currentPair]);

  const slippageTitle = isSimpleSwapSlippage ? 'Slippage can be up to 5% due to market conditions' : '';
  const slippageContent = isSimpleSwapSlippage
    ? `Up to ${(slippage * 100).toString().toString()}%`
    : `${(slippage * 100).toString().toString()}%`;

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
    setRequestUserInteractToContinue(false);
    setWarningIdleModalVisible(false);
    setHandleRequestLoading(true);
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

  const onSelectQuote = useCallback((quote: SwapQuote) => {
    setCurrentQuote(quote);
    setFeeOptions(quote.feeInfo.feeOptions);
    setCurrentFeeOption(quote.feeInfo.feeOptions?.[0]);
    setCurrentQuoteRequest(oldRequest => {
      if (!oldRequest) {
        return undefined;
      }

      return {
        ...oldRequest,
        currentQuote: quote.provider,
      };
    });
    setSwapQuoteSelectorModalVisible(false);
  }, []);

  const openChooseFeeToken = useCallback(() => {
    setChooseFeeModalVisible(true);
  }, []);

  const onChangeAmount = useCallback(
    (value: string) => {
      setIsUserActive(true);
      setValue('fromAmount', value);
    },
    [setValue],
  );

  const openSwapSelectorModal = useCallback(() => {
    setSwapQuoteSelectorModalVisible(true);
  }, []);

  const onOpenSlippageModal = useCallback(() => {
    if (!notSupportSlippageSelection) {
      setSlippageModalVisible(true);
    } else {
      setTooltipVisible(true);
    }
  }, [notSupportSlippageSelection]);

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

  const renderSlippage = useCallback(() => {
    return (
      <Tooltip
        isVisible={tooltipVisible}
        disableShadow={true}
        placement={'bottom'}
        showChildInTooltip={false}
        topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
        contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
        closeOnBackgroundInteraction={true}
        onClose={() => setTooltipVisible(false)}
        content={
          <Typography.Text size={'sm'} style={{ color: theme.colorWhite, textAlign: 'center' }}>
            {slippageTitle}
          </Typography.Text>
        }>
        <TouchableOpacity
          onPress={onOpenSlippageModal}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: theme.sizeXXS,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography.Text style={{ color: theme.colorSuccess }}>{'Slippage'}</Typography.Text>
            <View style={{ paddingTop: theme.sizeXXS }}>
              <Icon phosphorIcon={Info} size={'xs'} iconColor={theme.colorSuccess} weight={'fill'} />
            </View>
            <Typography.Text style={{ color: theme.colorSuccess }}>{':'}</Typography.Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
            <Typography.Text style={{ color: theme.colorSuccess }}>{slippageContent}</Typography.Text>
            {!notSupportSlippageSelection && (
              <Icon phosphorIcon={PencilSimpleLine} size={'xs'} iconColor={theme.colorSuccess} weight={'bold'} />
            )}
          </View>
        </TouchableOpacity>
      </Tooltip>
    );
  }, [
    tooltipVisible,
    theme.colorBgSpotlight,
    theme.borderRadiusLG,
    theme.colorWhite,
    theme.sizeXXS,
    theme.colorSuccess,
    slippageTitle,
    onOpenSlippageModal,
    slippageContent,
    notSupportSlippageSelection,
  ]);

  const renderRateInfo = useCallback(() => {
    if (!currentQuote) {
      return null;
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <Number
          size={theme.fontSize}
          unitColor={theme.colorTextLight4}
          decimal={0}
          suffix={_getAssetSymbol(fromAssetInfo)}
          value={1}
        />
        <Typography.Text style={{ color: theme.colorWhite }}>~</Typography.Text>
        <Number
          customFormatter={swapCustomFormatter}
          formatType={'custom'}
          metadata={numberMetadata}
          size={theme.fontSize}
          decimal={0}
          suffix={_getAssetSymbol(toAssetInfo)}
          value={currentQuote.rate}
          unitColor={theme.colorTextLight4}
        />
      </View>
    );
  }, [currentQuote, fromAssetInfo, theme.colorTextLight4, theme.colorWhite, theme.fontSize, toAssetInfo]);

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

      if (!currentQuote || !currentOptimalSwapPath) {
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
              let latestOptimalQuote = currentQuote;

              if (currentOptimalSwapPath.steps.length > 2 && isLastStep) {
                if (currentQuoteRequest) {
                  const latestSwapQuote = await getLatestSwapQuote(currentQuoteRequest);

                  if (latestSwapQuote.optimalQuote) {
                    latestOptimalQuote = latestSwapQuote.optimalQuote;
                    setQuoteOptions(latestSwapQuote.quotes);
                    setCurrentQuote(latestSwapQuote.optimalQuote);
                    setQuoteAliveUntil(latestSwapQuote.aliveUntil);
                  }
                }
              }

              if (oneSign && currentOptimalSwapPath.steps.length > 2) {
                const submitPromise: Promise<SWTransactionResponse> = submitProcess({
                  address: from,
                  id: processId,
                  type: ProcessType.SWAP,
                  request: {
                    process: currentOptimalSwapPath,
                    currentStep: step,
                    quote: latestOptimalQuote,
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
                  process: currentOptimalSwapPath,
                  currentStep: step,
                  quote: latestOptimalQuote,
                  address: from,
                  slippage: slippage,
                  recipient: recipient || undefined,
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
        Alert.alert(
          'Pay attention!',
          'Low liquidity. Swap is available but not recommended as swap rate is unfavorable',
          [
            {
              text: 'Cancel',
              style: 'destructive',
            },
            {
              text: 'Continue',
              onPress: transactionBlockProcess,
            },
          ],
        );
      } else {
        transactionBlockProcess();
      }
    },
    [
      accounts,
      chainValue,
      checkChainConnected,
      currentOptimalSwapPath,
      currentQuote,
      currentQuoteRequest,
      hideAll,
      onError,
      onSuccess,
      oneSign,
      processState.currentStep,
      processState.processId,
      processState.steps.length,
      show,
      slippage,
    ],
  );

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
    let sync = true;
    let timeout: NodeJS.Timeout;

    if (fromValue && fromTokenSlugValue && toTokenSlugValue && fromAmountValue && appState === 'active') {
      timeout = setTimeout(() => {
        const fromFieldPromise = reValidateField('from');
        const recipientFieldPromise = reValidateField('recipient');
        Promise.all([recipientFieldPromise, fromFieldPromise])
          .then(res => {
            if (!res.some(r => !r)) {
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

              const currentRequest: SwapRequest = {
                address: fromValue,
                pair: {
                  slug: _parseAssetRefKey(fromTokenSlugValue, toTokenSlugValue),
                  from: fromTokenSlugValue,
                  to: toTokenSlugValue,
                },
                fromAmount: fromAmountValue,
                slippage: currentSlippage.slippage.toNumber(),
                recipient: recipientValue || undefined,
              };

              handleSwapRequest(currentRequest)
                .then(result => {
                  if (sync) {
                    setCurrentQuoteRequest(currentRequest);
                    setOptimalSwapPath(result.process);

                    dispatchProcessState({
                      payload: {
                        steps: result.process.steps,
                        feeStructure: result.process.totalFee,
                      },
                      type: CommonActionType.STEP_CREATE,
                    });

                    setQuoteOptions(result.quote.quotes);
                    setCurrentQuote(result.quote.optimalQuote);
                    setQuoteAliveUntil(result.quote.aliveUntil);
                    setFeeOptions(result.quote.optimalQuote?.feeInfo?.feeOptions || []);
                    setCurrentFeeOption(result.quote.optimalQuote?.feeInfo?.feeOptions?.[0]);
                    setSwapError(result.quote.error);
                    optimalQuoteRef.current = result.quote.optimalQuote;
                    setHandleRequestLoading(false);
                  }
                })
                .catch(e => {
                  console.log('handleSwapRequest error', e);

                  if (sync) {
                    setHandleRequestLoading(false);
                  }
                });
            } else {
              if (sync) {
                setIsFormInvalid(true);
              }
            }
          })
          .catch(() => {
            if (sync) {
              setIsFormInvalid(true);
            }
          });
      }, 300);
    } else {
      setHandleRequestLoading(false);
      setCurrentQuoteRequest(undefined);
      setQuoteAliveUntil(undefined);
      setCurrentQuote(undefined);
      setSwapError(undefined);
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
    reValidateField,
    recipientValue,
    toTokenSlugValue,
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

    const updateQuote = () => {
      if (currentQuoteRequest) {
        if (sync) {
          setHandleRequestLoading(true);
        }

        getLatestSwapQuote(currentQuoteRequest)
          .then(rs => {
            if (sync) {
              if (rs.optimalQuote) {
                setSwapError(undefined);
              }
              setQuoteOptions(rs.quotes);
              setCurrentQuote(rs.optimalQuote);
              setQuoteAliveUntil(rs.aliveUntil);
            }
          })
          .catch(e => {
            console.log('Error when getLatestSwapQuote', e);
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
          updateQuote();
        }
      } else {
        if (continueRefreshQuoteRef.current) {
          continueRefreshQuoteRef.current = false;

          updateQuote();
        }
      }
    };

    timer = setInterval(updateQuoteHandler, 1000);

    updateQuoteHandler();

    return () => {
      sync = false;
      clearInterval(timer);
    };
  }, [currentQuoteRequest, hasInternalConfirmations, quoteAliveUntil, requestUserInteractToContinue]);

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
      setSwapQuoteModalVisible(false);
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

  useEffect(() => {
    if (!showRecipientField) {
      setValue('recipient', '');
    }
  }, [setValue, showRecipientField]);

  const renderAlertBox = useCallback(() => {
    const multichainAsset = fromAssetInfo?.multiChainAsset;
    const fromAssetName = multichainAsset && multiChainAssetMap[multichainAsset]?.name;
    const toAssetName = chainInfoMap[toAssetInfo?.originChain]?.name;

    return (
      <View style={{ gap: theme.sizeXS }}>
        {isSwapAssetHub && !isFormInvalid && (
          <AlertBox
            description={
              'Swapping on Asset Hub is in beta with a limited number of pairs and low liquidity. Continue at your own risk'
            }
            title={'Pay attention!'}
            type={'warning'}
          />
        )}

        {isSwapXCM && fromAssetName && toAssetName && !isFormInvalid && !oneSign && (
          <AlertBox
            description={`The amount you entered is higher than your available balance on ${toAssetName} network. You need to first transfer cross-chain from ${fromAssetName} network to ${toAssetName} network to continue swapping`}
            title={'Action needed'}
            type={'warning'}
          />
        )}
      </View>
    );
  }, [
    chainInfoMap,
    fromAssetInfo?.multiChainAsset,
    isFormInvalid,
    isSwapAssetHub,
    isSwapXCM,
    multiChainAssetMap,
    oneSign,
    theme.sizeXS,
    toAssetInfo?.originChain,
  ]);

  return (
    <>
      {!isTransactionDone ? (
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
              style={{ flex: 1, paddingHorizontal: 16, marginTop: theme.paddingXS }}
              showsVerticalScrollIndicator={false}
              ref={scrollRef}
              keyboardShouldPersistTaps={'handled'}>
              <SwapFromField
                fromAsset={fromAssetInfo}
                onChangeInput={onChangeAmount}
                assetValue={fromTokenSlugValue}
                chainValue={chainValue}
                tokenSelectorItems={fromTokenItems}
                amountValue={fromAmountValue}
                chainInfo={chainInfoMap[chainValue]}
                onSelectToken={onSelectFromToken}
              />

              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: theme.sizeXS,
                  position: 'relative',
                  zIndex: 10000,
                }}>
                <Button
                  disabled={!isSwitchable}
                  onPress={onSwitchSide}
                  activeStyle={{ backgroundColor: theme['gray-2'] }}
                  style={{ position: 'absolute', backgroundColor: theme['gray-2'] }}
                  size={'xs'}
                  icon={<Icon phosphorIcon={ArrowsDownUp} size={'sm'} iconColor={theme['gray-5']} />}
                  shape={'circle'}
                />
              </View>

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

              {showRecipientField && (
                <FormItem
                  name={'recipient'}
                  control={control}
                  rules={recipientAddressRules}
                  render={({ field: { value, ref, onChange, onBlur } }) => (
                    <InputAddress
                      containerStyle={{ marginTop: theme.marginXS }}
                      ref={ref}
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
                <FreeBalanceToYield
                  address={fromValue}
                  label={`${i18n.inputLabel.availableBalance}:`}
                  tokens={xcmBalanceTokens}
                  hidden={!canShowAvailableBalance || !isSwapXCM}
                />

                <FreeBalance
                  address={fromValue}
                  chain={chainValue}
                  hidden={!canShowAvailableBalance || isSwapXCM}
                  isSubscribe={true}
                  label={`${i18n.inputLabel.availableBalance}:`}
                  tokenSlug={fromTokenSlugValue}
                  showNetwork
                />
              </View>

              {showQuoteArea && !!fromTokenItems.length && (
                <>
                  {!!currentQuote && !isFormInvalid && (
                    <>
                      <Divider type={'horizontal'} />

                      <View style={{ marginTop: theme.sizeXS }}>
                        <MetaInfo labelColorScheme={'gray'} spaceSize={'sm'} valueColorScheme={'light'}>
                          <MetaInfo.Default label={'Quote rate'} valueColorSchema={'gray'}>
                            {handleRequestLoading ? <ActivityIndicator size={20} /> : renderRateInfo()}
                          </MetaInfo.Default>
                          <MetaInfo.Default label={'Estimated fee'}>
                            {handleRequestLoading ? (
                              <ActivityIndicator size={20} />
                            ) : (
                              <Number
                                size={theme.fontSize}
                                decimal={0}
                                prefix={currencyData?.symbol}
                                value={estimatedFeeValue}
                              />
                            )}
                          </MetaInfo.Default>
                        </MetaInfo>

                        {!isFormInvalid && !handleRequestLoading && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <QuoteResetTime quoteAliveUntilValue={quoteAliveUntil} />

                            <TouchableOpacity
                              style={{ height: 40, justifyContent: 'center' }}
                              onPress={() => {
                                Keyboard.dismiss();
                                setTimeout(() => setSwapQuoteModalVisible(true), 100);
                              }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
                                <Typography.Text style={{ color: theme.colorTextLight4 }}>
                                  {'View swap quote'}
                                </Typography.Text>
                                <View style={{ paddingTop: 2 }}>
                                  <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight4} />
                                </View>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </>
                  )}

                  <View style={{ marginTop: theme.marginXS }}>
                    {swapError && !errors.recipient && <Warning isDanger message={swapError.message} />}
                  </View>
                </>
              )}

              {!!fromTokenItems.length && !errors.recipient && renderAlertBox()}
              {tokenGroupSlug && !fromAssetInfo && (
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

            {!isFormInvalid && (
              <SwapQuoteDetailModal
                modalVisible={swapQuoteModalVisible}
                setModalVisible={setSwapQuoteModalVisible}
                minimumReceived={minimumReceived}
                symbol={_getAssetSymbol(toAssetInfo)}
                currentQuote={currentQuote}
                renderRateInfo={renderRateInfo}
                quoteAliveUntil={quoteAliveUntil}
                value={estimatedFeeValue}
                feeItems={feeItems}
                openChooseFeeToken={openChooseFeeToken}
                openSwapSelectorModal={openSwapSelectorModal}
                feeAssetInfo={feeAssetInfo}
                renderSlippage={renderSlippage}
                handleRequestLoading={handleRequestLoading}
                currencyData={currencyData}
                decimals={_getAssetDecimals(toAssetInfo)}
              />
            )}

            <SwapQuotesSelectorModal
              modalVisible={swapQuoteSelectorModalVisible}
              setModalVisible={setSwapQuoteSelectorModalVisible}
              items={quoteOptions}
              onSelectItem={onSelectQuote}
              selectedItem={currentQuote}
              optimalQuoteItem={optimalQuoteRef.current}
            />

            <ChooseFeeTokenModal
              modalVisible={chooseFeeModalVisible}
              setModalVisible={setChooseFeeModalVisible}
              items={feeOptions}
              estimatedFee={estimatedFeeValue}
              selectedItem={currentFeeOption}
              onSelectItem={onSelectFeeOption}
              currencyData={currencyData}
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
