// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetRef, _AssetType, _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import {
  _getAssetDecimals,
  _getAssetName,
  _getAssetOriginChain,
  _getAssetSymbol,
  _getContractAddressOfToken,
  _getMultiChainAsset,
  _getOriginChainOfAsset,
  _isChainEvmCompatible,
  _isNativeToken,
  _isTokenTransferredByEvm,
} from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { _reformatAddressWithChain, addLazy, removeLazy } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { BN, BN_ZERO } from '@polkadot/util';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { SendFundProps } from 'routes/transaction/transactionAction';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import {
  approveSpending,
  cancelSubscription,
  getOptimalTransferProcess,
  getTokensCanPayFee,
  isTonBounceableAddress,
  makeCrossChainTransfer,
  makeTransfer,
  saveRecentAccount,
  subscribeMaxTransfer,
} from 'messaging/index';
import { findAccountByAddress } from 'utils/account';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { balanceFormatter, formatBalance, formatNumber } from 'utils/number';
import { TokenItemType, TokenSelector } from 'components/Modal/common/TokenSelector';
import { isAccountAll } from 'utils/accountAll';
import { ChainInfo, ChainItemType } from 'types/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useWatch } from 'react-hook-form';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { AccountSelectField } from 'components/Field/AccountSelect';
import i18n from 'utils/i18n/i18n';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { InputAddress } from 'components/Input/InputAddress';
import { NetworkField } from 'components/Field/Network';
import { Button, Divider, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { FormItem } from 'components/common/FormItem';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { Amount, isInvalidAmountValue } from 'screens/Transaction/SendFund/Amount';
import { ArrowCircleRight, PaperPlaneRight, PaperPlaneTilt, Warning } from 'phosphor-react-native';
import { getButtonIcon } from 'utils/button';
import { UseControllerReturn } from 'react-hook-form/dist/types';
import { AmountValueConverter } from 'screens/Transaction/SendFund/AmountValueConverter';
import createStylesheet from './styles';
import { useGetBalance } from 'hooks/balance';
import { ModalRef } from 'types/modalRef';
import useChainAssets from 'hooks/chain/useChainAssets';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import {
  _getXcmUnstableWarning,
  _isMythosFromHydrationToMythos,
  _isXcmTransferUnstable,
} from '@subwallet/extension-base/core/substrate/xcm-parser';
import { AppModalContext } from 'providers/AppModalContext';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from 'reducers/transaction-process';
import useHandleSubmitMultiTransaction from 'hooks/transaction/useHandleSubmitMultiTransaction';
import { CommonStepType } from '@subwallet/extension-base/types/service-base';
import {
  getAvailBridgeGatewayContract,
  getSnowBridgeGatewayContract,
} from '@subwallet/extension-base/koni/api/contract-handler/utils';
import useFetchChainAssetInfo from 'hooks/screen/useFetchChainAssetInfo';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';
import { GlobalModalContext } from 'providers/GlobalModalContext';
import { AccountProxy, AccountProxyType, TransactionFee } from '@subwallet/extension-base/types';
import { AccountAddressItemType } from 'types/account';
import { getChainsByAccountType } from 'utils/chain';
import { getChainsByAccountAll } from 'utils/index';
import { SelectModalField } from 'components/common/SelectModal/parts/SelectModalField';
import { ActionType } from '@subwallet/extension-base/core/types';
import { validateRecipientAddress } from 'utils/core/logic-validation/recipientAddress';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import { FreeBalance } from '../parts/FreeBalance';
import { isAvailChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/availBridge';
import { _isPolygonChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polygonBridge';
import {
  _isPosChainBridge,
  _isPosChainL2Bridge,
} from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';
import { FeeEditor } from 'components/Modal/TransactionFee';
import { ResponseSubscribeTransfer } from '@subwallet/extension-base/types/balance/transfer';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import useReformatAddress from 'hooks/common/useReformatAddress';
import AlertBoxInstant from 'components/design-system-ui/alert-box/instant';

interface TransferFormValues extends TransactionFormValues {
  to: string;
  destChain: string;
  value: string;
}

type ViewStep = 1 | 2;

function getTokenItems(
  accountProxy: AccountProxy,
  accountProxies: AccountProxy[],
  chainInfoMap: Record<string, _ChainInfo>,
  assetRegistry: Record<string, _ChainAsset>,
  tokenGroupSlug?: string, // is ether a token slug or a multiChainAsset slug
): TokenItemType[] {
  let allowedChains: string[];

  if (!isAccountAll(accountProxy.id)) {
    allowedChains = getChainsByAccountType(chainInfoMap, accountProxy.chainTypes, accountProxy.specialChain);
  } else {
    allowedChains = getChainsByAccountAll(accountProxy, accountProxies, chainInfoMap);
  }

  const items: TokenItemType[] = [];

  Object.values(assetRegistry).forEach(chainAsset => {
    const originChain = _getAssetOriginChain(chainAsset);

    if (!allowedChains.includes(originChain)) {
      return;
    }

    if (!tokenGroupSlug || chainAsset.slug === tokenGroupSlug || _getMultiChainAsset(chainAsset) === tokenGroupSlug) {
      items.push({
        slug: chainAsset.slug,
        name: _getAssetName(chainAsset),
        symbol: _getAssetSymbol(chainAsset),
        originChain,
      });
    }
  });

  return items;
}

function getTokenAvailableDestinations(
  tokenSlug: string,
  xcmRefMap: Record<string, _AssetRef>,
  chainInfoMap: Record<string, _ChainInfo>,
): ChainItemType[] {
  if (!tokenSlug) {
    return [];
  }

  const result: ChainItemType[] = [];
  const originChain = chainInfoMap[_getOriginChainOfAsset(tokenSlug)];

  // Firstly, push the originChain of token
  result.push({
    name: originChain.name,
    slug: originChain.slug,
  });

  Object.values(xcmRefMap).forEach(xcmRef => {
    if (xcmRef.srcAsset === tokenSlug) {
      const destinationChain = chainInfoMap[xcmRef.destChain];

      result.push({
        name: destinationChain.name,
        slug: destinationChain.slug,
      });
    }
  });

  return result;
}

export const SendFund = ({
  route: {
    params: { slug: sendFundSlug, recipient: scanRecipient },
  },
}: SendFundProps) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const { show, hideAll } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [viewStep, setViewStep] = useState<ViewStep>(1);
  const [transactionDone, setTransactionDone] = useState<boolean>(false);
  const accountSelectorRef = useRef<ModalRef>();
  const tokenSelectorRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();

  const {
    title,
    form: { setValue, resetField, clearErrors, getValues, control, handleSubmit, trigger, setFocus },
    onChangeFromValue: setFrom,
    onChangeAssetValue: setAsset,
    onChangeChainValue: setChain,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<TransferFormValues>('send-fund', {
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      destChain: '',
      to: '',
    },
  });

  const {
    asset: assetValue,
    chain: chainValue,
    from: fromValue,
    to: toValue,
    destChain: destChainValue,
    value: transferAmount,
  } = {
    ...useWatch<TransferFormValues>({ control }),
    ...getValues(),
  };
  const scrollViewRef = useRef<ScrollView>(null);
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((root: RootState) => root.chainStore);
  const { xcmRefMap } = useSelector((root: RootState) => root.assetRegistry);
  const assetRegistry = useChainAssets().chainAssetRegistry;
  const { accountProxies, accounts, isAllAccount, currentAccountProxy } = useSelector(
    (state: RootState) => state.accountState,
  );
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('send-fund');
  const checkAction = usePreCheckAction(
    fromValue,
    true,
    'The account you are using is {{accountTitle}}, you cannot send assets with it',
  );
  const [loading, setLoading] = useState(false);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [isTransferBounceable, setTransferBounceable] = useState(false);
  const [, update] = useState({});
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [forceUpdateValue, setForceUpdateValue] = useState<{ value: string | null } | undefined>(undefined);
  const [transferInfo, setTransferInfo] = useState<ResponseSubscribeTransfer | undefined>();
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isFetchingListFeeToken, setIsFetchingListFeeToken] = useState(false);
  const forceTransferAllRef = useRef<boolean>(false);
  const [forceTransferAll, setForceTransferAll] = useState<boolean>(false);
  const estimatedNativeFee = useMemo((): string => transferInfo?.feeOptions.estimatedFee || '0', [transferInfo]);
  const { confirmModal } = useContext(AppModalContext);
  const globalAppModalContext = useContext(GlobalModalContext);
  const assetInfo = useFetchChainAssetInfo(assetValue);
  const getReformatAddress = useReformatAddress();
  const [listTokensCanPayFee, setListTokensCanPayFee] = useState<TokenHasBalanceInfo[]>([]);
  const [currentNonNativeTokenPayFee, setCurrentNonNativeTokenPayFee] = useState<string | undefined>(undefined);
  const [selectedTransactionFee, setSelectedTransactionFee] = useState<TransactionFee | undefined>();
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const isShowAddressFormatInfoBox = checkIsPolkadotUnifiedChain(chainValue);

  const currentConfirmations = useMemo(() => {
    if (chainValue && destChainValue) {
      return getCurrentConfirmation([chainValue, destChainValue]);
    } else {
      return undefined;
    }
  }, [chainValue, destChainValue, getCurrentConfirmation]);

  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);

  const triggerOnChangeValue = useCallback(() => {
    setForceUpdateValue({ value: transferAmount });
  }, [transferAmount]);

  const accountAddressItems = useMemo(() => {
    const chainInfo = chainValue ? chainInfoMap[chainValue] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    const updateResult = (ap: AccountProxy) => {
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
    };

    if (currentAccountProxy && isAccountAll(currentAccountProxy.id)) {
      accountProxies.forEach(ap => {
        if (isAccountAll(ap.id)) {
          return;
        }

        if ([AccountProxyType.READ_ONLY].includes(ap.accountType)) {
          return;
        }

        updateResult(ap);
      });
    } else {
      currentAccountProxy && updateResult(currentAccountProxy);
    }

    return result;
  }, [accountProxies, chainInfoMap, chainValue, currentAccountProxy, getReformatAddress]);

  const senderAccountName = useMemo(() => {
    if (!fromValue) {
      return i18n.inputLabel.selectAcc;
    }

    const targetAccount = accountAddressItems.find(a => a.address === fromValue);

    return targetAccount?.accountName || '';
  }, [accountAddressItems, fromValue]);

  const destChainItems = useMemo<ChainItemType[]>(() => {
    return getTokenAvailableDestinations(assetValue, xcmRefMap, chainInfoMap);
  }, [chainInfoMap, assetValue, xcmRefMap]);

  const currentChainAsset = useMemo(() => {
    return assetValue ? assetRegistry[assetValue] : undefined;
  }, [assetValue, assetRegistry]);

  const decimals = useMemo(() => {
    return currentChainAsset ? _getAssetDecimals(currentChainAsset) : 0;
  }, [currentChainAsset]);

  const extrinsicType = useMemo((): ExtrinsicType => {
    if (!currentChainAsset) {
      return ExtrinsicType.UNKNOWN;
    } else {
      if (chainValue !== destChainValue) {
        return ExtrinsicType.TRANSFER_XCM;
      } else {
        if (currentChainAsset.assetType === _AssetType.NATIVE) {
          return ExtrinsicType.TRANSFER_BALANCE;
        } else {
          return ExtrinsicType.TRANSFER_TOKEN;
        }
      }
    }
  }, [chainValue, currentChainAsset, destChainValue]);

  const {
    error: isGetBalanceError,
    isLoading: isGetBalanceLoading,
    nativeTokenBalance,
    nativeTokenSlug,
    tokenBalance,
  } = useGetBalance(chainValue, fromValue, assetValue, false, extrinsicType);

  const hideMaxButton = useMemo(() => {
    const _chainInfo = chainInfoMap[chainValue];

    if (_isPolygonChainBridge(chainValue, destChainValue) || _isPosChainBridge(chainValue, destChainValue)) {
      return true;
    }

    return (
      !!_chainInfo &&
      !!assetInfo &&
      _isChainEvmCompatible(_chainInfo) &&
      destChainValue === chainValue &&
      _isNativeToken(assetInfo)
    );
  }, [chainInfoMap, chainValue, assetInfo, destChainValue]);

  const disabledToAddressInput = useMemo(() => {
    if (_isPosChainL2Bridge(chainValue, destChainValue)) {
      return true;
    }

    return false;
  }, [chainValue, destChainValue]);

  const tokenItems = useMemo<TokenItemType[]>(() => {
    return currentAccountProxy
      ? getTokenItems(currentAccountProxy, accountProxies, chainInfoMap, assetRegistry, sendFundSlug)
      : [];
  }, [accountProxies, assetRegistry, chainInfoMap, sendFundSlug, currentAccountProxy]);

  const recipientAddressRules = useMemo(
    () => ({
      validate: async (
        _recipientAddress: string,
        { chain, destChain, from }: TransactionFormValues,
      ): Promise<ValidateResult> => {
        const destChainInfo = chainInfoMap[destChain];
        const account = findAccountByAddress(accounts, _recipientAddress);
        return validateRecipientAddress({
          srcChain: chain,
          destChainInfo,
          fromAddress: from,
          toAddress: _recipientAddress,
          account,
          actionType: ActionType.SEND_FUND,
          autoFormatValue: false,
          allowLedgerGenerics: ledgerGenericAllowNetworks,
        });
      },
    }),
    [accounts, chainInfoMap, ledgerGenericAllowNetworks],
  );

  const amountRules = useMemo(
    () => ({
      validate: (amount: string): Promise<ValidateResult> => {
        const maxTransfer = transferInfo?.maxTransferable || '0';

        if (isInvalidAmountValue(amount)) {
          scrollToBottom();
          return Promise.resolve(i18n.errorMessage.invalidAmount);
        }

        if (!amount) {
          scrollToBottom();
          return Promise.resolve(i18n.errorMessage.amountRequiredError);
        }

        if (new BigN(amount).eq(new BigN(0))) {
          scrollToBottom();
          return Promise.resolve(i18n.errorMessage.amountMustBeGreaterThanZero);
        }

        if (new BigN(amount).gt(new BigN(maxTransfer))) {
          scrollToBottom();
          const maxString = formatBalance(maxTransfer, decimals);

          return Promise.resolve(i18n.formatString(i18n.errorMessage.amountMustBeEqualOrLessThan, maxString));
        }

        return Promise.resolve(undefined);
      },
    }),
    [decimals, transferInfo?.maxTransferable],
  );

  const _onChangeFrom = (item: AccountAddressItemType) => {
    setFrom(item.address);
    accountSelectorRef?.current?.onCloseModal();
    resetField('asset');
    setForceUpdateValue(undefined);
    setIsTransferAll(false);
  };

  const _onChangeAsset = (item: TokenItemType) => {
    setAsset(item.slug);
    setValue('to', '');
    clearErrors('to');
    setValue('destChain', item.originChain);
    tokenSelectorRef?.current?.onCloseModal();
    setForceUpdateValue(undefined);
    setCurrentNonNativeTokenPayFee(undefined);
    setIsTransferAll(false);
  };

  const _onChangeDestChain = (item: ChainInfo) => {
    setValue('to', '');
    clearErrors('to');
    setValue('destChain', item.slug);
    chainSelectorRef?.current?.onCloseModal();
  };

  const onSubheaderPressBack = useCallback(() => {
    if (viewStep === 1) {
      navigation.goBack();
    } else {
      setTransferBounceable(false);
      setViewStep(1);
      resetField('value', {
        keepDirty: false,
        keepError: false,
        keepTouched: false,
      });
      setForceUpdateValue({ value: null });
      setIsTransferAll(false);
    }
  }, [navigation, resetField, viewStep]);

  const isShowWarningOnSubmit = useCallback(
    (values: TransferFormValues): boolean => {
      setLoading(true);
      const { asset, chain, destChain, from: _from } = values;

      const account = findAccountByAddress(accounts, _from);

      if (!account) {
        setLoading(false);
        hideAll();
        show("Can't find account", { type: 'danger' });

        return true;
      }

      const isLedger = !!account.isHardware;
      const isEthereum = isEthereumAddress(account.address);
      const chainAsset = assetRegistry[asset];

      if (chain === destChain) {
        if (isLedger) {
          if (isEthereum) {
            if (!_isTokenTransferredByEvm(chainAsset)) {
              setLoading(false);
              hideAll();
              show('Ledger does not support transfer for this token', { type: 'warning' });

              return true;
            }
          }
        }
      } else {
        if (isLedger) {
          setLoading(false);
          hideAll();
          show('This feature is not available for Ledger account', { type: 'warning' });
          return true;
        }
      }

      return false;
    },
    [accounts, assetRegistry, hideAll, show],
  );

  const handleBasicSubmit = useCallback(
    (values: TransferFormValues): Promise<SWTransactionResponse> => {
      const { asset, chain, destChain, from: _from, to, value } = values;

      let sendPromise: Promise<SWTransactionResponse>;
      const nonNativeTokenPayFeeSlug =
        currentNonNativeTokenPayFee !== nativeTokenSlug ? currentNonNativeTokenPayFee : undefined;
      const from = _from;

      if (chain === destChain) {
        // Transfer token or send fund
        sendPromise = makeTransfer({
          from,
          chain: chain,
          to: to,
          tokenSlug: asset,
          value: value,
          transferAll: isTransferAll,
          transferBounceable: isTransferBounceable,
          feeOption: selectedTransactionFee?.feeOption,
          feeCustom: selectedTransactionFee?.feeCustom,
          nonNativeTokenPayFeeSlug: nonNativeTokenPayFeeSlug,
        });
      } else {
        // Make cross chain transfer
        sendPromise = makeCrossChainTransfer({
          destinationNetworkKey: destChain,
          from,
          originNetworkKey: chain,
          tokenSlug: asset,
          to,
          value,
          transferAll: isTransferAll,
          transferBounceable: isTransferBounceable,
          feeOption: selectedTransactionFee?.feeOption,
          feeCustom: selectedTransactionFee?.feeCustom,
          nonNativeTokenPayFeeSlug: nonNativeTokenPayFeeSlug,
        });
      }

      return sendPromise;
    },
    [
      currentNonNativeTokenPayFee,
      isTransferAll,
      isTransferBounceable,
      nativeTokenSlug,
      selectedTransactionFee?.feeCustom,
      selectedTransactionFee?.feeOption,
    ],
  );

  const handleBridgeSpendingApproval = useCallback(
    (values: TransferFormValues): Promise<SWTransactionResponse> => {
      const isAvailBridge = isAvailChainBridge(values.destChain);

      const tokenInfo = assetRegistry[values.asset];

      return approveSpending({
        amount: values.value,
        contractAddress: _getContractAddressOfToken(tokenInfo),
        spenderAddress: isAvailBridge
          ? getAvailBridgeGatewayContract(values.chain)
          : getSnowBridgeGatewayContract(values.chain),
        chain: values.chain,
        owner: values.from,
      });
    },
    [assetRegistry],
  );

  const handleTransferAll = useCallback(
    (value: boolean) => {
      setForceTransferAll(value);
      setIsTransferAll(true);
      setForceUpdateValue({ value: transferInfo?.maxTransferable || '0' });
      forceTransferAllRef.current = true;
    },
    [transferInfo?.maxTransferable],
  );

  const { onError, onSuccess } = useHandleSubmitMultiTransaction(
    onDone,
    setTransactionDone,
    dispatchProcessState,
    triggerOnChangeValue,
    handleTransferAll,
  );

  const doSubmit = useCallback(
    (values: TransferFormValues) => {
      if (isShowWarningOnSubmit(values)) {
        return;
      }

      const submitData = async (step: number): Promise<boolean> => {
        dispatchProcessState({
          type: CommonActionType.STEP_SUBMIT,
          payload: null,
        });

        const isFirstStep = step === 0;
        const isLastStep = step === processState.steps.length - 1;
        const needRollback = step === 1;

        try {
          if (isFirstStep) {
            dispatchProcessState({
              type: CommonActionType.STEP_COMPLETE,
              payload: true,
            });
            dispatchProcessState({
              type: CommonActionType.STEP_SUBMIT,
              payload: null,
            });

            return await submitData(step + 1);
          } else {
            const stepType = processState.steps[step].type;
            const submitPromise: Promise<SWTransactionResponse> | undefined =
              stepType === CommonStepType.TOKEN_APPROVAL
                ? handleBridgeSpendingApproval(values)
                : handleBasicSubmit(values);

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
        // Handle transfer action
        submitData(processState.currentStep)
          .catch(e => {
            onError(e as Error);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300);
    },
    [
      handleBasicSubmit,
      handleBridgeSpendingApproval,
      isShowWarningOnSubmit,
      onError,
      onSuccess,
      processState.currentStep,
      processState.steps,
    ],
  );

  const onSetMaxTransferable = useCallback(() => {
    setFocus('value');
    setForceUpdateValue({ value: transferInfo?.maxTransferable || '0' });
    const bnMaxTransfer = new BN(transferInfo?.maxTransferable || '0');

    if (!bnMaxTransfer.isZero()) {
      setIsTransferAll(true);
    }
  }, [setFocus, transferInfo?.maxTransferable]);

  const onSetTokenPayFee = useCallback(
    (slug: string) => {
      setCurrentNonNativeTokenPayFee(slug);
    },
    [setCurrentNonNativeTokenPayFee],
  );

  const onSubmit = useCallback(
    async (values: TransferFormValues) => {
      Keyboard.dismiss();

      if (chainValue !== destChainValue) {
        const originChainInfo = chainInfoMap[chainValue];
        const destChainInfo = chainInfoMap[destChainValue];
        const assetSlug = values.asset;
        const isMythosFromHydrationToMythos = _isMythosFromHydrationToMythos(originChainInfo, destChainInfo, assetSlug);

        if (_isXcmTransferUnstable(originChainInfo, destChainInfo, assetSlug)) {
          confirmModal.setConfirmModal({
            visible: true,
            title: isMythosFromHydrationToMythos ? 'High fee alert!' : 'Pay attention!', // TODO: i18n
            message: _getXcmUnstableWarning(originChainInfo, destChainInfo, assetSlug),
            completeBtnTitle: 'Continue',
            customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
            onCompleteModal: () => {
              doSubmit(values);
              confirmModal.hideConfirmModal();
            },
            onCancelModal: () => {
              setLoading(false);
              confirmModal.hideConfirmModal();
            },
          });
          return;
        }
      }

      if (isTransferAll) {
        setForceTransferAll(true);
        forceTransferAllRef.current = true;

        return;
      }

      doSubmit(values);
    },
    [isTransferAll, doSubmit, chainValue, destChainValue, chainInfoMap, confirmModal, theme.colorWarning],
  );

  const onPressNextStep = useCallback(async () => {
    Keyboard.dismiss();
    setTimeout(
      () =>
        trigger('to').then(async pass => {
          if (pass) {
            if (TON_CHAINS.includes(chainValue)) {
              const isShowTonBouncealbeModal = await isTonBounceableAddress({ address: toValue, chain: chainValue });
              const chainInfo = chainInfoMap[destChainValue];
              if (isShowTonBouncealbeModal && !isTransferBounceable) {
                const bounceableAddressPrefix = toValue.substring(0, 2);
                const formattedAddress = _reformatAddressWithChain(toValue, chainInfo);
                const formattedAddressPrefix = formattedAddress.substring(0, 2);

                confirmModal.setConfirmModal({
                  visible: true,
                  title: 'Unsupported address',
                  message: `Transferring to an ${bounceableAddressPrefix} address is not supported. Continuing will result in a transfer to the corresponding ${formattedAddressPrefix} address (same seed phrase)`,
                  customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
                  completeBtnTitle: 'Continue',
                  onCompleteModal: () => {
                    setValue('to', formattedAddress, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    setTransferBounceable(true);
                    setViewStep(2);
                    confirmModal.hideConfirmModal();
                  },
                  onCancelModal: () => {
                    setLoading(false);
                    confirmModal.hideConfirmModal();
                  },
                });

                return;
              }
            }

            setViewStep(2);
          }
        }),
      200,
    );
  }, [
    chainInfoMap,
    chainValue,
    confirmModal,
    destChainValue,
    isTransferBounceable,
    setValue,
    theme.colorWarning,
    toValue,
    trigger,
  ]);

  const onPressSubmit = useCallback(
    (values: TransferFormValues) => {
      Keyboard.dismiss();
      setTimeout(() => {
        if (currentConfirmations && currentConfirmations.length) {
          globalAppModalContext.setGlobalModal({
            visible: true,
            title: currentConfirmations[0].name,
            message: currentConfirmations[0].content,
            type: 'confirmation',
            externalButtons: renderConfirmationButtons(globalAppModalContext.hideGlobalModal, () => {
              onSubmit(values);
              globalAppModalContext.hideGlobalModal();
            }),
          });
        } else {
          onSubmit(values);
        }
      }, 100);
    },
    [currentConfirmations, globalAppModalContext, onSubmit, renderConfirmationButtons],
  );

  const isSubmitButtonDisable = (() => {
    return !isBalanceReady || loading || (isTransferAll ? isFetchingInfo : false);
  })();

  const onInputChangeAmount = useCallback(() => {
    setIsTransferAll(false);
  }, []);

  const renderAmountInput = useCallback(
    ({ field: { onBlur, onChange, value, ref } }: UseControllerReturn<TransferFormValues>) => {
      return (
        <>
          <Amount
            ref={ref}
            value={value}
            forceUpdateValue={forceUpdateValue}
            onChangeValue={onChange}
            onInputChange={onInputChangeAmount}
            onBlur={onBlur}
            onSideEffectChange={onBlur}
            decimals={decimals}
            clearErrors={clearErrors}
            placeholder={'0'}
            showMaxButton
          />
          <AmountValueConverter
            value={isInvalidAmountValue(value) ? '0' : value || '0'}
            tokenSlug={assetValue}
            style={stylesheet.amountValueConverter}
          />
        </>
      );
    },
    [assetValue, clearErrors, decimals, forceUpdateValue, onInputChangeAmount, stylesheet.amountValueConverter],
  );

  useEffect(() => {
    setIsBalanceReady(!isGetBalanceLoading && !isGetBalanceError);
  }, [isGetBalanceError, isGetBalanceLoading]);

  useEffect(() => {
    if (scanRecipient) {
      setValue('to', scanRecipient, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [scanRecipient, setValue]);

  useEffect(() => {
    const { asset, from } = getValues();

    const updateInfoWithTokenSlug = (tokenSlug: string) => {
      const tokenInfo = assetRegistry[tokenSlug];

      setValue('asset', tokenSlug);
      setValue('chain', tokenInfo.originChain);
      setValue('destChain', tokenInfo.originChain);
      setChain(tokenInfo.originChain);
    };

    if (tokenItems.length) {
      let isApplyDefaultAsset = true;

      if (!asset) {
        const account = findAccountByAddress(accounts, from);

        if (account?.originGenesisHash) {
          const network = findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash);

          if (network) {
            const token = tokenItems.find(item => item.originChain === network.slug);

            if (token) {
              updateInfoWithTokenSlug(token.slug);
              isApplyDefaultAsset = false;
            }
          }
        }
      } else {
        // Apply default asset if current asset is not in token list
        isApplyDefaultAsset = !tokenItems.some(i => i.slug === asset);
      }

      if (isApplyDefaultAsset) {
        updateInfoWithTokenSlug(tokenItems[0].slug);
      }
    }
  }, [accounts, tokenItems, assetRegistry, setChain, chainInfoMap, getValues, setValue]);

  useEffect(() => {
    const updateFromValue = () => {
      if (!accountAddressItems.length) {
        return;
      }

      if (accountAddressItems.length === 1) {
        if (!fromValue || accountAddressItems[0].address !== fromValue) {
          setFrom(accountAddressItems[0].address);
        }
      } else {
        if (fromValue && !accountAddressItems.some(i => i.address === fromValue)) {
          setFrom('');
        }
      }
    };

    updateFromValue();
  }, [accountAddressItems, fromValue, setFrom]);

  // Get max transfer value
  useEffect(() => {
    let cancel = false;
    let id = '';
    // setIsFetchingMaxValue(false);
    setIsFetchingInfo(true);

    const validate = () => {
      const currentTransferValue = getValues('value');

      if (currentTransferValue) {
        setTimeout(() => {
          trigger('value').finally(() => update({}));
        }, 100);
      }
    };

    const callback = (_transferInfo: ResponseSubscribeTransfer) => {
      if (!cancel) {
        setTransferInfo(_transferInfo);

        id = _transferInfo.id;

        validate();
      } else {
        cancelSubscription(_transferInfo.id).catch(console.error);
      }
    };

    if (fromValue && assetValue) {
      subscribeMaxTransfer(
        {
          address: fromValue,
          chain: assetRegistry[assetValue].originChain,
          token: assetValue,
          destChain: destChainValue,
          feeOption: selectedTransactionFee?.feeOption,
          feeCustom: selectedTransactionFee?.feeCustom,
          nonNativeTokenPayFeeSlug:
            currentNonNativeTokenPayFee !== nativeTokenSlug ? currentNonNativeTokenPayFee : undefined,
        },
        callback,
      )
        .then(callback)
        .catch(e => {
          console.error('Error in subscribeMaxTransfer:', e);

          setTransferInfo(undefined);
          validate();
        })
        .finally(() => {
          setIsFetchingInfo(false);
        });
    }

    return () => {
      cancel = true;
      id && cancelSubscription(id).catch(console.error);
    };
  }, [
    assetRegistry,
    assetValue,
    currentNonNativeTokenPayFee,
    destChainValue,
    fromValue,
    getValues,
    nativeTokenSlug,
    selectedTransactionFee?.feeCustom,
    selectedTransactionFee?.feeOption,
    trigger,
  ]);

  useEffect(() => {
    const bnTransferAmount = new BN(isInvalidAmountValue(transferAmount) ? '0' : transferAmount || '0');
    const bnMaxTransfer = new BN(transferInfo?.maxTransferable || '0');

    if (bnTransferAmount.gt(BN_ZERO) && bnTransferAmount.eq(bnMaxTransfer)) {
      setIsTransferAll(true);
    }
  }, [transferAmount, transferInfo?.maxTransferable]);

  //TODO re-check and remove this useEffect
  useEffect(() => {
    if (scanRecipient) {
      if (isAddress(scanRecipient)) {
        saveRecentAccount(scanRecipient).catch(console.error);
      }
    }
  }, [scanRecipient]);

  useEffect(() => {
    addLazy('auto-focus-send-fund', () => {
      if (viewStep === 2) {
        setFocus('value');
      }
    });

    return () => {
      removeLazy('auto-focus-send-fund');
    };
  }, [setFocus, viewStep]);

  useEffect(() => {
    getOptimalTransferProcess({
      amount: transferAmount,
      address: fromValue,
      originChain: chainValue,
      tokenSlug: assetValue,
      destChain: destChainValue,
    })
      .then(result => {
        dispatchProcessState({
          payload: {
            steps: result.steps,
            feeStructure: result.totalFee,
          },
          type: CommonActionType.STEP_CREATE,
        });
      })
      .catch(e => {
        console.log('error', e);
      });
  }, [assetValue, chainValue, destChainValue, fromValue, transferAmount]);

  useEffect(() => {
    if (disabledToAddressInput) {
      setValue('to', fromValue);
      // TODO: update this useEffect when update autocomplete
    }
  }, [disabledToAddressInput, fromValue, setValue]);

  useEffect(() => {
    let cancel = false;

    const fetchTokens = async () => {
      setIsFetchingListFeeToken(true);
      setListTokensCanPayFee([]);

      try {
        const _response = await getTokensCanPayFee({
          chain: chainValue,
          address: fromValue,
        });

        const response = _response.filter(item => item !== null && item !== undefined);

        if (!cancel) {
          setListTokensCanPayFee(response);
          setTimeout(() => setIsFetchingListFeeToken(false), 300);
        }
      } catch (error) {
        if (!cancel) {
          setListTokensCanPayFee([]);
          setIsFetchingListFeeToken(false);
        }

        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens().catch(error => {
      console.error('Unhandled error in fetchTokens:', error);
    });

    return () => {
      cancel = true;
    };
  }, [chainValue, fromValue, nativeTokenBalance, nativeTokenSlug]);

  useEffect(() => {
    if (forceTransferAllRef.current && forceTransferAll) {
      forceTransferAllRef.current = false;
      let maxTransferDisplay: string;
      if (assetValue === nativeTokenSlug) {
        maxTransferDisplay = `${formatNumber(
          transferInfo?.maxTransferable || '0',
          nativeTokenBalance.decimals,
          balanceFormatter,
        )} ${nativeTokenBalance.symbol}`;
      } else {
        maxTransferDisplay = `${formatNumber(
          transferInfo?.maxTransferable || '0',
          tokenBalance.decimals,
          balanceFormatter,
        )} ${tokenBalance.symbol}`;
      }

      Alert.alert(
        'Pay attention!',
        "After performing this transaction, your account won't have enough balance to pay network fees for other transactions.",
        [
          {
            text: i18n.buttonTitles.cancel,
            onPress: () => {
              setForceTransferAll(false);
            },
          },
          {
            text: `Transfer ${maxTransferDisplay}`,
            onPress: () => {
              let currentValues = getValues();
              setForceTransferAll(false);
              setLoading(true);
              doSubmit(currentValues);
            },
          },
        ],
      );
    }
  }, [
    assetValue,
    doSubmit,
    forceTransferAll,
    getValues,
    nativeTokenBalance.decimals,
    nativeTokenBalance.symbol,
    nativeTokenSlug,
    tokenBalance.decimals,
    tokenBalance.symbol,
    transferInfo?.maxTransferable,
  ]);

  const isShowFeeEditor = useMemo(
    () => !TON_CHAINS.includes(chainValue) && !!toValue && !!transferAmount && !!nativeTokenSlug,
    [chainValue, nativeTokenSlug, toValue, transferAmount],
  );

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <>
      {!transactionDone ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScreenContainer>
            <>
              <Header disabled={loading} />

              <View style={stylesheet.subheader}>
                <SubHeader
                  title={viewStep === 1 ? title : i18n.common.amount}
                  onPressBack={onSubheaderPressBack}
                  disabled={loading}
                  titleTextAlign={'left'}
                />
              </View>

              <>
                <ScrollView
                  ref={scrollViewRef}
                  style={stylesheet.scrollView}
                  contentContainerStyle={stylesheet.scrollViewContentContainer}
                  keyboardShouldPersistTaps={'handled'}>
                  {viewStep === 1 ? (
                    <View style={stylesheet.row}>
                      <View style={stylesheet.rowItem}>
                        <TokenSelector
                          items={tokenItems}
                          selectedValueMap={{ [assetValue]: true }}
                          onSelectItem={_onChangeAsset}
                          showAddBtn={false}
                          tokenSelectorRef={tokenSelectorRef}
                          renderSelected={() => (
                            <TokenSelectField
                              logoKey={currentChainAsset?.slug || ''}
                              subLogoKey={currentChainAsset?.originChain || ''}
                              value={currentChainAsset?.symbol || ''}
                              outerStyle={{ marginBottom: 0 }}
                              showIcon
                            />
                          )}
                          disabled={!tokenItems.length || loading}
                        />
                      </View>

                      <View style={stylesheet.paperPlaneIconWrapper}>
                        <Icon phosphorIcon={PaperPlaneRight} size={'md'} iconColor={theme['gray-5']} />
                      </View>

                      <View style={stylesheet.rowItem}>
                        <ChainSelector
                          items={destChainItems}
                          selectedValueMap={{ [destChainValue]: true }}
                          chainSelectorRef={chainSelectorRef}
                          onSelectItem={_onChangeDestChain}
                          renderSelected={() => (
                            <NetworkField
                              networkKey={destChainValue}
                              outerStyle={{ marginBottom: 0 }}
                              placeholder={i18n.placeholder.selectChain}
                              showIcon
                            />
                          )}
                          disabled={!destChainItems.length || loading}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={stylesheet.row}>
                      <View style={stylesheet.rowItem}>
                        <SelectModalField
                          disabled={true}
                          renderSelected={() => (
                            <TokenSelectField
                              disabled={true}
                              logoKey={currentChainAsset?.slug || ''}
                              subLogoKey={currentChainAsset?.originChain || ''}
                              value={currentChainAsset?.symbol || ''}
                              outerStyle={{ marginBottom: 0 }}
                              showIcon
                            />
                          )}
                        />
                      </View>

                      <View style={stylesheet.paperPlaneIconWrapper}>
                        <Icon phosphorIcon={PaperPlaneRight} size={'md'} iconColor={theme['gray-5']} />
                      </View>

                      <View style={stylesheet.rowItem}>
                        <SelectModalField
                          disabled={true}
                          renderSelected={() => (
                            <NetworkField
                              disabled={true}
                              networkKey={destChainValue}
                              outerStyle={{ marginBottom: 0 }}
                              placeholder={i18n.placeholder.selectChain}
                              showIcon
                            />
                          )}
                        />
                      </View>
                    </View>
                  )}
                  {isAllAccount && viewStep === 1 && (
                    <View style={{ marginBottom: theme.marginSM }}>
                      <AccountSelector
                        items={accountAddressItems}
                        selectedValueMap={{ [fromValue]: true }}
                        onSelectItem={_onChangeFrom}
                        renderSelected={() => (
                          <AccountSelectField
                            label={'From:'}
                            horizontal
                            accountName={senderAccountName}
                            value={fromValue}
                            showIcon
                            labelStyle={{ width: 48 }}
                          />
                        )}
                        disabled={loading}
                        accountSelectorRef={accountSelectorRef}
                      />
                    </View>
                  )}

                  {viewStep === 1 && (
                    <>
                      <FormItem
                        style={{ marginBottom: theme.marginSM }}
                        control={control}
                        rules={recipientAddressRules}
                        render={({ field: { value, ref, onChange, onBlur }, formState: { errors } }) => (
                          <InputAddress
                            ref={ref}
                            label={'To:'}
                            value={value}
                            onChangeText={text => {
                              clearErrors('to');
                              onChange(text);
                            }}
                            isValidValue={!Object.keys(errors).length}
                            horizontal
                            showAvatar={false}
                            onBlur={onBlur}
                            onSideEffectChange={onBlur}
                            placeholder={i18n.placeholder.accountAddress}
                            disabled={loading || disabledToAddressInput}
                            chain={destChainValue}
                            fitNetwork
                            showAddressBook
                            saveAddress
                          />
                        )}
                        name="to"
                      />
                    </>
                  )}

                  {viewStep === 2 ? (
                    <View style={stylesheet.amountWrapper}>
                      <FormItem control={control} rules={amountRules} render={renderAmountInput} name="value" />
                    </View>
                  ) : (
                    <View style={stylesheet.balanceWrapper}>
                      <FreeBalance
                        address={fromValue}
                        chain={chainValue}
                        tokenSlug={assetValue}
                        extrinsicType={extrinsicType}
                        label={`${i18n.inputLabel.availableBalance}:`}
                        style={stylesheet.balance}
                      />

                      {chainValue !== destChainValue && (
                        <AlertBox
                          title={i18n.warningTitle.payAttention}
                          description={i18n.warningMessage.crossChainTransferWarningMessage}
                          type={'warning'}
                        />
                      )}

                      {!(chainValue !== destChainValue) && isShowAddressFormatInfoBox && (
                        <AlertBoxInstant type={'new-address-format'} />
                      )}
                    </View>
                  )}
                </ScrollView>

                <View style={stylesheet.footer}>
                  {viewStep === 1 && (
                    <Button
                      disabled={isSubmitButtonDisable}
                      icon={getButtonIcon(ArrowCircleRight)}
                      onPress={onPressNextStep}>
                      {i18n.buttonTitles.next}
                    </Button>
                  )}
                  {viewStep === 2 && (
                    <>
                      <View style={stylesheet.footerBalanceWrapper}>
                        <Divider />
                        <View style={{ flexDirection: 'row', paddingBottom: isShowFeeEditor ? 0 : theme.padding }}>
                          <FreeBalance
                            address={fromValue}
                            chain={chainValue}
                            tokenSlug={assetValue}
                            extrinsicType={extrinsicType}
                            label={`${i18n.inputLabel.availableBalance}:`}
                            style={stylesheet.balanceStep2}
                          />

                          {viewStep === 2 && !hideMaxButton && (
                            <TouchableOpacity onPress={onSetMaxTransferable} style={stylesheet.max}>
                              {<Typography.Text style={stylesheet.maxText}>{i18n.common.max}</Typography.Text>}
                            </TouchableOpacity>
                          )}
                        </View>
                        {viewStep === 2 && (
                          <>
                            {!TON_CHAINS.includes(chainValue) && !!toValue && !!transferAmount && !!nativeTokenSlug && (
                              <FeeEditor
                                chainValue={chainValue}
                                currentTokenPayFee={currentNonNativeTokenPayFee}
                                destChainValue={destChainValue}
                                estimateFee={estimatedNativeFee}
                                feeOptionsInfo={transferInfo?.feeOptions}
                                feePercentageSpecialCase={transferInfo?.feePercentageSpecialCase}
                                feeType={transferInfo?.feeType}
                                isLoadingFee={isFetchingInfo}
                                isLoadingToken={isFetchingListFeeToken}
                                listTokensCanPayFee={listTokensCanPayFee}
                                nativeTokenSlug={nativeTokenSlug}
                                onSelect={setSelectedTransactionFee}
                                onSetTokenPayFee={onSetTokenPayFee}
                                selectedFeeOption={selectedTransactionFee}
                                tokenPayFeeSlug={currentNonNativeTokenPayFee || nativeTokenSlug}
                                tokenSlug={assetValue}
                                modalVisible={false}
                                setModalVisible={() => {}}
                              />
                            )}
                          </>
                        )}
                      </View>
                      <Button
                        disabled={isSubmitButtonDisable}
                        loading={loading}
                        type={undefined}
                        onPress={checkAction(handleSubmit(onPressSubmit), extrinsicType)}
                        icon={getButtonIcon(PaperPlaneTilt)}>
                        {i18n.buttonTitles.transfer}
                      </Button>
                    </>
                  )}
                </View>
                <SafeAreaView />
              </>
            </>
          </ScreenContainer>
        </KeyboardAvoidingView>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={extrinsicType} />
      )}
    </>
  );
};
