import { SigningContext } from 'providers/SigningContext';
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, SendFundProps } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useFreeBalance from 'hooks/screen/useFreeBalance';
import { BalanceFormatType, TokenItemType } from 'types/ui-types';
import {
  getAuthTransactionFeeInfo,
  getBalanceFormat,
  getMainTokenInfo,
  getMaxTransferAndNoFees,
  isContainGasRequiredExceedsError,
} from 'screens/Sending/utils';
import {
  checkCrossChainTransfer,
  checkTransfer,
  transferCheckReferenceCount,
  transferCheckSupporting,
  transferGetExistentialDeposit,
} from '../../messaging';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Confirmation } from 'screens/Sending/Confirmation';
import { TransferResultType } from 'types/tx';
import { SendFundResult } from 'screens/Sending/SendFundResult';
import {
  DropdownTransformOptionType,
  NetworkJson,
  ResponseCheckCrossChainTransfer,
  ResponseCheckTransfer,
} from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';
import { formatBalance } from '@polkadot/util';
import { SupportedCrossChainsMap } from '@subwallet/extension-koni-base/api/xcm/utils';
import useTokenOptions from 'hooks/screen/TokenSelect/useTokenOptions';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import { ChainAndAccountSelectScreen } from 'screens/Sending/ChainAndAccountSelectScreen';
import { TypeAmountScreen } from 'screens/Sending/TypeAmountScreen';
import { getOutputValuesFromString } from 'screens/Sending/Field/SendAssetInputBalance';

const ViewStep = {
  SEND_FUND: 1,
  TYPE_AMOUNT: 2,
  CHANGE_BALANCE: 3,
  CONFIRMATION: 4,
};

function getDestinationChainOptions(originChain: string, networkMap: Record<string, NetworkJson>) {
  const onChainOptions = [
    {
      label: networkMap[originChain].chain,
      value: originChain,
    },
  ];
  let crossChainOptions: { label: string; value: string }[] = [];
  if (SupportedCrossChainsMap[originChain]) {
    crossChainOptions = Object.keys(SupportedCrossChainsMap[originChain].relationMap).map(key => ({
      label: networkMap[key].chain,
      value: key,
    }));
  }

  return onChainOptions.concat(crossChainOptions);
}

function getSupportedTokens(
  originChain: string,
  tokenList: TokenItemType[],
  destinationChain: string,
): TokenItemType[] {
  const crossChainTokens =
    SupportedCrossChainsMap[originChain] && SupportedCrossChainsMap[originChain].relationMap[destinationChain]
      ? SupportedCrossChainsMap[originChain].relationMap[destinationChain].supportedToken
      : [];

  if (originChain === destinationChain) {
    return tokenList.filter(item => item.networkKey === originChain);
  } else {
    return tokenList.filter(item => crossChainTokens.includes(item.symbol) && item.networkKey === originChain);
  }
}

