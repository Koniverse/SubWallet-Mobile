import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { mmkvStore } from 'utils/storage';
import { SwapTermOfServiceModal } from 'components/Modal/TermModal/parts/SwapTermOfServiceModal';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { SwapFromField } from 'components/Swap/SwapFromField';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getAssetSymbol,
  _getChainNativeTokenSlug,
  _getOriginChainOfAsset,
  _isChainEvmCompatible,
  _parseAssetRefKey,
} from '@subwallet/extension-base/services/chain-service/utils';
import { Alert, AppState, Keyboard, ScrollView, TouchableOpacity, View } from 'react-native';
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
import { Icon, Typography, Number, ActivityIndicator, Button, Divider } from 'components/design-system-ui';
import { ArrowsDownUp, CaretRight, Info, PencilSimpleLine } from 'phosphor-react-native';
import { SlippageModal } from 'components/Modal/Swap/SlippageModal';
import MetaInfo from 'components/MetaInfo';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';
import { Warning } from 'components/Warning';
import { ChooseFeeTokenModal } from 'components/Modal/Swap/ChooseFeeTokenModal';
import { SwapQuoteDetailModal } from 'components/Modal/Swap/SwapQuoteDetailModal';
import { SwapQuotesSelectorModal } from 'components/Modal/Swap/SwapQuotesSelectorModal';
import {
  OptimalSwapPath,
  SlippageType,
  SwapFeeComponent,
  SwapFeeType,
  SwapProviderId,
  SwapQuote,
  SwapRequest,
  SwapStepType,
} from '@subwallet/extension-base/types/swap';
import {
  addLazy,
  formatNumberString,
  reformatAddress,
  removeLazy,
  swapCustomFormatter,
} from '@subwallet/extension-base/utils';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { findAccountByAddress } from 'utils/account';
import { getLatestSwapQuote, handleSwapRequest, handleSwapStep, validateSwapProcess } from 'messaging/swap';
import { DEFAULT_SWAP_PROCESS, SwapActionType, swapReducer } from 'reducers/swap';
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
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';

interface SwapFormValues extends TransactionFormValues {
  fromAmount: string;
  fromTokenSlug: string;
  toTokenSlug: string;
  recipient?: string;
  destChain: string;
}

