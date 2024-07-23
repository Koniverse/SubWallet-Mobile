// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _AssetRef, _AssetType, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import { AssetSetting, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import {
  _getAssetDecimals,
  _getContractAddressOfToken,
  _getOriginChainOfAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
  _isNativeToken,
  _isTokenTransferredByEvm,
} from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { addLazy, isSameAddress, reformatAddress, removeLazy } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { SendFundProps } from 'routes/transaction/transactionAction';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import {
  approveSpending,
  getMaxTransfer,
  getOptimalTransferProcess,
  makeCrossChainTransfer,
  makeTransfer,
  saveRecentAccountId,
} from 'messaging/index';
import { findAccountByAddress } from 'utils/account';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { balanceFormatter, formatBalance, formatNumber } from 'utils/number';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
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
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
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
import { FreeBalanceDisplay } from 'screens/Transaction/parts/FreeBalanceDisplay';
import { ModalRef } from 'types/modalRef';
import useChainAssets from 'hooks/chain/useChainAssets';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { _getXcmUnstableWarning, _isXcmTransferUnstable } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { AppModalContext } from 'providers/AppModalContext';
import { CommonActionType, commonProcessReducer, DEFAULT_COMMON_PROCESS } from 'reducers/transaction-process';
import useHandleSubmitMultiTransaction from 'hooks/transaction/useHandleSubmitMultiTransaction';
import { CommonStepType } from '@subwallet/extension-base/types/service-base';
import { getSnowBridgeGatewayContract } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import useFetchChainAssetInfo from 'hooks/screen/useFetchChainAssetInfo';

interface TransferFormValues extends TransactionFormValues {
  to: string;
  destChain: string;
  value: string;
}

type ViewStep = 1 | 2;

function isAssetTypeValid(
  chainAsset: _ChainAsset,
  chainInfoMap: Record<string, _ChainInfo>,
  isAccountEthereum: boolean,
) {
  return _isChainEvmCompatible(chainInfoMap[chainAsset.originChain]) === isAccountEthereum;
}