export const SendFund = ({
  route: {
    params: { selectedNetworkKey, selectedToken },
  },
}: SendFundProps) => {
  const navigation = useNavigation<RootNavigationProps>();

  const chainRegistry = useSelector((state: RootState) => state.chainRegistry.details);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const { currentAccountAddress, accounts } = useSelector((state: RootState) => state.accounts);

  const {
    signingState: { isLoading },
  } = useContext(SigningContext);

  const [[receiveAddress, currentReceiveAddress], setReceiveAddress] = useState<[string | null, string]>([null, '']);
  const [{ rawAmount, rawAmountWithDecimals }, setRawAmount] = useState<{
    rawAmount: string | undefined;
    rawAmountWithDecimals: string | undefined;
  }>({ rawAmount: undefined, rawAmountWithDecimals: undefined });
  const [senderAddress, setSenderAddress] = useState<string>(currentAccountAddress);
  const showedNetworks = useShowedNetworks(currentAccountAddress === 'ALL' ? 'ALL' : senderAddress, accounts);
  const originChainOptions = useMemo(() => {
    return showedNetworks
      .filter(item => chainRegistry[item])
      .map(key => ({
        label: networkMap[key].chain,
        value: key,
      }));
  }, [chainRegistry, networkMap, showedNetworks]);
  const firstOriginChain = selectedNetworkKey || originChainOptions[0].value;
  const [originToken, setOriginToken] = useState<string>(
    selectedToken || networkMap[firstOriginChain].nativeToken || 'Token',
  );
  const tokenList = useTokenOptions(currentAccountAddress === 'ALL' ? currentAccountAddress : senderAddress);
  const [originChain, setOriginChain] = useState<string>(firstOriginChain);
  const senderFreeBalance = useFreeBalance(originChain, senderAddress, originToken);
  const balanceFormat: BalanceFormatType = getBalanceFormat(originChain, originToken, chainRegistry);
  const [isGasRequiredExceedsError, setGasRequiredExceedsError] = useState<boolean>(false);
  const [backupAmount, setBackupAmount] = useState<string | undefined>(undefined);
  const [existentialDeposit, setExistentialDeposit] = useState<string>('0');
  const [[fee, feeSymbol], setFeeInfo] = useState<[string | null, string | null | undefined]>([null, null]);
  const mainTokenInfo = getMainTokenInfo(originChain, chainRegistry);
  const si = formatBalance.findSi('-');
  const feeDecimal: number | null = feeSymbol
    ? feeSymbol === originToken
      ? balanceFormat[0]
      : getBalanceFormat(originChain, feeSymbol, chainRegistry)[0]
    : null;
  const [reference, setReference] = useState<boolean | null>(null);
  const [[isSupportTransfer, isSupportTransferAll], setTransferSupport] = useState<[boolean, boolean] | [null, null]>([
    null,
    null,
  ]);
  const defaultDestinationChainOptions = getDestinationChainOptions(originChain, networkMap);
  const [[selectedDestinationChain, destinationChainOptions], setDestinationChain] = useState<
    [string, DropdownTransformOptionType[]]
  >([defaultDestinationChainOptions[0].value, defaultDestinationChainOptions]);
  const originTokenList = useMemo(() => {
    return getSupportedTokens(originChain, tokenList, selectedDestinationChain);
  }, [originChain, selectedDestinationChain, tokenList]);
  const canToggleAll = !!isSupportTransferAll && !!senderFreeBalance && !reference && !!receiveAddress;
  const [currentViewStep, setCurrentStep] = useState(ViewStep.SEND_FUND);
  const [txResult, setTxResult] = useState<TransferResultType>({ isShowTxResult: false, isTxSuccess: false });
  const { isShowTxResult } = txResult;
  const inputBalanceRef = createRef();
  const amount = rawAmountWithDecimals !== undefined ? rawAmountWithDecimals : '0';

  const _onChangeOriginChain = (currentOriginChain: string) => {
    const currentDestinationChainOptions = getDestinationChainOptions(currentOriginChain, networkMap);
    setOriginChain(currentOriginChain);
    setDestinationChain([currentDestinationChainOptions[0].value, currentDestinationChainOptions]);
    const currentSupportedMainTokens = getSupportedTokens(
      currentOriginChain,
      tokenList,
      currentDestinationChainOptions[0].value,
    );

    const firstNativeToken = currentSupportedMainTokens.find(item => item.isMainToken);
    if (currentSupportedMainTokens && currentSupportedMainTokens.length) {
      setOriginToken(firstNativeToken ? firstNativeToken.symbol : currentSupportedMainTokens[0].symbol);
    }
  };

  const _onChangeDestinationChain = useCallback(
    (chain: string) => {
      setDestinationChain(prev => {
        return [chain, prev[1]];
      });
      setOriginToken(getSupportedTokens(originChain, tokenList, chain)[0].symbol);
    },
    [originChain, tokenList],
  );

  const _doCheckTransfer = useCallback(
    (isConfirmTransferAll: boolean, thenCb: (rs: ResponseCheckTransfer) => void, catchCb: (rs: Error) => void) => {
      if (receiveAddress) {
        checkTransfer({
          networkKey: originChain,
          from: senderAddress,
          to: receiveAddress,
          transferAll: canToggleAll && isConfirmTransferAll,
          token: originToken,
          value: amount,
        })
          .then(thenCb)
          .catch(catchCb);
      }
    },
    [amount, canToggleAll, senderAddress, originChain, receiveAddress, originToken],
  );

  const _doCheckXcmTransfer = useCallback(
    (
      isConfirmTransferAll: boolean,
      thenCb: (rs: ResponseCheckCrossChainTransfer) => void,
      catchCb: (rs: Error) => void,
    ) => {
      if (receiveAddress) {
        checkCrossChainTransfer({
          originNetworkKey: originChain,
          destinationNetworkKey: selectedDestinationChain,
          from: senderAddress,
          to: receiveAddress,
          token: originToken,
          value: amount,
        })
          .then(thenCb)
          .catch(catchCb);
      }
    },
    [amount, originChain, originToken, receiveAddress, selectedDestinationChain, senderAddress],
  );

  useEffect(() => {
    let isSync = true;

    if (receiveAddress && rawAmountWithDecimals) {
      if (originChain === selectedDestinationChain) {
        _doCheckTransfer(
          false,
          rs => {
            if (isSync) {
              setFeeInfo([rs.estimateFee && rs.estimateFee !== '0' ? rs.estimateFee : null, rs.feeSymbol]);
              setGasRequiredExceedsError(false);
            }
          },
          (e: Error) => {
            if (isContainGasRequiredExceedsError(e.message) && isSync) {
              setGasRequiredExceedsError(true);
            } else {
              if (isSync) {
                setGasRequiredExceedsError(false);
              }

              console.log('There is problem when checkTransfer', e);
            }
          },
        );
      } else {
        _doCheckXcmTransfer(
          false,
          rs => {
            if (isSync) {
              setFeeInfo([rs.estimatedFee && rs.estimatedFee !== '0' ? rs.estimatedFee : null, rs.feeSymbol]);
            }
          },
          (e: Error) => {
            console.log('There is problem when checkTransfer', e);
          },
        );
      }
    }

    return () => {
      isSync = false;
    };
  }, [
    _doCheckTransfer,
    canToggleAll,
    senderAddress,
    rawAmountWithDecimals,
    receiveAddress,
    originToken,
    originChain,
    selectedDestinationChain,
    _doCheckXcmTransfer,
  ]);

  useEffect(() => {
    let isSync = true;

    transferCheckReferenceCount({ address: senderAddress, networkKey: originChain })
      .then(res => {
        if (isSync) {
          setReference(res);
        }
      })
      .catch(e => console.log('There is problem when checkReferenceCount', e));

    return () => {
      isSync = false;
      setReference(null);
    };
  }, [senderAddress, originChain]);

  useEffect(() => {
    let isSync = true;

    transferGetExistentialDeposit({ networkKey: originChain, token: originToken })
      .then(rs => {
        if (isSync) {
          setExistentialDeposit(rs);
        }
      })
      .catch(e => console.log('There is problem when transferGetExistentialDeposit', e));

    return () => {
      isSync = false;
      setExistentialDeposit('0');
    };
  }, [originChain, originToken]);

  useEffect(() => {
    let isSync = true;
    if (originChain === selectedDestinationChain) {
      transferCheckSupporting({ networkKey: originChain, token: originToken })
        .then(res => {
          if (isSync) {
            setTransferSupport([res.supportTransfer, res.supportTransferAll]);
          }
        })
        .catch(e => console.log('There is problem when checkTransferSupporting', e));
    } else {
      setTransferSupport([true, false]);
    }

    return () => {
      isSync = false;
      setTransferSupport([null, null]);
    };
  }, [originChain, originToken, selectedDestinationChain]);

  useEffect(() => {
    if (currentViewStep === ViewStep.SEND_FUND && inputBalanceRef.current) {
      // @ts-ignore
      inputBalanceRef.current.onChange(backupAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewStep, backupAmount, inputBalanceRef.current]);

  const onChangeAmount = (val?: string) => {
    const [outputValue, isValid] = getOutputValuesFromString(val || '', balanceFormat[0]);
    setRawAmount({ rawAmount: val, rawAmountWithDecimals: isValid ? outputValue : undefined });
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.TYPE_AMOUNT) {
      if (inputBalanceRef && inputBalanceRef.current) {
        // @ts-ignore
        setRawAmount({ rawAmount: undefined, rawAmountWithDecimals: undefined });
      }
      setCurrentStep(ViewStep.SEND_FUND);
    } else if (currentViewStep === ViewStep.CONFIRMATION) {
      setCurrentStep(ViewStep.TYPE_AMOUNT);
      setBackupAmount(rawAmountWithDecimals);
    } else {
      navigation.goBack();
    }
  };

  const onChangeReceiverAddress = (receiverAddress: string | null, currentTextValue: string) => {
    setReceiveAddress([receiverAddress, currentTextValue]);
  };

  const _onChangeResult = (curTxResult: TransferResultType) => {
    setTxResult(curTxResult);
  };

  const _onResend = () => {
    setTxResult({
      isTxSuccess: false,
      isShowTxResult: false,
      txError: undefined,
    });
    setReceiveAddress([null, '']);
    setCurrentStep(ViewStep.SEND_FUND);
  };

  const onUpdateInputBalance = () => {
    if (originChain === selectedDestinationChain) {
      _doCheckTransfer(
        true,
        rs => {
          const [curMaxTransfer] = getMaxTransferAndNoFees(
            rs.estimateFee || null,
            rs.feeSymbol,
            originToken,
            mainTokenInfo.symbol,
            senderFreeBalance,
            existentialDeposit,
          );
          if (inputBalanceRef && inputBalanceRef.current) {
            // @ts-ignore
            inputBalanceRef.current.onChange(curMaxTransfer.toString());
          }
        },
        err => console.log('There is problem when checkTransfer', err),
      );
    } else {
      _doCheckXcmTransfer(
        true,
        rs => {
          const [curMaxTransfer] = getMaxTransferAndNoFees(
            rs.estimatedFee || null,
            rs.feeSymbol,
            originToken,
            mainTokenInfo.symbol,
            senderFreeBalance,
            existentialDeposit,
          );
          if (inputBalanceRef && inputBalanceRef.current) {
            // @ts-ignore
            inputBalanceRef.current.onChange(curMaxTransfer.toString());
          }
        },
        err => console.log('There is problem when checkTransfer', err),
      );
    }
  };

  const _onChangeSelectedToken = useCallback(
    (tokenValueStr: string) => {
      const currentBalanceFormat = getBalanceFormat(originChain, tokenValueStr, chainRegistry);
      const [outputValue, isValid] = getOutputValuesFromString(rawAmount || '', currentBalanceFormat[0]);
      setOriginToken(tokenValueStr);
      setRawAmount(prevState => ({
        ...prevState,
        rawAmountWithDecimals: isValid ? outputValue : undefined,
      }));
    },
    [chainRegistry, originChain, rawAmount],
  );

  const _onChangeSenderAddress = (address: string) => {
    setSenderAddress(address);
  };

  return (
    <>
      {!isShowTxResult ? (
        <ContainerWithSubHeader
          onPressBack={onPressBack}
          disabled={isLoading}
          title={currentViewStep === ViewStep.TYPE_AMOUNT ? i18n.common.amount : i18n.title.sendAsset}>
          <>
            {currentViewStep === ViewStep.SEND_FUND && (
              <ChainAndAccountSelectScreen
                originChain={originChain}
                originChainOptions={originChainOptions}
                originToken={originToken}
                onChangeOriginChain={_onChangeOriginChain}
                destinationChain={selectedDestinationChain}
                destinationChainOptions={destinationChainOptions}
                onChangeDestinationChain={_onChangeDestinationChain}
                senderAddress={senderAddress}
                onChangeSenderAddress={_onChangeSenderAddress}
                receiveAddress={receiveAddress}
                currentReceiveAddress={currentReceiveAddress}
                onChangeReceiverAddress={onChangeReceiverAddress}
                onPressToNextStep={() => setCurrentStep(ViewStep.TYPE_AMOUNT)}
                onChangeToken={_onChangeSelectedToken}
                originTokenList={originTokenList}
              />
            )}

            {currentViewStep === ViewStep.TYPE_AMOUNT && (
              <TypeAmountScreen
                amount={amount}
                showedNetworks={showedNetworks}
                originToken={originToken}
                originChain={originChain}
                senderAddress={senderAddress}
                si={si}
                rawAmount={rawAmountWithDecimals}
                originTokenList={originTokenList}
                canToggleAll={canToggleAll}
                balanceFormat={balanceFormat}
                inputBalanceRef={inputBalanceRef}
                onChangeAmount={onChangeAmount}
                senderFreeBalance={senderFreeBalance}
                onUpdateInputBalance={onUpdateInputBalance}
                isSupportTransfer={isSupportTransfer}
                onChangeSelectedToken={_onChangeSelectedToken}
                isGasRequiredExceedsError={isGasRequiredExceedsError}
                onPressToNextStep={() => setCurrentStep(ViewStep.CONFIRMATION)}
              />
            )}

            {currentViewStep === ViewStep.CONFIRMATION && (
              <Confirmation
                balanceFormat={balanceFormat}
                requestPayload={{
                  originNetworkKey: originChain,
                  destinationNetworkKey: selectedDestinationChain,
                  from: senderAddress,
                  to: currentReceiveAddress,
                  transferAll: false,
                  token: originToken,
                  value: amount,
                }}
                onChangeResult={_onChangeResult}
                feeInfo={getAuthTransactionFeeInfo(
                  fee,
                  feeDecimal,
                  feeSymbol,
                  mainTokenInfo,
                  chainRegistry[originChain].tokenMap,
                )}
                si={si}
              />
            )}
          </>
        </ContainerWithSubHeader>
      ) : (
        <SendFundResult networkKey={originChain} txResult={txResult} onResend={_onResend} />
      )}
    </>
  );
};