function getTokenSelectorItem(tokenSlugs: string[], assetRegistryMap: Record<string, _ChainAsset>): TokenItemType[] {
  const result: TokenItemType[] = [];

  tokenSlugs.forEach(slug => {
    const asset = assetRegistryMap[slug];

    if (asset && asset.originChain !== 'hydradx_main') {
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

export const Swap = ({
  route: {
    params: { slug: tokenGroupSlug },
  },
}: SendFundProps) => {
  const { show, hideAll } = useToast();
  const theme = useSubWalletTheme().swThemes;
  const { assetRegistry: assetRegistryMap, multiChainAssetMap } = useSelector(
    (state: RootState) => state.assetRegistry,
  );
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { accounts, currentAccount, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const hasInternalConfirmations = useSelector((state: RootState) => state.requestState.hasInternalConfirmations);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const swapPairs = useSelector((state: RootState) => state.swap.swapPairs);
  const confirmTerm = mmkvStore.getBoolean('confirm-swap-term');
  const [termModalVisible, setTermModalVisible] = useState<boolean>(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const {
    title,
    form: {
      control,
      setValue,
      trigger,
      handleSubmit,
      formState: { dirtyFields, errors },
    },
    defaultValues,
    onChangeFromValue: setFrom,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<SwapFormValues>('swap', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      destChain: '',
    },
  });

  const fromValue = useWatch<SwapFormValues>({ name: 'from', control });
  const fromAmountValue = useWatch<SwapFormValues>({ name: 'fromAmount', control });
  const fromTokenSlugValue = useWatch<SwapFormValues>({ name: 'fromTokenSlug', control });
  const toTokenSlugValue = useWatch<SwapFormValues>({ name: 'toTokenSlug', control });
  const chainValue = useWatch<SwapFormValues>({ name: 'chain', control });
  const recipientValue = useWatch<SwapFormValues>({ name: 'recipient', control });
  const destChainValue = useWatch<SwapFormValues>({ name: 'destChain', control });
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const accountInfo = useGetAccountByAddress(fromValue);
  const [processState, dispatchProcessState] = useReducer(swapReducer, DEFAULT_SWAP_PROCESS);

  const destChainNetworkPrefix = useGetChainPrefixBySlug(destChainValue);
  const destChainGenesisHash = chainInfoMap[destChainValue]?.substrateInfo?.genesisHash || '';
  const accountSelectorRef = useRef<ModalRef>();
  const [showQuoteArea, setShowQuoteArea] = useState<boolean>(false);
  const [quoteOptions, setQuoteOptions] = useState<SwapQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(undefined);
  const [quoteAliveUntil, setQuoteAliveUntil] = useState<number | undefined>(undefined);
  const [currentQuoteRequest, setCurrentQuoteRequest] = useState<SwapRequest | undefined>(undefined);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const [currentOptimalSwapPath, setOptimalSwapPath] = useState<OptimalSwapPath | undefined>(undefined);
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const accountSelectorList = useMemo(() => {
    return accounts.filter(({ address }) => !isAccountAll(address));
  }, [accounts]);
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

  const rawFromTokenItems = useMemo<TokenItemType[]>(() => {
    return getTokenSelectorItem(Object.keys(fromAndToTokenMap), assetRegistryMap);
  }, [assetRegistryMap, fromAndToTokenMap]);

  const fromTokenItems = useMemo<TokenItemType[]>(() => {
    if (!fromValue) {
      return rawFromTokenItems;
    }

    return rawFromTokenItems.filter(i => {
      return (
        chainInfoMap[i.originChain] &&
        isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[i.originChain])
      );
    });
  }, [chainInfoMap, fromValue, rawFromTokenItems]);

  const filterFromAssetInfo = useMemo(() => {
    if (!fromTokenItems || !assetRegistryMap) {
      return [];
    }

    const filteredAssets = fromTokenItems
      .map(item => assetRegistryMap[item.slug])
      .filter(chainAsset => chainAsset.slug === tokenGroupSlug || chainAsset.multiChainAsset === tokenGroupSlug);

    return filteredAssets;
  }, [assetRegistryMap, fromTokenItems, tokenGroupSlug]);

  const fromTokenLists = useMemo(() => {
    return tokenGroupSlug ? filterFromAssetInfo : fromTokenItems;
  }, [tokenGroupSlug, filterFromAssetInfo, fromTokenItems]);

  const toTokenItems = useMemo<TokenItemType[]>(() => {
    return getTokenSelectorItem(fromAndToTokenMap[fromTokenSlugValue] || [], assetRegistryMap);
  }, [assetRegistryMap, fromAndToTokenMap, fromTokenSlugValue]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[fromTokenSlugValue] || undefined;
  }, [assetRegistryMap, fromTokenSlugValue]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[toTokenSlugValue] || undefined;
  }, [assetRegistryMap, toTokenSlugValue]);

  const feeAssetInfo = useMemo(() => {
    return currentFeeOption ? assetRegistryMap[currentFeeOption] : undefined;
  }, [assetRegistryMap, currentFeeOption]);

  const toChainValue = useMemo(() => _getAssetOriginChain(toAssetInfo), [toAssetInfo]);

  const isSwitchable = useMemo(() => {
    if (!fromAndToTokenMap[toTokenSlugValue]) {
      return false;
    }

    if (!fromValue) {
      return true;
    }

    const toChain = _getAssetOriginChain(toAssetInfo);

    return chainInfoMap[toChain] && isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[toChain]);
  }, [chainInfoMap, fromAndToTokenMap, fromValue, toAssetInfo, toTokenSlugValue]);

  const recipientAddressRules = useMemo(
    () => ({
      validate: (_recipientAddress: string): Promise<ValidateResult> => {
        if (!_recipientAddress) {
          return Promise.resolve('Recipient address is required');
        }

        if (!isAddress(_recipientAddress)) {
          return Promise.resolve(i18n.errorMessage.invalidRecipientAddress);
        }

        if (!isEthereumAddress(_recipientAddress)) {
          const destChainInfo = chainInfoMap[toAssetInfo.originChain];
          const addressPrefix = destChainInfo?.substrateInfo?.addressPrefix ?? 42;
          const _addressOnChain = reformatAddress(_recipientAddress, addressPrefix);

          if (_addressOnChain !== _recipientAddress) {
            return Promise.resolve(i18n.formatString(i18n.errorMessage.recipientAddressInvalid, destChainInfo.name));
          }
        }

        if (toAssetInfo && toAssetInfo?.originChain && chainInfoMap[toAssetInfo?.originChain]) {
          const isAddressEvm = isEthereumAddress(_recipientAddress);
          const isEvmCompatible = _isChainEvmCompatible(chainInfoMap[toAssetInfo?.originChain]);

          if (isAddressEvm !== isEvmCompatible) {
            return Promise.resolve('Invalid swap recipient account');
          }
        }

        const account = findAccountByAddress(accounts, _recipientAddress);

        if (account?.isHardware && toAssetInfo?.originChain) {
          const destChainInfo = chainInfoMap[toAssetInfo.originChain];
          const availableGen: string[] = account.availableGenesisHashes || [];

          if (
            !isEthereumAddress(account.address) &&
            !availableGen.includes(destChainInfo?.substrateInfo?.genesisHash || '')
          ) {
            const destChainName = destChainInfo?.name || 'Unknown';

            return Promise.resolve(
              `Wrong network. Your Ledger account is not supported by ${destChainName}. Please choose another receiving account and try again.`,
            );
          }
        }

        return Promise.resolve(undefined);
      },
    }),
    [accounts, chainInfoMap, toAssetInfo],
  );

  const getConvertedBalance = useCallback(
    (feeItem: SwapFeeComponent) => {
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

  const supportSlippageSelection = useMemo(() => {
    if (
      currentQuote?.provider.id === SwapProviderId.CHAIN_FLIP_TESTNET ||
      currentQuote?.provider.id === SwapProviderId.CHAIN_FLIP_MAINNET
    ) {
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

  const destinationSwapValue = useMemo(() => {
    if (currentQuote) {
      const decimals = _getAssetDecimals(fromAssetInfo);

      return new BigN(fromAmountValue || 0).div(BN_TEN.pow(decimals)).multipliedBy(currentQuote.rate);
    }

    return BN_ZERO;
  }, [currentQuote, fromAmountValue, fromAssetInfo]);

  const minimumReceived = useMemo(() => {
    const calcMinimumReceived = (value: BigN) => {
      const adjustedValue = supportSlippageSelection
        ? value
        : value.multipliedBy(new BigN(1).minus(currentSlippage.slippage));

      return adjustedValue.toString().includes('e')
        ? formatNumberString(adjustedValue.toString())
        : adjustedValue.toString();
    };

    return calcMinimumReceived(destinationSwapValue);
  }, [supportSlippageSelection, destinationSwapValue, currentSlippage.slippage]);

  const showRecipientField = useMemo(() => {
    if (fromValue && toAssetInfo?.originChain && chainInfoMap[toAssetInfo?.originChain]) {
      const isAddressEvm = isEthereumAddress(fromValue);
      const isEvmCompatibleTo = _isChainEvmCompatible(chainInfoMap[toAssetInfo?.originChain]);

      return isAddressEvm !== isEvmCompatibleTo;
    }

    return false; // Add a default return value in case none of the conditions are met
  }, [chainInfoMap, fromValue, toAssetInfo?.originChain]);

  const feeItems = useMemo(() => {
    const result: FeeItem[] = [];
    const feeTypeMap: Record<SwapFeeType, FeeItem> = {
      NETWORK_FEE: { label: 'Network fee', value: new BigN(0), prefix: '$', type: SwapFeeType.NETWORK_FEE },
      PLATFORM_FEE: { label: 'Protocol fee', value: new BigN(0), prefix: '$', type: SwapFeeType.PLATFORM_FEE },
      WALLET_FEE: { label: 'Wallet commission', value: new BigN(0), suffix: '%', type: SwapFeeType.WALLET_FEE },
    };

    currentQuote?.feeInfo.feeComponent.forEach(feeItem => {
      const { feeType } = feeItem;

      feeTypeMap[feeType].value = feeTypeMap[feeType].value.plus(getConvertedBalance(feeItem));
    });

    result.push(feeTypeMap.NETWORK_FEE, feeTypeMap.PLATFORM_FEE);

    return result;
  }, [currentQuote?.feeInfo.feeComponent, getConvertedBalance]);

  const canShowAvailableBalance = useMemo(() => {
    if (fromValue && chainValue && chainInfoMap[chainValue]) {
      return isEthereumAddress(fromValue) === _isChainEvmCompatible(chainInfoMap[chainValue]);
    }

    return false;
  }, [fromValue, chainValue, chainInfoMap]);

  const isSwapXCM = useMemo(() => {
    return processState.steps.some(item => item.type === SwapStepType.XCM);
  }, [processState.steps]);

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

  const isNotConnectedAltChain = useMemo(() => {
    if (altChain && !checkChainConnected(altChain)) {
      return true;
    }

    return false;
  }, [altChain, checkChainConnected]);

  const defaultFromValue = useMemo(() => {
    return currentAccount?.address ? (isAccountAll(currentAccount.address) ? '' : currentAccount.address) : '';
  }, [currentAccount?.address]);

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

  const onSelectSlippage = useCallback((slippage: SlippageType) => {
    setCurrentSlippage(slippage);
  }, []);

  const onSelectFeeOption = useCallback((slug: string) => {
    setCurrentFeeOption(slug);
    setChooseFeeModalVisible(false);
  }, []);

  const onSelectQuote = useCallback((quote: SwapQuote) => {
    setCurrentQuote(quote);
    setFeeOptions(quote.feeInfo.feeOptions);
    setCurrentFeeOption(quote.feeInfo.feeOptions?.[0]);
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
    if (!supportSlippageSelection) {
      setSlippageModalVisible(true);
    }
  }, [supportSlippageSelection]);

  const reValidateField = useCallback((name: string) => trigger(name), [trigger]);

  const onSwitchSide = useCallback(() => {
    if (fromTokenSlugValue && toTokenSlugValue) {
      setValue('fromTokenSlug', toTokenSlugValue);
      setValue('toTokenSlug', fromTokenSlugValue);

      Promise.all([reValidateField('from'), reValidateField('recipient')])
        .then(res => {
          if (!res.some(r => !r)) {
            setIsFormInvalid(false);
          } else {
            setIsFormInvalid(true);
          }
        })
        .catch(e => {
          console.log('Error when validating', e);
          setIsFormInvalid(true);
        });
    }
  }, [fromTokenSlugValue, reValidateField, setValue, toTokenSlugValue]);

  const renderSlippage = useCallback(() => {
    return (
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
          <Number
            size={14}
            value={supportSlippageSelection ? 0 : currentSlippage.slippage.multipliedBy(100).toString()}
            decimal={0}
            suffix={'%'}
            intColor={theme.colorSuccess}
            decimalColor={theme.colorSuccess}
            unitColor={theme.colorSuccess}
          />
          {!supportSlippageSelection && (
            <Icon phosphorIcon={PencilSimpleLine} size={'xs'} iconColor={theme.colorSuccess} weight={'bold'} />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [currentSlippage.slippage, onOpenSlippageModal, supportSlippageSelection, theme.colorSuccess, theme.sizeXXS]);

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

  const onError = useCallback(
    (error: Error) => {
      setTransactionDone(false);
      hideAll();
      show(error.message, { type: 'danger' });

      dispatchProcessState({
        type: SwapActionType.STEP_ERROR_ROLLBACK,
        payload: error,
      });
    },
    [hideAll, show],
  );

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, warnings } = rs;

        if (_errors.length || warnings.length) {
          if (_errors[0]?.message !== 'Rejected by user') {
            if (
              _errors[0]?.message.startsWith('UnknownError Connection to Indexed DataBase server lost') ||
              _errors[0]?.message.startsWith('Provided address is invalid, the capitalization checksum test failed') ||
              _errors[0]?.message.startsWith('connection not open on send()')
            ) {
              hideAll();
              show(
                'Your selected network has lost connection. Update it by re-enabling it or changing network provider',
                { type: 'danger' },
              );

              return false;
            }

            // hideAll();
            onError(_errors[0]);

            return false;
          } else {
            dispatchProcessState({
              type: needRollback ? SwapActionType.STEP_ERROR_ROLLBACK : SwapActionType.STEP_ERROR,
              payload: _errors[0],
            });
            setTransactionDone(false);
            return false;
          }
        } else if (id) {
          dispatchProcessState({
            type: SwapActionType.STEP_COMPLETE,
            payload: rs,
          });

          if (lastStep) {
            onDone(id);
            setTransactionDone(true);
            return false;
          }

          return true;
        } else {
          return false;
        }
      };
    },
    [hideAll, onDone, onError, show],
  );

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

        const submitData = async (step: number): Promise<boolean> => {
          dispatchProcessState({
            type: SwapActionType.STEP_SUBMIT,
            payload: null,
          });

          const isFirstStep = step === 0;
          const isLastStep = step === processState.steps.length - 1;
          const needRollback = step === 1;

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
                  type: SwapActionType.STEP_COMPLETE,
                  payload: true,
                });
                dispatchProcessState({
                  type: SwapActionType.STEP_SUBMIT,
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

              const submitPromise: Promise<SWTransactionResponse> = handleSwapStep({
                process: currentOptimalSwapPath,
                currentStep: step,
                quote: latestOptimalQuote,
                address: from,
                slippage: [SwapProviderId.CHAIN_FLIP_MAINNET, SwapProviderId.CHAIN_FLIP_TESTNET].includes(
                  latestOptimalQuote.provider.id,
                )
                  ? 0
                  : currentSlippage.slippage.toNumber(),
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
      currentSlippage.slippage,
      hideAll,
      onError,
      onSuccess,
      processState.currentStep,
      processState.steps.length,
      show,
    ],
  );

  useEffect(() => {
    if (!confirmTerm) {
      setTermModalVisible(true);
    }
  }, [confirmTerm]);

  useEffect(() => {
    const chain = _getAssetOriginChain(fromAssetInfo);
    setValue('chain', chain);
  }, [fromAssetInfo, setValue]);

  useEffect(() => {
    const destChain = _getAssetOriginChain(toAssetInfo);
    setValue('destChain', destChain);
  }, [toAssetInfo, setValue]);

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
                      type: SwapActionType.STEP_CREATE,
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
      setIsFormInvalid(false);
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
    if (fromTokenLists.length) {
      if (!fromTokenSlugValue) {
        setValue('fromTokenSlug', fromTokenLists[0].slug);
      } else {
        if (!fromTokenLists.some(item => item.slug === fromTokenSlugValue)) {
          setValue('fromTokenSlug', fromTokenLists[0].slug);
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
  }, [fromTokenLists, fromTokenSlugValue, onChangeAmount, setValue]);

  useEffect(() => {
    if (toTokenItems.length) {
      if (!toTokenSlugValue || !toTokenItems.some(t => t.slug === toTokenSlugValue)) {
        setValue('toTokenSlug', toTokenItems[0].slug);
      }
    }
  }, [setValue, toTokenItems, toTokenSlugValue]);

  useEffect(() => {
    if (defaultValues.from !== defaultFromValue && !isAllAccount) {
      setValue('from', defaultFromValue);
    }
  }, [defaultFromValue, defaultValues.from, isAllAccount, setValue]);

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

  useEffect(() => {
    if (fromValue && chainValue && destChainValue && dirtyFields.recipient) {
      addLazy(
        'trigger-validate-swap-to',
        () => {
          trigger('recipient');
        },
        100,
      );
    }

    return () => {
      removeLazy('trigger-validate-swap-to');
    };
  }, [chainValue, destChainValue, dirtyFields.recipient, fromValue, trigger]);

  const renderAlertBox = () => {
    const multichainAsset = fromAssetInfo?.multiChainAsset;
    const fromAssetName = multichainAsset && multiChainAssetMap[multichainAsset]?.name;
    const toAssetName = chainInfoMap[toAssetInfo?.originChain]?.name;

    return (
      <>
        {isSwapXCM && fromAssetName && toAssetName && (
          <AlertBox
            description={`The amount you entered is higher than your available balance on ${toAssetName} network. You need to first transfer cross-chain from ${fromAssetName} network to ${toAssetName} network to continue swapping`}
            title={'Action needed'}
            type={'warning'}
          />
        )}
      </>
    );
  };

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
              keyboardShouldPersistTaps={'handled'}>
              {isAllAccount && (
                <AccountSelector
                  items={accountSelectorList}
                  selectedValueMap={{ [fromValue]: true }}
                  accountSelectorRef={accountSelectorRef}
                  disabled={false}
                  onSelectItem={item => {
                    setFrom(item.address);
                    accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                  }}
                  renderSelected={() => (
                    <AccountSelectField
                      label={'Swap from account'}
                      accountName={accountInfo?.name || ''}
                      value={fromValue}
                      showIcon
                    />
                  )}
                />
              )}

              <SwapFromField
                fromAsset={fromAssetInfo}
                onChangeInput={onChangeAmount}
                assetValue={fromTokenSlugValue}
                chainValue={chainValue}
                tokenSelectorItems={fromTokenLists}
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
                  icon={<Icon phosphorIcon={ArrowsDownUp} size={'sm'} iconColor={theme.colorTextLight3} />}
                  shape={'circle'}
                />
              </View>

              <SwapToField
                toAsset={toAssetInfo}
                assetValue={toTokenSlugValue}
                chainValue={toChainValue}
                tokenSelectorItems={toTokenItems}
                swapValue={destinationSwapValue}
                chainInfo={chainInfoMap[toChainValue]}
                onSelectToken={onSelectToToken}
                loading={handleRequestLoading && showQuoteArea}
              />

              {showRecipientField && (
                <FormItem
                  name={'recipient'}
                  control={control}
                  rules={recipientAddressRules}
                  render={({ field: { value, ref, onChange, onBlur } }) => (
                    <InputAddress
                      containerStyle={{ marginTop: theme.marginXS }}
                      ref={ref}
                      label={'Recipient account'}
                      value={value}
                      onChangeText={onChange}
                      onSideEffectChange={onBlur}
                      onBlur={onBlur}
                      reValidate={() => reValidateField('recipient')}
                      placeholder={'Input your recipient account'}
                      addressPrefix={destChainNetworkPrefix}
                      networkGenesisHash={destChainGenesisHash}
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

              {showQuoteArea && !!fromTokenLists.length && (
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
                              <Number size={theme.fontSize} decimal={0} prefix={'$'} value={estimatedFeeValue} />
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

              {!!fromTokenLists.length && !errors.recipient && renderAlertBox()}
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
                onPress={handleSubmit(onSubmit)}
                disabled={
                  submitLoading ||
                  handleRequestLoading ||
                  isNotConnectedAltChain ||
                  !fromTokenLists.length ||
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
            />

            <SwapIdleWarningModal
              modalVisible={warningIdleModalVisible}
              setModalVisible={setWarningIdleModalVisible}
              onPressOk={onConfirmStillThere}
            />
          </TransactionLayout>
        </UserInactivity>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};
