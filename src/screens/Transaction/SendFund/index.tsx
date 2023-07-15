import { _AssetRef, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import {
  _getAssetDecimals,
  _getOriginChainOfAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _ChainConnectionStatus, _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { TokenItemType, TokenSelector } from 'components/Modal/common/TokenSelector';
import { findAccountByAddress } from 'utils/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { NetworkField } from 'components/Field/Network';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { InputAmount } from 'components/Input/InputAmount';
import { ChainInfo } from 'types/index';
import { addLazy, isSameAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { getMaxTransfer, makeCrossChainTransfer, makeTransfer, saveRecentAccountId } from 'messaging/index';
import { Button, Icon } from 'components/design-system-ui';
import { PaperPlaneTilt } from 'phosphor-react-native';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { Warning } from 'components/Warning';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { RootStackParamList } from 'routes/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { BN_ZERO } from 'utils/chainBalances';
import { formatBalance } from 'utils/number';
import { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import { SendFundProps } from 'routes/transaction/transactionAction';
import { InputAddress } from 'components/Input/InputAddressV2';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { ChainSelector } from 'components/Modal/common/ChainSelector';

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
  chainStateMap: Record<string, _ChainState>,
  assetRegistry: Record<string, _ChainAsset>,
  assetSettingMap: Record<string, AssetSetting>,
  multiChainAssetMap: Record<string, _MultiChainAsset>,
  tokenGroupSlug?: string, // is ether a token slug or a multiChainAsset slug
): TokenItemType[] {
  const account = findAccountByAddress(accounts, address);

  if (!account) {
    return [];
  }

  const ledgerNetwork = findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash)?.slug;
  const isAccountEthereum = isEthereumAddress(address);
  const isSetTokenSlug = !!tokenGroupSlug && !!assetRegistry[tokenGroupSlug];
  const isSetMultiChainAssetSlug = !!tokenGroupSlug && !!multiChainAssetMap[tokenGroupSlug];

  if (tokenGroupSlug) {
    if (!(isSetTokenSlug || isSetMultiChainAssetSlug)) {
      return [];
    }

    const chainAsset = assetRegistry[tokenGroupSlug];
    const isValidLedger = ledgerNetwork ? ledgerNetwork === chainAsset?.originChain : true;

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
    const isValidLedger = ledgerNetwork ? ledgerNetwork === chainAsset.originChain : true;
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
): ChainInfo[] {
  if (!tokenSlug) {
    return [];
  }

  const result: ChainInfo[] = [];
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
    const ledgerNetwork = findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash)?.slug;
    const isAccountEthereum = isEthereumAddress(account.address);

    if (!defaultFilterAccount(account)) {
      return false;
    }

    return chainAssets.some(chainAsset => {
      const isValidLedger = ledgerNetwork ? ledgerNetwork === chainAsset?.originChain : true;

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
  const { show, hideAll } = useToast();
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const chainStateMap = useSelector((root: RootState) => root.chainStore.chainStateMap);
  const assetRegistry = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const assetSettingMap = useSelector((root: RootState) => root.assetRegistry.assetSettingMap);
  const multiChainAssetMap = useSelector((root: RootState) => root.assetRegistry.multiChainAssetMap);
  const xcmRefMap = useSelector((root: RootState) => root.assetRegistry.xcmRefMap);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const [maxTransfer, setMaxTransfer] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [isTransferAll, setIsTransferAll] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [forceUpdateMaxValue, setForceUpdateMaxValue] = useState<object | undefined>(undefined);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isToAddressDirty, setToAddressDirty] = useState<boolean>(false);
  const accountSelectorRef = useRef<ModalRef>();
  const tokenSelectorRef = useRef<ModalRef>();
  const chainSelectorRef = useRef<ModalRef>();

  const handleTransferAll = useCallback((value: boolean) => {
    setForceUpdateMaxValue({});
    setIsTransferAll(value);
  }, []);

  const formConfig = {
    to: {
      name: i18n.inputLabel.sendTo,
      value: '',
    },
    destChain: {
      name: 'Destination chain',
      value: '',
    },
  };

  const { title, formState, onChangeValue, onUpdateErrors, onDone, onChangeFromValue, onChangeAssetValue } =
    useTransaction('send-fund', formConfig, {});
  const { asset, chain, destChain, from, to, value: amount } = formState.data;
  const destChainNetworkPrefix = useGetChainPrefixBySlug(destChain);
  const destChainGenesisHash = chainInfoMap[destChain]?.substrateInfo?.genesisHash || '';
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, handleTransferAll);
  const isDataNotReady = !to || !amount;

  const accountItems = useMemo(() => {
    return accounts.filter(filterAccountFunc(chainInfoMap, assetRegistry, multiChainAssetMap, tokenGroupSlug));
  }, [accounts, assetRegistry, chainInfoMap, multiChainAssetMap, tokenGroupSlug]);

  const destChainItems = useMemo<ChainInfo[]>(() => {
    return getTokenAvailableDestinations(asset, xcmRefMap, chainInfoMap);
  }, [chainInfoMap, asset, xcmRefMap]);

  const currentChainAsset = useMemo(() => {
    return asset ? assetRegistry[asset] : undefined;
  }, [assetRegistry, asset]);

  const decimals = useMemo(() => {
    return currentChainAsset ? _getAssetDecimals(currentChainAsset) : -1;
  }, [currentChainAsset]);

  const tokenItems = useMemo<TokenItemType[]>(() => {
    return getTokenItems(
      from,
      accounts,
      chainInfoMap,
      chainStateMap,
      assetRegistry,
      assetSettingMap,
      multiChainAssetMap,
      tokenGroupSlug,
    );
  }, [accounts, assetRegistry, assetSettingMap, chainInfoMap, chainStateMap, from, multiChainAssetMap, tokenGroupSlug]);

  const validateRecipientAddress = useCallback(
    (_recipientAddress: string, _from: string, _chain: string, _destChain: string) => {
      if (!_recipientAddress) {
        onUpdateErrors('to')([i18n.errorMessage.recipientAddressIsRequired]);
        return false;
      }

      if (!isAddress(_recipientAddress)) {
        onUpdateErrors('to')([i18n.errorMessage.invalidRecipientAddress]);

        return false;
      }

      if (!_from || !_chain || !_destChain) {
        return false;
      }

      const isOnChain = _chain === _destChain;

      if (isOnChain) {
        if (isSameAddress(_from, _recipientAddress)) {
          onUpdateErrors('to')([i18n.errorMessage.sameAddressError]);
          return false;
        }

        const isNotSameAddressType =
          (isEthereumAddress(_from) && !!_recipientAddress && !isEthereumAddress(_recipientAddress)) ||
          (!isEthereumAddress(_from) && !!_recipientAddress && isEthereumAddress(_recipientAddress));

        if (isNotSameAddressType) {
          onUpdateErrors('to')([i18n.errorMessage.notSameAddressTypeError]);
          return false;
        }
      } else {
        const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[_destChain]);

        if (isDestChainEvmCompatible !== isEthereumAddress(_recipientAddress)) {
          onUpdateErrors('to')([
            i18n.errorMessage.recipientAddressMustBeType(isDestChainEvmCompatible ? 'EVM' : 'substrate'),
          ]);
          return false;
        }
      }

      onUpdateErrors('to')([]);
      return true;
    },
    [chainInfoMap, onUpdateErrors],
  );

  const onChangeRecipientAddress = useCallback(
    (currentTextValue: string) => {
      setToAddressDirty(true);
      onChangeValue('to')(currentTextValue);
      if (currentTextValue !== to) {
        validateRecipientAddress(currentTextValue, from, chain, destChain);
      }
    },
    [chain, destChain, from, onChangeValue, to, validateRecipientAddress],
  );

  useEffect(() => {
    if (scanRecipient) {
      setToAddressDirty(true);
      onChangeValue('to')(scanRecipient);
      if (isAddress(scanRecipient)) {
        saveRecentAccountId(scanRecipient).catch(console.error);
      }
    }
  }, [onChangeValue, scanRecipient]);

  useEffect(() => {
    if (scanRecipient === to) {
      validateRecipientAddress(to, from, chain, destChain);
    }
  }, [chain, destChain, from, scanRecipient, to, validateRecipientAddress]);

  const validateAmount = useCallback(
    (_amount: string, _maxTransfer: string, isValidInput?: boolean) => {
      if (isValidInput === false) {
        onUpdateErrors('value')([i18n.errorMessage.invalidAmount]);

        return false;
      }

      if (!_amount) {
        onUpdateErrors('value')([i18n.errorMessage.amountRequiredError]);

        return false;
      }

      if (new BigN(_amount).eq(new BigN(0))) {
        onUpdateErrors('value')([i18n.errorMessage.amountMustBeGreaterThanZero]);

        return false;
      }

      if (new BigN(_amount).gt(new BigN(_maxTransfer))) {
        const maxString = formatBalance(_maxTransfer, decimals);
        onUpdateErrors('value')([i18n.errorMessage.amountMustBeEqualOrLessThan(maxString)]);

        return false;
      }

      onUpdateErrors('value')(undefined);
      return true;
    },
    [decimals, onUpdateErrors],
  );

  const _onChangeAmount = useCallback(
    (_amount: string, isValidInput: boolean) => {
      addLazy(
        'input-amount',
        () => {
          onChangeValue('value')(_amount);
          validateAmount(_amount, maxTransfer, isValidInput);
        },
        1000,
      );
    },
    [maxTransfer, onChangeValue, validateAmount],
  );

  const senderAccountName = useMemo(() => {
    if (!from) {
      return i18n.inputLabel.selectAcc;
    }

    const targetAccount = accounts.find(a => a.address === from);

    return targetAccount?.name || '';
  }, [accounts, from]);

  const onSubmit = useCallback(() => {
    if (chainStateMap[chain].connectionStatus === _ChainConnectionStatus.DISCONNECTED) {
      show(`${destChain} ${i18n.errorMessage.networkDisconected}`, { type: 'danger' });
      return;
    }

    setLoading(true);

    const isAmountValid = validateAmount(amount, maxTransfer);
    const isRecipientAddressValid = validateRecipientAddress(to, from, chain, destChain);

    const isFormValid = isAmountValid && isRecipientAddressValid;

    if (!isFormValid) {
      setLoading(false);
      return;
    }

    let sendPromise: Promise<SWTransactionResponse>;

    if (chain === destChain) {
      // Transfer token or send fund
      sendPromise = makeTransfer({
        from,
        networkKey: chain,
        to,
        tokenSlug: asset,
        value: amount,
        transferAll: isTransferAll,
      });
    } else {
      const acc = findAccountByAddress(accounts, from);

      if (acc?.isHardware) {
        setLoading(false);
        hideAll();
        show('This feature is not available for Ledger account', { type: 'danger' });

        return;
      }

      // Make cross chain transfer
      sendPromise = makeCrossChainTransfer({
        destinationNetworkKey: destChain,
        from,
        originNetworkKey: chain,
        tokenSlug: asset,
        to,
        value: amount,
        transferAll: isTransferAll,
      });
    }

    setTimeout(() => {
      // Handle transfer action
      sendPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [
    chainStateMap,
    destChain,
    validateAmount,
    amount,
    maxTransfer,
    validateRecipientAddress,
    to,
    from,
    chain,
    show,
    asset,
    isTransferAll,
    accounts,
    hideAll,
    onSuccess,
    onError,
  ]);

  const onSetMaxTransferable = useCallback(
    (value: boolean) => {
      const bnMaxTransfer = new BigN(maxTransfer);

      if (!bnMaxTransfer.isZero()) {
        setIsTransferAll(value);
      }
    },
    [maxTransfer],
  );

  useEffect(() => {
    if (tokenItems.length) {
      if (!asset) {
        const account = findAccountByAddress(accounts, from);

        let pass = false;

        if (account?.originGenesisHash) {
          const network = findNetworkJsonByGenesisHash(chainInfoMap, account.originGenesisHash);

          if (network) {
            const token = tokenItems.find(item => item.originChain === network.slug);

            if (token) {
              onChangeAssetValue(tokenItems[0].slug);
              onChangeValue('chain')(assetRegistry[token.slug].originChain);
              onChangeValue('destChain')(assetRegistry[token.slug].originChain);
              pass = true;
            }
          }
        }

        if (!pass) {
          onChangeAssetValue(tokenItems[0].slug);
          onChangeValue('chain')(assetRegistry[tokenItems[0].slug].originChain);
          onChangeValue('destChain')(assetRegistry[tokenItems[0].slug].originChain);
        }
      } else {
        const isSelectedTokenInList = tokenItems.some(i => i.slug === asset);

        if (!isSelectedTokenInList) {
          onChangeAssetValue(tokenItems[0].slug);
          onChangeValue('chain')(assetRegistry[tokenItems[0].slug].originChain);
          onChangeValue('destChain')(assetRegistry[tokenItems[0].slug].originChain);
        }
      }
    }
  }, [accounts, tokenItems, assetRegistry, chainInfoMap, asset, from, onChangeValue, onChangeAssetValue]);

  // Get max transfer value
  useEffect(() => {
    let cancel = false;

    if (from && asset) {
      getMaxTransfer({
        address: from,
        networkKey: assetRegistry[asset].originChain,
        token: asset,
        isXcmTransfer: chain !== destChain,
        destChain,
      })
        .then(balance => {
          !cancel && setMaxTransfer(balance.value);
        })
        .catch(() => {
          !cancel && setMaxTransfer('0');
        })
        .finally(() => {
          if (!cancel) {
            if (amount) {
              setTimeout(() => {
                validateAmount(amount, maxTransfer);
              }, 100);
            }
          }
        });
    }

    return () => {
      cancel = true;
    };
  }, [amount, asset, assetRegistry, assetSettingMap, chain, destChain, from, maxTransfer, validateAmount]);

  useEffect(() => {
    const bnTransferAmount = new BigN(amount || '0');
    const bnMaxTransfer = new BigN(maxTransfer || '0');

    if (bnTransferAmount.gt(BN_ZERO) && bnTransferAmount.eq(bnMaxTransfer)) {
      setIsTransferAll(true);
    }
  }, [maxTransfer, amount]);

  const buttonIcon = useCallback((color: string) => {
    return <Icon phosphorIcon={PaperPlaneTilt} weight={'fill'} size={'lg'} iconColor={color} />;
  }, []);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScreenContainer>
        <>
          <Header disabled={loading} />

          <View style={{ paddingTop: 16 }}>
            <SubHeader
              title={title}
              onPressBack={() => navigation.goBack()}
              disabled={loading}
              titleTextAlign={'left'}
            />
          </View>

          <>
            <ScrollView
              style={{ ...ContainerHorizontalPadding, paddingTop: theme.size, flex: 1 }}
              keyboardShouldPersistTaps={'handled'}>
              {isAllAccount && (
                <AccountSelector
                  items={accountItems}
                  selectedValueMap={{ [from]: true }}
                  onSelectItem={item => {
                    onChangeFromValue(item.address);
                    setForceUpdateMaxValue(undefined);
                    accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                    setIsTransferAll(false);
                    isToAddressDirty && validateRecipientAddress(to, item.address, chain, destChain);
                  }}
                  renderSelected={() => (
                    <AccountSelectField
                      label={i18n.inputLabel.sendFrom}
                      accountName={senderAccountName}
                      value={from}
                      showIcon
                      outerStyle={{ marginBottom: 8 }}
                    />
                  )}
                  disabled={loading}
                  accountSelectorRef={accountSelectorRef}
                />
              )}

              <View style={{ flexDirection: 'row', gap: theme.sizeSM, paddingBottom: theme.sizeXXS }}>
                <View style={{ flex: 1 }}>
                  <TokenSelector
                    items={tokenItems}
                    selectedValueMap={{ [asset]: true }}
                    onSelectItem={item => {
                      onChangeAssetValue(item.slug);
                      onChangeValue('destChain')(item.originChain);
                      tokenSelectorRef && tokenSelectorRef.current?.onCloseModal();
                      setIsTransferAll(false);
                      setForceUpdateMaxValue(undefined);
                      isToAddressDirty && validateRecipientAddress(to, from, item.originChain, item.originChain);
                    }}
                    tokenSelectorRef={tokenSelectorRef}
                    renderSelected={() => (
                      <TokenSelectField
                        logoKey={currentChainAsset?.symbol || ''}
                        subLogoKey={currentChainAsset?.originChain || ''}
                        value={currentChainAsset?.symbol || ''}
                        showIcon
                      />
                    )}
                    disabled={!tokenItems.length || loading}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <InputAmount
                    forceUpdateMaxValue={forceUpdateMaxValue}
                    disable={loading}
                    value={amount}
                    maxValue={maxTransfer}
                    onChangeValue={_onChangeAmount}
                    decimals={decimals}
                    onSetMax={onSetMaxTransferable}
                    showMaxButton
                  />
                </View>
              </View>

              {!!(formState.errors.value && formState.errors.value.length) &&
                formState.errors.value.map((message, index) => (
                  <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
                ))}

              <InputAddress
                ref={formState.refs.to}
                containerStyle={{ marginBottom: theme.sizeSM }}
                label={formState.labels.to}
                value={formState.data.to}
                onChangeText={onChangeRecipientAddress}
                isValidValue={formState.isValidated.recipientAddress}
                placeholder={i18n.placeholder.accountAddress}
                disabled={loading}
                onSubmitEditing={onSubmit}
                addressPrefix={destChainNetworkPrefix}
                networkGenesisHash={destChainGenesisHash}
                showAddressBook
                saveAddress
              />

              {!!(formState.errors.to && formState.errors.to.length) &&
                formState.errors.to.map((message, index) => (
                  <Warning key={index} isDanger message={message} style={{ marginBottom: theme.marginSM }} />
                ))}

              <ChainSelector
                items={destChainItems}
                selectedValueMap={{ [destChain]: true }}
                chainSelectorRef={chainSelectorRef}
                onSelectItem={item => {
                  onChangeValue('destChain')(item.slug);
                  setForceUpdateMaxValue(isTransferAll ? {} : undefined);
                  chainSelectorRef && chainSelectorRef.current?.onCloseModal();
                  isToAddressDirty && validateRecipientAddress(to, from, chain, item.slug);
                }}
                renderSelected={() => (
                  <NetworkField
                    networkKey={destChain}
                    outerStyle={{ marginBottom: 0 }}
                    placeholder={i18n.placeholder.selectChain}
                    showIcon
                  />
                )}
                disabled={!destChainItems.length || loading}
              />
              <FreeBalance address={from} chain={chain} onBalanceReady={setIsBalanceReady} tokenSlug={asset} />
            </ScrollView>

            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                ...MarginBottomForSubmitButton,
              }}>
              <Button
                disabled={
                  isDataNotReady ||
                  !isBalanceReady ||
                  !!formState.errors.to.length ||
                  !!formState.errors.value.length ||
                  loading
                }
                icon={buttonIcon}
                loading={loading}
                type={isTransferAll ? 'warning' : undefined}
                onPress={onSubmit}>
                {isTransferAll ? i18n.buttonTitles.transferAll : i18n.buttonTitles.transfer}
              </Button>
            </View>
            <SafeAreaView />
          </>
        </>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};
