import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, SendFundProps } from 'routes/index';
import { Keyboard, ScrollView, StyleProp, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { InputAddress } from 'components/Input/InputAddress';
import Text from 'components/Text';
import {
  ContainerHorizontalPadding,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { getBalanceWithSi, getNetworkLogo } from 'utils/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { SubmitButton } from 'components/SubmitButton';
import useFreeBalance from 'hooks/screen/useFreeBalance';
import FormatBalance from 'components/FormatBalance';
import { BalanceFormatType, TokenItemType } from 'types/ui-types';
import {
  getAuthTransactionFeeInfo,
  getBalanceFormat,
  getMainTokenInfo,
  getMaxTransferAndNoFees,
  isContainGasRequiredExceedsError,
} from 'screens/Sending/utils';
import BigN from 'bignumber.js';
import { InputBalance } from 'components/Input/InputBalance';
import { BN_TEN } from 'utils/chainBalances';
import { BalanceToUsd } from 'components/BalanceToUsd';
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
import { checkAddress } from '@polkadot/phishing';
import {
  DropdownTransformOptionType,
  NetworkJson,
  ResponseCheckCrossChainTransfer,
  ResponseCheckTransfer,
} from '@subwallet/extension-base/background/KoniTypes';
import { Warning } from 'components/Warning';
import { isEthereumAddress } from '@polkadot/util-crypto';
import i18n from 'utils/i18n/i18n';
import { QrScannerScreen } from 'screens/QrScannerScreen';
import { RESULTS } from 'react-native-permissions';
import { requestCameraPermission } from 'utils/validators';
import { formatBalance } from '@polkadot/util';
import { SendFromAddressField } from 'screens/Sending/Field/SendFromAddressField';
import { SupportedCrossChainsMap } from '@subwallet/extension-koni-base/api/xcm/utils';
import { ArrowRight, CaretDown } from 'phosphor-react-native';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { DestinationChainSelectField } from 'screens/Sending/Field/DestinationChainSelectField';
import { OriginChainSelectField } from 'screens/Sending/Field/OriginChainSelectField';
import useTokenOptions from 'hooks/screen/TokenSelect/useTokenOptions';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';

const WarningStyle: StyleProp<any> = {
  marginBottom: 8,
};

const NetworkLogoWrapperStyle: StyleProp<any> = {
  borderRadius: 20,
  width: 40,
  height: 40,
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: ColorMap.secondary,
  justifyContent: 'center',
  alignItems: 'center',
};

function getUseMaxButtonTextStyle(disabled: boolean) {
  return {
    color: disabled ? ColorMap.disabled : ColorMap.primary,
    ...sharedStyles.mainText,
    ...FontMedium,
  };
}
const ViewStep = {
  SEND_FUND: 1,
  TYPE_AMOUNT: 2,
  CONFIRMATION: 3,
  CHANGE_BALANCE: 4,
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
    return tokenList.filter(item => crossChainTokens.includes(item.symbol));
  }
}

export const SendFund = ({
  route: {
    params: { selectedNetworkKey, selectedToken },
  },
}: SendFundProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const chainRegistry = useSelector((state: RootState) => state.chainRegistry.details);
  const tokenPriceMap = useSelector((state: RootState) => state.price.tokenPriceMap);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const { currentAccountAddress, accounts } = useSelector((state: RootState) => state.accounts);
  const [[receiveAddress, currentReceiveAddress], setReceiveAddress] = useState<[string | null, string]>([null, '']);
  const [rawAmount, setRawAmount] = useState<string | undefined>(undefined);
  const [senderAddress, setSenderAddress] = useState<string>(currentAccountAddress);
  const showedNetworks = useShowedNetworks(senderAddress, accounts);
  const originChainOptions = showedNetworks.map(key => ({
    label: networkMap[key].chain,
    value: key,
  }));
  const firstOriginChain = selectedNetworkKey || originChainOptions[0].value;
  const [originToken, setOriginToken] = useState<string>(
    selectedToken || networkMap[firstOriginChain].nativeToken || 'Token',
  );
  const tokenList = useTokenOptions(senderAddress);
  const [originChain, setOriginChain] = useState<string>(firstOriginChain);
  const senderFreeBalance = useFreeBalance(originChain, senderAddress, originToken);
  const balanceFormat: BalanceFormatType = getBalanceFormat(originChain, originToken, chainRegistry);
  const tokenPrice = tokenPriceMap[originToken.toLowerCase()] || 0;
  const reformatAmount = new BigN(rawAmount || '0').div(BN_TEN.pow(balanceFormat[0]));
  const amountToUsd = reformatAmount.multipliedBy(new BigN(tokenPrice));
  const [isGasRequiredExceedsError, setGasRequiredExceedsError] = useState<boolean>(false);
  const [backupAmount, setBackupAmount] = useState<string | undefined>(undefined);
  const [recipientPhish, setRecipientPhish] = useState<string | null>(null);
  const [isBusy, setBusy] = useState(false);
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
  const isSameAddress =
    !!receiveAddress && !!senderAddress && receiveAddress === senderAddress && originChain === selectedDestinationChain;
  const canToggleAll = !!isSupportTransferAll && !!senderFreeBalance && !reference && !!receiveAddress;
  const amountGtAvailableBalance =
    !!rawAmount && !!senderFreeBalance && new BigN(rawAmount).gt(new BigN(senderFreeBalance));
  const [currentViewStep, setCurrentStep] = useState(ViewStep.SEND_FUND);
  const [txResult, setTxResult] = useState<TransferResultType>({ isShowTxResult: false, isTxSuccess: false });
  const { isShowTxResult } = txResult;
  const inputBalanceRef = createRef();
  const inputAddressRef = createRef();
  const amount = rawAmount ? Math.floor(Number(rawAmount)) : 0;

  const [isShowQrModalVisible, setShowQrModalVisible] = useState<boolean>(false);
  const checkOriginChainAndSenderIdType = !!networkMap[originChain].isEthereum === isEthereumAddress(senderAddress);
  const checkDestinationChainAndReceiverIdType =
    !!receiveAddress && !!networkMap[selectedDestinationChain].isEthereum === isEthereumAddress(receiveAddress);
  const isValidTransferInfo =
    !isAccountAll(senderAddress) &&
    checkOriginChainAndSenderIdType &&
    checkDestinationChainAndReceiverIdType &&
    !!receiveAddress &&
    !isSameAddress &&
    !recipientPhish;

  const canMakeTransfer = !!rawAmount && isSupportTransfer && !isGasRequiredExceedsError && !amountGtAvailableBalance;

  const _onChangeOriginChain = (currentOriginChain: string) => {
    const currentDestinationChainOptions = getDestinationChainOptions(currentOriginChain, networkMap);
    setOriginChain(currentOriginChain);
    setDestinationChain([currentDestinationChainOptions[0].value, currentDestinationChainOptions]);
    const currentSupportedMainTokens = getSupportedTokens(
      currentOriginChain,
      tokenList,
      currentDestinationChainOptions[0].value,
    );
    setOriginToken(currentSupportedMainTokens[0].symbol);
  };

  const _onChangeDestinationChain = useCallback((chain: string) => {
    setDestinationChain(prev => {
      return [chain, prev[1]];
    });
  }, []);

  const _doCheckTransfer = useCallback(
    (isConfirmTransferAll: boolean, thenCb: (rs: ResponseCheckTransfer) => void, catchCb: (rs: Error) => void) => {
      if (receiveAddress) {
        checkTransfer({
          networkKey: originChain,
          from: senderAddress,
          to: receiveAddress,
          transferAll: canToggleAll && isConfirmTransferAll,
          token: originToken,
          value: amount.toString(),
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
          value: amount.toString(),
        })
          .then(thenCb)
          .catch(catchCb);
      }
    },
    [amount, originChain, originToken, receiveAddress, selectedDestinationChain, senderAddress],
  );

  useEffect(() => {
    let isSync = true;

    if (receiveAddress && rawAmount) {
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
              console.log('rs', rs);
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
    rawAmount,
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
      .catch(e => console.log(e));

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

    transferCheckSupporting({ networkKey: originChain, token: originToken })
      .then(res => {
        if (isSync) {
          setTransferSupport([res.supportTransfer, res.supportTransferAll]);
        }
      })
      .catch(e => console.log(e));

    return () => {
      isSync = false;
      setTransferSupport([null, null]);
    };
  }, [originChain, originToken]);

  useEffect(() => {
    let isSync = true;

    if (receiveAddress) {
      checkAddress(receiveAddress)
        .then(v => {
          if (isSync) {
            setRecipientPhish(v);
          }
        })
        .catch(e => console.log('e', e));
    }

    return () => {
      isSync = false;
      setRecipientPhish(null);
    };
  }, [receiveAddress]);

  useEffect(() => {
    if (currentViewStep === ViewStep.SEND_FUND && inputBalanceRef.current) {
      // @ts-ignore
      inputBalanceRef.current.onChange(backupAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewStep, backupAmount, inputBalanceRef.current]);

  const onChangeAmount = (val?: string) => {
    setRawAmount(val);
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.TYPE_AMOUNT) {
      setCurrentStep(ViewStep.SEND_FUND);
    } else if (currentViewStep === ViewStep.CONFIRMATION) {
      setCurrentStep(ViewStep.TYPE_AMOUNT);
      setBackupAmount(rawAmount);
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
    setBusy(false);
  };

  const onUpdateInputBalance = () => {
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
  };

  const onUpdateInputAddress = (text: string) => {
    if (inputAddressRef && inputAddressRef.current) {
      // @ts-ignore
      inputAddressRef.current.onChange(text);
    }
  };

  const onPressQrButton = async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setShowQrModalVisible(true);
    }
  };

  const _onChangeSelectedToken = useCallback((tokenValueStr: string) => {
    setOriginToken(tokenValueStr);
  }, []);

  const _onChangeSenderAddress = (address: string) => {
    setSenderAddress(address);
  };

  return (
    <>
      {!isShowTxResult ? (
        <ContainerWithSubHeader onPressBack={onPressBack} disabled={isBusy} title={i18n.title.sendFund}>
          <>
            {currentViewStep === ViewStep.SEND_FUND && (
              <TouchableWithoutFeedback
                onPress={() => {
                  Keyboard.dismiss();
                }}>
                <View style={{ ...sharedStyles.layoutContainer }}>
                  <ScrollView style={{ ...ScrollViewStyle }}>
                    <View style={{ flex: 1 }}>
                      <OriginChainSelectField
                        label={'Origin Chain'}
                        networkKey={originChain}
                        networkOptions={originChainOptions}
                        onChangeOriginChain={_onChangeOriginChain}
                      />

                      <SendFromAddressField senderAddress={senderAddress} onChangeAddress={_onChangeSenderAddress} />

                      <DestinationChainSelectField
                        label={'Destination Chain'}
                        networkKey={selectedDestinationChain}
                        networkOptions={destinationChainOptions}
                        onChangeDestinationChain={_onChangeDestinationChain}
                      />

                      <InputAddress
                        ref={inputAddressRef}
                        onPressQrButton={onPressQrButton}
                        containerStyle={{ marginBottom: 8 }}
                        label={i18n.common.sendToAddress}
                        value={currentReceiveAddress}
                        onChange={onChangeReceiverAddress}
                      />

                      {isSameAddress && (
                        <Warning isDanger style={WarningStyle} message={i18n.warningMessage.isNotSameAddress} />
                      )}

                      {!checkOriginChainAndSenderIdType && (
                        <Warning
                          isDanger
                          style={WarningStyle}
                          message={`${i18n.warningMessage.originAccountMustBe}${
                            networkMap[originChain].isEthereum ? 'EVM' : 'substrate'
                          }${i18n.common.type}`}
                        />
                      )}

                      {!!receiveAddress && !checkDestinationChainAndReceiverIdType && (
                        <Warning
                          isDanger
                          style={WarningStyle}
                          message={`${i18n.warningMessage.destinationAccountMustBe}${
                            networkMap[originChain].isEthereum ? 'EVM' : 'substrate'
                          }${i18n.common.type}`}
                        />
                      )}

                      {!!recipientPhish && (
                        <Warning
                          style={WarningStyle}
                          isDanger
                          message={`${i18n.warningMessage.recipientPhish} ${recipientPhish}`}
                        />
                      )}
                    </View>
                  </ScrollView>

                  <View>
                    <SubmitButton
                      disabled={!isValidTransferInfo}
                      title={i18n.common.continue}
                      style={{ width: '100%', ...MarginBottomForSubmitButton }}
                      onPress={() => setCurrentStep(ViewStep.TYPE_AMOUNT)}
                    />
                  </View>

                  <QrScannerScreen
                    networkKey={selectedDestinationChain}
                    token={originToken}
                    qrModalVisible={isShowQrModalVisible}
                    onPressCancel={() => setShowQrModalVisible(false)}
                    onChangeAddress={text => onUpdateInputAddress(text)}
                    scanMessage={i18n.common.toSendFund}
                  />
                </View>
              </TouchableWithoutFeedback>
            )}

            {currentViewStep === ViewStep.TYPE_AMOUNT && (
              <>
                <ScrollView style={{ ...ContainerHorizontalPadding }} contentContainerStyle={{ flex: 1 }}>
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 28,
                      }}>
                      <View style={NetworkLogoWrapperStyle}>{getNetworkLogo(originChain, 34)}</View>
                      <ArrowRight
                        weight={'bold'}
                        size={16}
                        color={ColorMap.disabled}
                        style={{ marginHorizontal: 16 }}
                      />
                      <View style={NetworkLogoWrapperStyle}>{getNetworkLogo(selectedDestinationChain, 34)}</View>
                    </View>
                    <InputBalance
                      filteredNetworkKey={originChain}
                      value={amount ? getBalanceWithSi(amount.toString(), balanceFormat[0], si, originToken)[0] : ''}
                      icon={CaretDown}
                      placeholder={'0'}
                      si={si}
                      senderAddress={senderAddress}
                      maxValue={senderFreeBalance}
                      onChange={onChangeAmount}
                      decimals={balanceFormat[0]}
                      ref={inputBalanceRef}
                      siSymbol={originToken}
                      onChangeToken={_onChangeSelectedToken}
                      selectedNetworkKey={originChain}
                      selectedToken={originToken}
                      externalTokenOptions={originTokenList}
                    />
                    {reformatAmount && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={true} />}
                  </View>

                  {amountGtAvailableBalance && (
                    <Warning
                      isDanger
                      style={WarningStyle}
                      message={'The amount you want to transfer is greater than your available balance.'}
                    />
                  )}

                  {!isSupportTransfer && (
                    <Warning style={WarningStyle} isDanger message={i18n.warningMessage.notSupportTransferMessage} />
                  )}
                </ScrollView>

                <View style={{ paddingHorizontal: 16 }}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingBottom: 24,
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: ColorMap.light, ...sharedStyles.mainText, ...FontMedium }}>
                        {i18n.common.transferable}
                      </Text>
                      <FormatBalance format={balanceFormat} value={senderFreeBalance} />
                    </View>

                    <TouchableOpacity onPress={onUpdateInputBalance} disabled={!canToggleAll}>
                      <Text style={getUseMaxButtonTextStyle(!canToggleAll)}>{i18n.common.max}</Text>
                    </TouchableOpacity>
                  </View>

                  <SubmitButton
                    disabled={!canMakeTransfer}
                    title={i18n.common.continue}
                    style={{ width: '100%', ...MarginBottomForSubmitButton }}
                    onPress={() => setCurrentStep(ViewStep.CONFIRMATION)}
                  />
                </View>
              </>
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
                  value: amount.toString(),
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
                isBusy={isBusy}
                onChangeBusy={setBusy}
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