function getTokenItems(
  address: string,
  accounts: AccountJson[],
  chainInfoMap: Record<string, _ChainInfo>,
  assetRegistry: Record<string, _ChainAsset>,
  assetSettingMap: Record<string, AssetSetting>,
  multiChainAssetMap: Record<string, _MultiChainAsset>,
  tokenGroupSlug?: string, // is ether a token slug or a multiChainAsset slug
): TokenItemType[] {
  const account = findAccountByAddress(accounts, address);

  if (!account) {
    return [];
  }

  const isLedger = !!account.isHardware;
  const validGen: string[] = account.availableGenesisHashes || [];
  const validLedgerNetwork = validGen.map(genesisHash => findNetworkJsonByGenesisHash(chainInfoMap, genesisHash)?.slug);
  const isAccountEthereum = isEthereumAddress(address);
  const isSetTokenSlug = !!tokenGroupSlug && !!assetRegistry[tokenGroupSlug];
  const isSetMultiChainAssetSlug = !!tokenGroupSlug && !!multiChainAssetMap[tokenGroupSlug];

  if (tokenGroupSlug) {
    if (!(isSetTokenSlug || isSetMultiChainAssetSlug)) {
      return [];
    }

    const chainAsset = assetRegistry[tokenGroupSlug];
    const isValidLedger = isLedger ? isAccountEthereum || validLedgerNetwork.includes(chainAsset?.originChain) : true;

    if (isSetTokenSlug) {
      if (isAssetTypeValid(chainAsset, chainInfoMap, isAccountEthereum) && isValidLedger) {
        const { name, originChain, slug, symbol } = assetRegistry[tokenGroupSlug];

        return [
          {
            name,
            slug,
            symbol,
            originChain,
          },
        ];
      } else {
        return [];
      }
    }
  }

  const items: TokenItemType[] = [];

  Object.values(assetRegistry).forEach(chainAsset => {
    const isValidLedger = isLedger ? isAccountEthereum || validLedgerNetwork.includes(chainAsset?.originChain) : true;
    const isTokenFungible = _isAssetFungibleToken(chainAsset);

    if (!(isTokenFungible && isAssetTypeValid(chainAsset, chainInfoMap, isAccountEthereum) && isValidLedger)) {
      return;
    }

    if (isSetMultiChainAssetSlug) {
      if (chainAsset.multiChainAsset === tokenGroupSlug) {
        items.push({
          name: chainAsset.name,
          slug: chainAsset.slug,
          symbol: chainAsset.symbol,
          originChain: chainAsset.originChain,
        });
      }
    } else {
      items.push({
        name: chainAsset.name,
        slug: chainAsset.slug,
        symbol: chainAsset.symbol,
        originChain: chainAsset.originChain,
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

function getTokenItemsForViewStep2(
  originTokenItems: TokenItemType[],
  xcmRefMap: Record<string, _AssetRef>,
  chainInfoMap: Record<string, _ChainInfo>,
  senderAddress: string,
  recipientAddress: string,
) {
  const isRecipientAddressEvmType = isEthereumAddress(recipientAddress);
  const isFromAndToSameType = isEthereumAddress(senderAddress) === isEthereumAddress(recipientAddress);

  return originTokenItems.filter(ti => {
    if (isFromAndToSameType && _isChainEvmCompatible(chainInfoMap[ti.originChain]) === isRecipientAddressEvmType) {
      return true;
    }

    for (let xKey in xcmRefMap) {
      if (!xcmRefMap.hasOwnProperty(xKey)) {
        continue;
      }

      const xcmRef = xcmRefMap[xKey];
      if (xcmRef.srcAsset === ti.slug) {
        const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[xcmRef.destChain]);
        if (isDestChainEvmCompatible === isRecipientAddressEvmType) {
          return true;
        }
      }
    }

    return false;
  });
}

function getTokenAvailableDestinationsForViewStep2(
  originChainItems: ChainItemType[],
  chainInfoMap: Record<string, _ChainInfo>,
  senderAddress: string,
  recipientAddress: string,
  chainValue: string,
) {
  const isRecipientAddressEvmType = isEthereumAddress(recipientAddress);
  const _isSameAddress = isSameAddress(senderAddress, recipientAddress);

  return originChainItems.filter(ci => {
    if (_isSameAddress && chainValue === ci.slug) {
      return false;
    }

    const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[ci.slug]);
    return isDestChainEvmCompatible === isRecipientAddressEvmType;
  });
}

const defaultFilterAccount = (account: AccountJson): boolean => !(isAccountAll(account.address) || account.isReadOnly);

const filterAccountFunc = (
  chainInfoMap: Record<string, _ChainInfo>,
  assetRegistry: Record<string, _ChainAsset>,
  multiChainAssetMap: Record<string, _MultiChainAsset>,
  tokenGroupSlug?: string, // is ether a token slug or a multiChainAsset slug
): ((account: AccountJson) => boolean) => {
  const isSetTokenSlug = !!tokenGroupSlug && !!assetRegistry[tokenGroupSlug];
  const isSetMultiChainAssetSlug = !!tokenGroupSlug && !!multiChainAssetMap[tokenGroupSlug];

  if (!tokenGroupSlug) {
    return defaultFilterAccount;
  }

  const chainAssets = Object.values(assetRegistry).filter(chainAsset => {
    const isTokenFungible = _isAssetFungibleToken(chainAsset);

    if (isTokenFungible) {
      if (isSetTokenSlug) {
        return chainAsset.slug === tokenGroupSlug;
      }

      if (isSetMultiChainAssetSlug) {
        return chainAsset.multiChainAsset === tokenGroupSlug;
      }
    } else {
      return false;
    }

    return false;
  });

  return (account: AccountJson): boolean => {
    const isLedger = !!account.isHardware;
    const isAccountEthereum = isEthereumAddress(account.address);
    const validGen: string[] = account.availableGenesisHashes || [];
    const validLedgerNetwork =
      validGen.map(genesisHash => findNetworkJsonByGenesisHash(chainInfoMap, genesisHash)?.slug) || [];

    if (!defaultFilterAccount(account)) {
      return false;
    }

    return chainAssets.some(chainAsset => {
      const isValidLedger = isLedger ? isAccountEthereum || validLedgerNetwork.includes(chainAsset?.originChain) : true;

      return isAssetTypeValid(chainAsset, chainInfoMap, isAccountEthereum) && isValidLedger;
    });
  };
};

export const SendFund = ({
  route: {
    params: { slug: tokenGroupSlug, recipient: scanRecipient },
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
    form: {
      setValue,
      resetField,
      getValues,
      control,
      handleSubmit,
      trigger,
      setFocus,
      formState: { errors, dirtyFields },
    },
    onChangeFromValue: setFrom,
    onChangeAssetValue: setAsset,
    onChangeChainValue: setChain,
    onTransactionDone: onDone,
    transactionDoneInfo,
    checkChainConnected,
  } = useTransaction<TransferFormValues>('send-fund', {
    mode: 'onBlur',
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

  const { chainInfoMap, chainStatusMap } = useSelector((root: RootState) => root.chainStore);
  const { assetSettingMap, multiChainAssetMap, xcmRefMap } = useSelector((root: RootState) => root.assetRegistry);
  const assetRegistry = useChainAssets().chainAssetRegistry;
  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const [maxTransfer, setMaxTransfer] = useState<string>('0');
  const checkAction = usePreCheckAction(
    fromValue,
    true,
    'The account you are using is {{accountTitle}}, you cannot send assets with it',
  );
  const [loading, setLoading] = useState(false);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [, update] = useState({});
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [forceUpdateValue, setForceUpdateValue] = useState<{ value: string | null } | undefined>(undefined);
  const forceTransferAllRef = useRef<boolean>(false);
  const [forceTransferAll, setForceTransferAll] = useState<boolean>(false);
  const chainStatus = useMemo(() => chainStatusMap[chainValue]?.connectionStatus, [chainStatusMap, chainValue]);
  const appModalContext = useContext(AppModalContext);
  const assetInfo = useFetchChainAssetInfo(assetValue);

  const [processState, dispatchProcessState] = useReducer(commonProcessReducer, DEFAULT_COMMON_PROCESS);

  const senderAccountName = useMemo(() => {
    if (!fromValue) {
      return i18n.inputLabel.selectAcc;
    }

    const targetAccount = accounts.find(a => a.address === fromValue);

    return targetAccount?.name || '';
  }, [accounts, fromValue]);

  const triggerOnChangeValue = useCallback(() => {
    setForceUpdateValue({ value: transferAmount });
  }, [transferAmount]);

  const accountItems = useMemo(() => {
    return accounts.filter(filterAccountFunc(chainInfoMap, assetRegistry, multiChainAssetMap, tokenGroupSlug));
  }, [accounts, assetRegistry, chainInfoMap, multiChainAssetMap, tokenGroupSlug]);

  const destChainItems = useMemo<ChainItemType[]>(() => {
    return getTokenAvailableDestinations(assetValue, xcmRefMap, chainInfoMap);
  }, [assetValue, xcmRefMap, chainInfoMap]);

  const destChainItemsViewStep2 = useMemo<ChainItemType[]>(() => {
    if (viewStep !== 2) {
      return [];
    }

    return getTokenAvailableDestinationsForViewStep2(destChainItems, chainInfoMap, fromValue, toValue, chainValue);
  }, [viewStep, destChainItems, chainInfoMap, fromValue, toValue, chainValue]);

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

  // const fromChainNetworkPrefix = useGetChainPrefixBySlug(chainValue); // will use it for account selector later
  const destChainNetworkPrefix = useGetChainPrefixBySlug(destChainValue);
  const destChainGenesisHash = chainInfoMap[destChainValue]?.substrateInfo?.genesisHash || '';

  const hideMaxButton = useMemo(() => {
    const _chainInfo = chainInfoMap[chainValue];

    return (
      !!_chainInfo &&
      !!assetInfo &&
      _isChainEvmCompatible(_chainInfo) &&
      destChainValue === chainValue &&
      _isNativeToken(assetInfo)
    );
  }, [chainInfoMap, chainValue, assetInfo, destChainValue]);

  const tokenItems = useMemo<TokenItemType[]>(() => {
    return getTokenItems(
      fromValue,
      accounts,
      chainInfoMap,
      assetRegistry,
      assetSettingMap,
      multiChainAssetMap,
      tokenGroupSlug,
    ).sort((a, b) => {
      if (checkChainConnected(a.originChain)) {
        if (checkChainConnected(b.originChain)) {
          return 0;
        } else {
          return -1;
        }
      } else {
        if (checkChainConnected(b.originChain)) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }, [
    accounts,
    assetRegistry,
    assetSettingMap,
    chainInfoMap,
    checkChainConnected,
    fromValue,
    multiChainAssetMap,
    tokenGroupSlug,
  ]);

  const tokenItemsViewStep2 = useMemo(() => {
    if (viewStep !== 2 || !fromValue || !toValue) {
      return [];
    }

    return getTokenItemsForViewStep2(tokenItems, xcmRefMap, chainInfoMap, fromValue, toValue).sort((a, b) => {
      if (checkChainConnected(a.originChain)) {
        if (checkChainConnected(b.originChain)) {
          return 0;
        } else {
          return -1;
        }
      } else {
        if (checkChainConnected(b.originChain)) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }, [chainInfoMap, checkChainConnected, fromValue, toValue, tokenItems, viewStep, xcmRefMap]);

  const recipientAddressRules = useMemo(
    () => ({
      validate: (
        _recipientAddress: string,
        { chain, destChain, from }: TransactionFormValues,
      ): Promise<ValidateResult> => {
        if (!_recipientAddress) {
          return Promise.resolve(i18n.errorMessage.recipientAddressIsRequired);
        }

        if (!isAddress(_recipientAddress)) {
          return Promise.resolve(i18n.errorMessage.invalidRecipientAddress);
        }

        if (!from || !chain || !destChain) {
          return Promise.resolve(undefined);
        }

        const isOnChain = chain === destChain;

        if (!isEthereumAddress(_recipientAddress)) {
          const destChainInfo = chainInfoMap[destChain];
          const addressPrefix = destChainInfo?.substrateInfo?.addressPrefix ?? 42;
          const _addressOnChain = reformatAddress(_recipientAddress, addressPrefix);

          if (_addressOnChain !== _recipientAddress) {
            return Promise.resolve(i18n.formatString(i18n.errorMessage.recipientAddressInvalid, destChainInfo.name));
          }
        }

        const account = findAccountByAddress(accounts, _recipientAddress);

        if (isOnChain) {
          if (isSameAddress(from, _recipientAddress)) {
            return Promise.resolve(i18n.errorMessage.sameAddressError);
          }

          const isNotSameAddressType =
            (isEthereumAddress(from) && !!_recipientAddress && !isEthereumAddress(_recipientAddress)) ||
            (!isEthereumAddress(from) && !!_recipientAddress && isEthereumAddress(_recipientAddress));

          if (isNotSameAddressType) {
            return Promise.resolve(i18n.errorMessage.notSameAddressTypeError);
          }
        } else {
          const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[destChain]);

          if (isDestChainEvmCompatible !== isEthereumAddress(_recipientAddress)) {
            return Promise.resolve(
              i18n.formatString(
                i18n.errorMessage.recipientAddressMustBeType,
                isDestChainEvmCompatible ? 'EVM' : 'substrate',
              ),
            );
          }
        }

        if (account?.isHardware) {
          const destChainInfo = chainInfoMap[destChain];
          const availableGen: string[] = account.availableGenesisHashes || [];

          if (
            !isEthereumAddress(account.address) &&
            !availableGen.includes(destChainInfo?.substrateInfo?.genesisHash || '')
          ) {
            const destChainName = destChainInfo?.name || 'Unknown';

            return Promise.resolve(
              `'Wrong network. Your Ledger account is not supported by ${destChainName}. Please choose another receiving account and try again.'`,
            );
          }
        }

        return Promise.resolve(undefined);
      },
    }),
    [accounts, chainInfoMap],
  );

  const amountRules = useMemo(
    () => ({
      validate: (amount: string): Promise<ValidateResult> => {
        if (isInvalidAmountValue(amount)) {
          return Promise.resolve(i18n.errorMessage.invalidAmount);
        }

        if (!amount) {
          return Promise.resolve(i18n.errorMessage.amountRequiredError);
        }

        if (new BigN(amount).eq(new BigN(0))) {
          return Promise.resolve(i18n.errorMessage.amountMustBeGreaterThanZero);
        }

        if (new BigN(amount).gt(new BigN(maxTransfer))) {
          const maxString = formatBalance(maxTransfer, decimals);

          return Promise.resolve(i18n.formatString(i18n.errorMessage.amountMustBeEqualOrLessThan, maxString));
        }

        return Promise.resolve(undefined);
      },
    }),
    [decimals, maxTransfer],
  );

  const _onChangeFrom = (item: AccountJson) => {
    setFrom(item.address);
    accountSelectorRef?.current?.onCloseModal();
    resetField('asset');
    setForceUpdateValue(undefined);
    setIsTransferAll(false);
  };

  const _onChangeAsset = (item: TokenItemType) => {
    setAsset(item.slug);
    const currentDestChainItems = getTokenAvailableDestinationsForViewStep2(
      destChainItems,
      chainInfoMap,
      fromValue,
      toValue,
      item.originChain,
    );

    if (viewStep === 2) {
      if (currentDestChainItems.some(destChainItem => destChainItem.slug === item.originChain)) {
        setValue('destChain', item.originChain);
      } else {
        setValue('destChain', '');
      }
    } else {
      setValue('destChain', item.originChain);
    }

    tokenSelectorRef?.current?.onCloseModal();
    setForceUpdateValue(undefined);
    setIsTransferAll(false);
  };

  const _onChangeDestChain = (item: ChainInfo) => {
    setValue('destChain', item.slug);
    chainSelectorRef?.current?.onCloseModal();
  };

  const onSubheaderPressBack = useCallback(() => {
    if (viewStep === 1) {
      navigation.goBack();
    } else {
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

      const currentChainInfo = chainInfoMap[chain];
      const addressPrefix = currentChainInfo?.substrateInfo?.addressPrefix ?? 42;
      const from = reformatAddress(_from, addressPrefix);

      if (chain === destChain) {
        // Transfer token or send fund
        sendPromise = makeTransfer({
          from,
          networkKey: chain,
          to: to,
          tokenSlug: asset,
          value: value,
          transferAll: isTransferAll,
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
        });
      }

      return sendPromise;
    },
    [chainInfoMap, isTransferAll],
  );

  const handleSnowBridgeSpendingApproval = useCallback(
    (values: TransferFormValues): Promise<SWTransactionResponse> => {
      const tokenInfo = assetRegistry[values.asset];

      return approveSpending({
        amount: values.value,
        contractAddress: _getContractAddressOfToken(tokenInfo),
        spenderAddress: getSnowBridgeGatewayContract(values.chain),
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
      setForceUpdateValue({ value: maxTransfer });
      forceTransferAllRef.current = true;
    },
    [maxTransfer],
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
                ? handleSnowBridgeSpendingApproval(values)
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
      handleSnowBridgeSpendingApproval,
      isShowWarningOnSubmit,
      onError,
      onSuccess,
      processState.currentStep,
      processState.steps,
    ],
  );

  const onSetMaxTransferable = useCallback(() => {
    setFocus('value');
    setForceUpdateValue({ value: maxTransfer });
    const bnMaxTransfer = new BN(maxTransfer);

    if (!bnMaxTransfer.isZero()) {
      setIsTransferAll(true);
    }
  }, [maxTransfer, setFocus]);

  const onSubmit = useCallback(
    (values: TransferFormValues) => {
      Keyboard.dismiss();

      if (chainValue !== destChainValue) {
        const originChainInfo = chainInfoMap[chainValue];
        const destChainInfo = chainInfoMap[destChainValue];
        if (_isXcmTransferUnstable(originChainInfo, destChainInfo)) {
          appModalContext.setConfirmModal({
            visible: true,
            title: 'Pay attention!',
            message: _getXcmUnstableWarning(originChainInfo, destChainInfo),
            completeBtnTitle: 'Continue',
            customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
            onCompleteModal: () => {
              doSubmit(values);
              appModalContext.hideConfirmModal();
            },
            onCancelModal: () => appModalContext.hideConfirmModal(),
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
    [appModalContext, chainInfoMap, chainValue, destChainValue, doSubmit, isTransferAll, theme.colorWarning],
  );

  const isNextButtonDisable = (() => {
    if (!isBalanceReady || !fromValue || !assetValue || !destChainValue || !toValue) {
      return true;
    }

    return !!errors.to;
  })();

  const isSubmitButtonDisable = (() => {
    return loading || isNextButtonDisable || !transferAmount || !!errors.value;
  })();

  const onInputChangeAmount = useCallback(() => {
    setIsTransferAll(false);
  }, []);

  const reValidate = () => trigger('to');

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
    [assetValue, decimals, forceUpdateValue, onInputChangeAmount, stylesheet.amountValueConverter],
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

  // Get max transfer value
  useEffect(() => {
    let cancel = false;

    if (fromValue && assetValue) {
      getMaxTransfer({
        address: fromValue,
        networkKey: assetRegistry[assetValue].originChain,
        token: assetValue,
        isXcmTransfer: chainValue !== destChainValue,
        destChain: destChainValue,
      })
        .then(balance => {
          !cancel && setMaxTransfer(balance.value);
        })
        .catch(() => {
          !cancel && setMaxTransfer('0');
        })
        .finally(() => {
          if (!cancel) {
            const value = getValues('value');

            if (value) {
              setTimeout(() => {
                trigger('value').finally(() => update({}));
              }, 100);
            }
          }
        });
    }

    return () => {
      cancel = true;
    };
  }, [assetValue, assetRegistry, chainStatus, chainValue, destChainValue, fromValue, getValues, trigger]);

  useEffect(() => {
    const bnTransferAmount = new BN(isInvalidAmountValue(transferAmount) ? '0' : transferAmount || '0');
    const bnMaxTransfer = new BN(maxTransfer || '0');

    if (bnTransferAmount.gt(BN_ZERO) && bnTransferAmount.eq(bnMaxTransfer)) {
      setIsTransferAll(true);
    }
  }, [maxTransfer, transferAmount]);

  useEffect(() => {
    if (scanRecipient) {
      if (isAddress(scanRecipient)) {
        saveRecentAccountId(scanRecipient).catch(console.error);
      }
    }
  }, [scanRecipient]);

  useEffect(() => {
    if (fromValue && chainValue && destChainValue && dirtyFields.to) {
      addLazy(
        'trigger-validate-send-fund-to',
        () => {
          trigger('to');
        },
        100,
      );
    }

    return () => {
      removeLazy('trigger-validate-send-fund-to');
    };
  }, [chainValue, destChainValue, dirtyFields.to, fromValue, trigger]);

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
    if (forceTransferAllRef.current && forceTransferAll) {
      forceTransferAllRef.current = false;
      let maxTransferDisplay: string;
      if (assetValue === nativeTokenSlug) {
        maxTransferDisplay = `${formatNumber(maxTransfer, nativeTokenBalance.decimals, balanceFormatter)} ${
          nativeTokenBalance.symbol
        }`;
      } else {
        maxTransferDisplay = `${formatNumber(maxTransfer, tokenBalance.decimals, balanceFormatter)} ${
          tokenBalance.symbol
        }`;
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
              console.log('currentValues', currentValues);
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
    maxTransfer,
    nativeTokenBalance.decimals,
    nativeTokenBalance.symbol,
    nativeTokenSlug,
    tokenBalance.decimals,
    tokenBalance.symbol,
  ]);

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
                  style={stylesheet.scrollView}
                  contentContainerStyle={stylesheet.scrollViewContentContainer}
                  keyboardShouldPersistTaps={'handled'}>
                  {isAllAccount && viewStep === 1 && (
                    <>
                      <AccountSelector
                        items={accountItems}
                        selectedValueMap={{ [fromValue]: true }}
                        onSelectItem={_onChangeFrom}
                        renderSelected={() => (
                          <AccountSelectField
                            label={i18n.inputLabel.sendFrom}
                            accountName={senderAccountName}
                            value={fromValue}
                            showIcon
                            outerStyle={{ marginBottom: theme.marginSM }}
                          />
                        )}
                        disabled={loading}
                        accountSelectorRef={accountSelectorRef}
                      />
                    </>
                  )}

                  <View style={stylesheet.row}>
                    <View style={stylesheet.rowItem}>
                      <TokenSelector
                        items={viewStep === 1 ? tokenItems : tokenItemsViewStep2}
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
                        disabled={!tokenItems.length || loading || viewStep === 2}
                      />
                    </View>

                    <View style={stylesheet.paperPlaneIconWrapper}>
                      <Icon phosphorIcon={PaperPlaneRight} size={'md'} iconColor={theme['gray-5']} />
                    </View>

                    <View style={stylesheet.rowItem}>
                      <ChainSelector
                        items={viewStep === 1 ? destChainItems : destChainItemsViewStep2}
                        acceptDefaultValue={viewStep === 2 && destChainItemsViewStep2.length === 1}
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
                        disabled={!destChainItems.length || loading || viewStep === 2}
                      />
                    </View>
                  </View>

                  {viewStep === 1 && (
                    <>
                      <FormItem
                        control={control}
                        rules={recipientAddressRules}
                        render={({ field: { value, ref, onChange, onBlur } }) => (
                          <InputAddress
                            ref={ref}
                            label={i18n.inputLabel.sendTo}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            reValidate={reValidate}
                            onSideEffectChange={onBlur}
                            placeholder={i18n.placeholder.accountAddress}
                            disabled={loading}
                            addressPrefix={destChainNetworkPrefix}
                            networkGenesisHash={destChainGenesisHash}
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
                      {!(!fromValue && !chainValue) && (
                        <FreeBalanceDisplay
                          tokenSlug={assetValue}
                          nativeTokenBalance={nativeTokenBalance}
                          nativeTokenSlug={nativeTokenSlug}
                          tokenBalance={tokenBalance}
                          style={stylesheet.balance}
                          error={isGetBalanceError}
                          isLoading={isGetBalanceLoading}
                        />
                      )}

                      {chainValue !== destChainValue && (
                        <AlertBox
                          title={i18n.warningTitle.payAttention}
                          description={i18n.warningMessage.crossChainTransferWarningMessage}
                          type={'warning'}
                        />
                      )}
                    </View>
                  )}
                </ScrollView>

                <View style={stylesheet.footer}>
                  {viewStep === 1 && (
                    <Button
                      disabled={isNextButtonDisable}
                      icon={getButtonIcon(ArrowCircleRight)}
                      onPress={() => {
                        trigger('to').then(pass => {
                          if (pass) {
                            setViewStep(2);
                          }
                        });
                      }}>
                      {i18n.buttonTitles.next}
                    </Button>
                  )}
                  {viewStep === 2 && (
                    <>
                      <View style={stylesheet.footerBalanceWrapper}>
                        <FreeBalanceDisplay
                          label={
                            viewStep === 2
                              ? `${
                                  i18n.customization.balance[0].toUpperCase() +
                                  i18n.customization.balance.slice(1).toLowerCase()
                                }:`
                              : undefined
                          }
                          tokenSlug={assetValue}
                          nativeTokenBalance={nativeTokenBalance}
                          nativeTokenSlug={nativeTokenSlug}
                          tokenBalance={tokenBalance}
                          style={stylesheet.balance}
                          error={isGetBalanceError}
                          isLoading={isGetBalanceLoading}
                        />

                        {viewStep === 2 && !hideMaxButton && (
                          <TouchableOpacity onPress={onSetMaxTransferable} style={stylesheet.max}>
                            {<Typography.Text style={stylesheet.maxText}>{i18n.common.max}</Typography.Text>}
                          </TouchableOpacity>
                        )}
                      </View>
                      <Button
                        disabled={isSubmitButtonDisable}
                        loading={loading}
                        type={undefined}
                        onPress={checkAction(handleSubmit(onSubmit), extrinsicType)}
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
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};
