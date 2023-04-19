import { _AssetRef, _AssetType, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';
import {
  _getAssetDecimals,
  _getOriginChainOfAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';
import { AssetSetting } from '@subwallet/extension-base/background/KoniTypes';
import { TokenItemType, TokenSelector } from 'components/Modal/common/TokenSelector';
import { findAccountByAddress } from 'utils/index';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import i18n from 'utils/i18n/i18n';
import { InputAddress } from 'components/Input/InputAddress';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import { Keyboard, ScrollView, StyleProp, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { NetworkField } from 'components/Field/Network';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { InputAmount } from 'components/Input/InputAmount';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { ChainInfo } from 'types/index';
import { isSameAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { BN_TEN } from 'utils/number';
import { getFreeBalance, makeCrossChainTransfer, makeTransfer } from '../../../messaging';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { PaperPlaneTilt } from 'phosphor-react-native';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { Warning } from 'components/Warning';
import useGoHome from 'hooks/screen/useGoHome';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ContainerHorizontalPadding, FontMedium } from 'styles/sharedStyles';
import { SendFundProps } from 'routes/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

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

const InputStyle: StyleProp<any> = {
  marginBottom: 8,
};

export const SendFund = ({
  route: {
    params: { slug: tokenGroupSlug },
  },
}: SendFundProps): React.ReactElement<SendFundProps> => {
  const theme = useSubWalletTheme().swThemes;
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

  const [isShowQrModalVisible, setIsShowQrModalVisible] = useState(false);
  const [accountSelectModalVisible, setAccountSelectModalVisible] = useState<boolean>(false);
  const [tokenSelectModalVisible, setTokenSelectModalVisible] = useState<boolean>(false);
  const [chainSelectModalVisible, setChainSelectModalVisible] = useState<boolean>(false);

  //todo: i18n
  const formConfig = {
    to: {
      name: 'Send to account',
      value: '',
    },
    destChain: {
      name: 'Destination chain',
      value: '',
    },
  };

  const { title, formState, onChangeValue, onUpdateErrors, onDone, onChangeFromValue, onChangeAssetValue } =
    useTransaction('send-fund', formConfig);
  const { asset, chain, destChain, from, to, value: amount } = formState.data;
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setIsTransferAll);

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
    return currentChainAsset ? _getAssetDecimals(currentChainAsset) : 0;
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
    (_recipientAddress: string) => {
      if (!_recipientAddress) {
        //todo: i18n
        onUpdateErrors('to')(['Recipient address is required']);
        return false;
      }

      if (!isAddress(_recipientAddress)) {
        //todo: i18n
        onUpdateErrors('to')(['Invalid Recipient address']);

        return false;
      }

      if (!from || !chain || !destChain) {
        return false;
      }

      const isOnChain = chain === destChain;

      if (isOnChain) {
        if (isSameAddress(from, _recipientAddress)) {
          //todo: i18n
          onUpdateErrors('to')(['The recipient address can not be the same as the sender address']);
          return false;
        }

        const isNotSameAddressType =
          (isEthereumAddress(from) && !!_recipientAddress && !isEthereumAddress(_recipientAddress)) ||
          (!isEthereumAddress(from) && !!_recipientAddress && isEthereumAddress(_recipientAddress));

        if (isNotSameAddressType) {
          //todo: i18n
          onUpdateErrors('to')(['The recipient address must be same type as the current account address.']);
          return false;
        }
      } else {
        const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[destChain]);

        if (isDestChainEvmCompatible !== isEthereumAddress(_recipientAddress)) {
          onUpdateErrors('to')([
            //todo: i18n
            `The recipient address must be ${isDestChainEvmCompatible ? 'EVM' : 'substrate'} type`,
          ]);
          return false;
        }
      }

      return true;
    },
    [chain, chainInfoMap, destChain, from, onUpdateErrors],
  );

  const onUpdateReceiverInputAddress = useCallback(
    (text: string) => {
      formState.refs.to.current?.onChange(text);
      validateRecipientAddress(text);
    },
    [formState.refs.to, validateRecipientAddress],
  );

  const onChangeRecipientAddress = useCallback(
    (recipientAddress: string | null, currentTextValue: string) => {
      onChangeValue('to')(currentTextValue);
      validateRecipientAddress(currentTextValue);
    },
    [onChangeValue, validateRecipientAddress],
  );

  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsShowQrModalVisible(true);
    }
  }, []);

  const closeQrScan = useCallback(() => {
    setIsShowQrModalVisible(false);
  }, []);

  const validateAmount = useCallback(
    (_amount: string, _maxTransfer: string) => {
      if (!_amount) {
        //todo: i18n
        onUpdateErrors('value')(['Amount is required']);

        return false;
      }

      if (new BigN(_amount).gt(new BigN(_maxTransfer))) {
        const maxString = new BigN(_maxTransfer).div(BN_TEN.pow(decimals)).toFixed(6);
        //todo: i18n
        onUpdateErrors('value')([`Amount must be equal or less than ${maxString}`]);

        return false;
      }

      return true;
    },
    [decimals, onUpdateErrors],
  );

  const _onChangeAmount = useCallback(
    (_amount: string) => {
      onChangeValue('value')(_amount);

      validateAmount(_amount, maxTransfer);
    },
    [maxTransfer, onChangeValue, validateAmount],
  );

  const senderAccountName = useMemo(() => {
    if (!from) {
      //todo: i18n
      return 'Select account';
    }

    const targetAccount = accounts.find(a => a.address === from);

    return targetAccount?.name || '';
  }, [accounts, from]);

  const onSubmit = useCallback(() => {
    setLoading(true);

    const isAmountValid = validateAmount(amount, maxTransfer);
    const isRecipientAddressValid = validateRecipientAddress(to);

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
      // Make cross chain transfer
      sendPromise = makeCrossChainTransfer({
        destinationNetworkKey: destChain,
        from,
        originNetworkKey: chain,
        tokenSlug: asset,
        to,
        value: amount,
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
    validateAmount,
    amount,
    maxTransfer,
    validateRecipientAddress,
    to,
    chain,
    destChain,
    from,
    asset,
    isTransferAll,
    onSuccess,
    onError,
  ]);

  const goHome = useGoHome();

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
              onChangeValue('asset')(token.slug);
              onChangeValue('chain')(assetRegistry[token.slug].originChain);
              onChangeValue('destChain')(assetRegistry[token.slug].originChain);
              pass = true;
            }
          }
        }

        if (!pass) {
          onChangeValue('asset')(tokenItems[0].slug);
          onChangeValue('chain')(assetRegistry[tokenItems[0].slug].originChain);
          onChangeValue('destChain')(assetRegistry[tokenItems[0].slug].originChain);
        }
      } else {
        const isSelectedTokenInList = tokenItems.some(i => i.slug === asset);

        if (!isSelectedTokenInList) {
          onChangeValue('asset')(tokenItems[0].slug);
          onChangeValue('chain')(assetRegistry[tokenItems[0].slug].originChain);
          onChangeValue('destChain')(assetRegistry[tokenItems[0].slug].originChain);
        }
      }
    }
  }, [accounts, tokenItems, assetRegistry, chainInfoMap, asset, from, onChangeValue]);

  // Get max transfer value
  useEffect(() => {
    let cancel = false;

    if (from && asset) {
      getFreeBalance({
        address: from,
        networkKey: assetRegistry[asset].originChain,
        token: asset,
      })
        .then(balance => {
          if (!cancel) {
            setMaxTransfer(balance.value);

            if (amount) {
              setTimeout(() => {
                validateAmount(amount, maxTransfer);
              }, 100);
            }
          }
        })
        .catch(console.error);
    }

    return () => {
      cancel = true;
    };
  }, [amount, asset, assetRegistry, from, maxTransfer, validateAmount]);

  const buttonIcon = useCallback((color: string) => {
    return <Icon phosphorIcon={PaperPlaneTilt} size={'lg'} iconColor={color} />;
  }, []);

  return (
    <ContainerWithSubHeader title={title} onPressBack={goHome} disabled={loading}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <>
          <ScrollView style={{ ...ContainerHorizontalPadding, marginTop: 10 }}>
            <Typography.Text
              style={{ ...FontMedium, color: theme.colorTextLight4, textAlign: 'center', marginBottom: theme.size }}>
              {/*//todo: i18n*/}
              {'You are doing a token transfer with the following information'}
            </Typography.Text>

            {isAllAccount && (
              <>
                <TouchableOpacity onPress={() => setAccountSelectModalVisible(true)}>
                  {/*//todo: i18n*/}
                  <AccountSelectField
                    label={'Send from account'}
                    accountName={senderAccountName}
                    value={from}
                    showIcon
                  />
                </TouchableOpacity>

                <AccountSelector
                  modalVisible={accountSelectModalVisible}
                  onSelectItem={item => {
                    onChangeFromValue(item.address);
                    setAccountSelectModalVisible(false);
                  }}
                  items={accountItems}
                  onCancel={() => setAccountSelectModalVisible(false)}
                />
              </>
            )}

            <TouchableOpacity
              onPress={() => {
                setTokenSelectModalVisible(true);
              }}>
              {/*//todo: i18n*/}
              <TokenSelectField
                label={'Token'}
                logoKey={currentChainAsset?.symbol || ''}
                subLogoKey={currentChainAsset?.originChain || ''}
                value={currentChainAsset?.symbol || ''}
                showIcon
              />
            </TouchableOpacity>

            <TokenSelector
              modalVisible={tokenSelectModalVisible}
              items={tokenItems}
              onCancel={() => setTokenSelectModalVisible(false)}
              onSelectItem={item => {
                onChangeAssetValue(item.slug);
                onChangeValue('destChain')(item.originChain);
                setTokenSelectModalVisible(false);
                setIsTransferAll(false);
              }}
            />

            <InputAmount
              value={amount}
              maxValue={maxTransfer}
              onChangeValue={_onChangeAmount}
              decimals={decimals}
              errorMessages={formState.errors.value}
              onSetMax={setIsTransferAll}
              showMaxButton={chain === destChain && assetRegistry[asset]?.assetType === _AssetType.NATIVE}
            />

            <InputAddress
              ref={formState.refs.to}
              onPressQrButton={onPressQrButton}
              containerStyle={InputStyle}
              label={formState.labels.to}
              value={formState.data.to}
              onChange={onChangeRecipientAddress}
              isValidValue={formState.isValidated.recipientAddress}
            />

            {/*//todo: i18n*/}
            <AddressScanner
              qrModalVisible={isShowQrModalVisible}
              onPressCancel={closeQrScan}
              onChangeAddress={onUpdateReceiverInputAddress}
              scanMessage={'to send fund'}
            />

            {!!(formState.errors.to && formState.errors.to.length) &&
              formState.errors.to.map((message, index) => (
                <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
              ))}

            <TouchableOpacity
              onPress={() => {
                setChainSelectModalVisible(true);
              }}>
              <NetworkField label={i18n.common.network} networkKey={destChain} />
            </TouchableOpacity>

            <ChainSelector
              items={destChainItems}
              modalVisible={chainSelectModalVisible}
              onCancel={() => setChainSelectModalVisible(false)}
              onSelectItem={item => {
                onChangeValue('destChain')(item.slug);
                setChainSelectModalVisible(false);
                if (item.slug !== chain && assetRegistry[asset]?.assetType === _AssetType.NATIVE) {
                  setIsTransferAll(false);
                }
              }}
            />

            <FreeBalance address={from} chain={chain} onBalanceReady={setIsBalanceReady} tokenSlug={asset} />
          </ScrollView>

          <View style={{ ...ContainerHorizontalPadding, marginTop: 16, marginBottom: 16 }}>
            {/*//todo: i18n*/}
            <Button
              disabled={!isBalanceReady}
              icon={buttonIcon}
              loading={loading}
              type={isTransferAll ? 'warning' : undefined}
              onPress={onSubmit}>
              {isTransferAll ? 'Transfer the full account balance' : 'Transfer'}
            </Button>
          </View>
        </>
      </TouchableWithoutFeedback>
    </ContainerWithSubHeader>
  );
};
