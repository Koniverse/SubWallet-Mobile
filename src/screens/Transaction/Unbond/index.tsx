import {
  AccountProxy,
  SpecialYieldPoolMetadata,
  SubnetYieldPositionInfo,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import { RequestYieldLeave } from '@subwallet/extension-base/types/yield/actions/others';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import InputCheckBox from 'components/Input/InputCheckBox';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import { useYieldPositionDetail } from 'hooks/earning';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSelector } from 'react-redux';
import { accountFilterFunc } from 'screens/Transaction/helper/earning';
import { RootState } from 'stores/index';
import { AmountData, ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { BondedBalance } from 'screens/Transaction/parts/BondedBalance';
import { findNodeHandle, Keyboard, ScrollView, UIManager, View } from 'react-native';
import { MinusCircle } from 'phosphor-react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { InputAmount } from 'components/Input/InputAmount';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { BN_ZERO } from 'utils/chainBalances';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { Button, Icon, Typography, Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getEarningSlippage, yieldSubmitLeavePool } from 'messaging/index';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { UnbondProps } from 'routes/transaction/transactionAction';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useWatch } from 'react-hook-form';
import { FormItem } from 'components/common/FormItem';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { mmkvStore } from 'utils/storage';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import {
  UNSTAKE_ALERT_DATA,
  UNSTAKE_BIFROST_ALERT_DATA,
  UNSTAKE_BITTENSOR_ALERT_DATA,
} from 'constants/earning/EarningDataRaw';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { GlobalModalContext } from 'providers/GlobalModalContext';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { AccountAddressItemType } from 'types/account';
import { getReformatedAddressRelatedToChain } from 'utils/account';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { getEarningTimeText } from 'utils/earning';
import { SlippageType } from '@subwallet/extension-base/types/swap';
import MetaInfo from 'components/MetaInfo';
import BigNumber from 'bignumber.js';

interface UnstakeFormValues extends TransactionFormValues {
  nomination: string;
  fastLeave: string;
}

const _accountFilterFunc = (
  positionInfos: YieldPositionInfo[],
  chainInfoMap: Record<string, _ChainInfo>,
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountProxy) => boolean) => {
  return (account: AccountProxy): boolean => {
    const nominator = positionInfos.find(
      item => account.accounts && account.accounts.some(ap => ap.address.toLowerCase() === item.address.toLowerCase()),
    );

    return (
      new BigN(nominator?.activeStake || BN_ZERO).gt(BN_ZERO) &&
      accountFilterFunc(chainInfoMap, poolType, poolChain)(account)
    );
  };
};

export const Unbond = ({
  route: {
    params: { slug },
  },
}: UnbondProps) => {
  const theme = useSubWalletTheme().swThemes;
  const accountSelectorRef = useRef<ModalRef>();
  const {
    form: {
      setValue,
      getValues,
      control,
      trigger: formTrigger,
      formState: { errors },
    },
    onChangeChainValue: setChain,
    onChangeFromValue: setFrom,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<UnstakeFormValues>('unstake', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nomination: '',
      fastLeave: '',
    },
  });

  const fromValue = useWatch<UnstakeFormValues>({ name: 'from', control });
  const currentValidator = useWatch<UnstakeFormValues>({ name: 'nomination', control });
  const chainValue = useWatch<UnstakeFormValues>({ name: 'chain', control });
  const currentValue = useWatch<UnstakeFormValues>({ name: 'value', control });
  const fastLeave = useWatch<UnstakeFormValues>({ name: 'fastLeave', control });

  const { accountProxies, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo?.type;
  const poolChain = poolInfo?.chain;
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('unstake');
  const [isTransactionDone, setTransactionDone] = useState(false);
  const { list: allPositions } = useYieldPositionDetail(slug);
  const { compound: positionInfo } = useYieldPositionDetail(slug, fromValue);
  const accountInfo = useGetAccountByAddress(fromValue);
  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const onPreCheck = usePreCheckAction(fromValue);
  const globalAppModalContext = useContext(GlobalModalContext);
  const isMythosStaking = useMemo(() => _STAKING_CHAIN_GROUP.mythos.includes(poolChain), [poolChain]);

  const currentConfirmations = useMemo(() => {
    if (slug) {
      return getCurrentConfirmation([slug]);
    } else {
      return undefined;
    }
  }, [getCurrentConfirmation, slug]);
  const unstakeDataRaw = useMemo(() => {
    try {
      const storedData = JSON.parse(mmkvStore.getString('unstakeStaticData') || '{}')[0] as StaticDataProps;

      if (storedData?.id) {
        return storedData;
      } else {
        return UNSTAKE_ALERT_DATA[0];
      }
    } catch (e) {
      return UNSTAKE_ALERT_DATA[0];
    }
  }, []);

  const bondedSlug = useMemo(() => {
    switch (poolType) {
      case YieldPoolType.LIQUID_STAKING:
        return poolInfo?.metadata?.derivativeAssets?.[0];
      case YieldPoolType.LENDING:
      case YieldPoolType.NATIVE_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return poolInfo?.metadata.inputAsset;
    }
  }, [poolInfo, poolType]);

  const bondedAsset = useGetChainAssetInfo(bondedSlug || poolInfo.metadata.inputAsset);
  const decimals = bondedAsset?.decimals || 0;
  const symbol = (positionInfo as SubnetYieldPositionInfo).subnetData?.subnetSymbol || bondedAsset?.symbol || '';
  const altAsset = useGetChainAssetInfo((poolInfo?.metadata as SpecialYieldPoolMetadata)?.altInputAssets);
  const altSymbol = altAsset?.symbol || '';

  // For subnet staking

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);
  const [earningSlippage, setEarningSlippage] = useState<number>(0);
  const [maxSlippage, setMaxSlippage] = useState<SlippageType>({ slippage: new BigN(0.005), isCustomType: true });
  const [earningRate, setEarningRate] = useState<number>(0);
  const debounce = useRef<NodeJS.Timeout | null>(null);

  const isDisabledSubnetContent = useMemo(
    () => !isSubnetStaking || !currentValue,

    [isSubnetStaking, currentValue],
  );

  useEffect(() => {
    if (!isDisabledSubnetContent) {
      return;
    }

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    debounce.current = setTimeout(() => {
      const netuid = poolInfo.metadata.subnetData?.netuid || 0;
      const data = {
        slug: poolInfo.slug,
        value: currentValue,
        netuid: netuid,
        type: ExtrinsicType.STAKING_UNBOND,
      };

      getEarningSlippage(data)
        .then(result => {
          console.log('Actual stake slippage:', result.slippage * 100);
          setEarningSlippage(result.slippage);
          setEarningRate(result.rate);
        })
        .catch(error => {
          console.error('Error fetching earning slippage:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);

    return () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [currentValue, isDisabledSubnetContent, isSubnetStaking, poolInfo.metadata.subnetData?.netuid, poolInfo.slug]);

  const isSlippageAcceptable = useMemo(() => {
    if (earningSlippage === null || !currentValue) {
      return true;
    }

    return earningSlippage <= maxSlippage.slippage.toNumber();
  }, [currentValue, earningSlippage, maxSlippage]);
  const scrollViewRef = useRef<ScrollView>(null);
  const alertBoxRef = useRef<View>(null);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  const scrollToAlertBox = useCallback(() => {
    if (alertBoxRef.current && scrollViewRef.current) {
      const handle = findNodeHandle(alertBoxRef.current);
      if (handle) {
        UIManager.measureLayout(
          handle,
          findNodeHandle(scrollViewRef.current)!,
          () => console.warn('measureLayout failed'),
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!isSlippageAcceptable && !hasScrolled) {
      scrollToAlertBox();
      setHasScrolled(true);
    }
  }, [isSlippageAcceptable, hasScrolled, scrollToAlertBox]);

  const renderRate = useCallback(() => {
    return (
      <MetaInfo
        labelColorScheme={'gray'}
        spaceSize={'sm'}
        valueColorScheme={'gray'}
        style={{ marginTop: theme.sizeSM }}>
        <MetaInfo.Number
          decimals={decimals}
          label={'Expected TAO to receive'}
          suffix={bondedAsset?.symbol || ''}
          value={BigNumber(currentValue).multipliedBy(earningRate)}
          unitColor={theme['gray-5']}
          decimalColor={theme['gray-5']}
          intColor={theme['gray-5']}
        />
        <MetaInfo.Default label={'Conversion rate'}>
          <View style={{ flexDirection: 'row' }}>
            <Typography.Text style={{ color: '#A6A6A6' }}>{`1 ${bondedAsset?.symbol || ''} = `}</Typography.Text>
            <Number
              size={14}
              intColor={theme['gray-5']}
              decimalColor={theme['gray-5']}
              unitColor={theme['gray-5']}
              decimal={decimals}
              suffix={poolInfo.metadata?.subnetData?.subnetSymbol || ''}
              value={BigN(1)
                .multipliedBy(10 ** decimals)
                .multipliedBy(1 / earningRate)}
            />
          </View>
        </MetaInfo.Default>
      </MetaInfo>
    );
  }, [decimals, bondedAsset?.symbol, currentValue, earningRate, theme, poolInfo.metadata?.subnetData?.subnetSymbol]);

  // For subnet staking

  const selectedValidator = useMemo((): NominationInfo | undefined => {
    if (positionInfo) {
      return positionInfo.nominations.find(item => item.validatorAddress === currentValidator);
    } else {
      return undefined;
    }
  }, [currentValidator, positionInfo]);

  const showFastLeave = useMemo(() => {
    return poolInfo?.metadata.availableMethod.defaultUnstake && poolInfo?.metadata.availableMethod.fastUnstake;
  }, [poolInfo?.metadata]);

  const mustChooseValidator = useMemo(() => {
    return isActionFromValidator(poolType, poolChain || '');
  }, [poolChain, poolType]);

  const bondedValue = useMemo((): string => {
    switch (poolType) {
      case YieldPoolType.NATIVE_STAKING:
        if (!mustChooseValidator) {
          return positionInfo?.activeStake || '0';
        } else {
          return selectedValidator?.activeStake || '0';
        }
      case YieldPoolType.LENDING: {
        const input = poolInfo?.metadata.inputAsset;
        const exchaneRate = poolInfo?.statistic?.assetEarning.find(item => item.slug === input)?.exchangeRate || 1;

        return new BigN(positionInfo?.activeStake || '0').multipliedBy(exchaneRate).toFixed(0);
      }
      case YieldPoolType.SUBNET_STAKING: {
        return selectedValidator?.activeStake || '0';
      }
      case YieldPoolType.LIQUID_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return positionInfo?.activeStake || '0';
    }
  }, [
    poolType,
    mustChooseValidator,
    positionInfo?.activeStake,
    selectedValidator?.activeStake,
    poolInfo?.metadata.inputAsset,
    poolInfo?.statistic?.assetEarning,
  ]);

  const unBondedTime = useMemo((): string => {
    if (
      poolInfo?.statistic &&
      'unstakingPeriod' in poolInfo?.statistic &&
      poolInfo?.statistic.unstakingPeriod !== undefined
    ) {
      const time = poolInfo?.statistic.unstakingPeriod;

      return getEarningTimeText(time);
    } else {
      return 'unknown time';
    }
  }, [poolInfo?.statistic]);

  const [loading, setLoading] = useState(false);
  const accountList: AccountAddressItemType[] = useMemo(() => {
    const chainInfo = poolChain ? chainInfoMap[poolChain] : undefined;
    if (!chainInfo) {
      return [];
    }
    const filteredAccountList = accountProxies.filter(
      _accountFilterFunc(allPositions, chainInfoMap, poolType, poolChain),
    );

    const result: AccountAddressItemType[] = [];
    filteredAccountList.forEach(ap => {
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
  }, [accountProxies, allPositions, chainInfoMap, poolChain, poolType]);

  const renderBounded = useCallback(() => {
    return (
      <BondedBalance
        bondedBalance={bondedValue}
        decimals={decimals}
        symbol={symbol}
        isSlippageAcceptable={isSlippageAcceptable}
        isSubnetStaking={isSubnetStaking}
        maxSlippage={maxSlippage}
        setMaxSlippage={setMaxSlippage}
      />
    );
  }, [bondedValue, decimals, isSlippageAcceptable, isSubnetStaking, maxSlippage, symbol]);

  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        chainName: chainInfoMap[chainValue]?.name || '',
        symbol: estimateFee.symbol,
      };
    },
    [chainInfoMap, chainValue],
  );
  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    handleDataForInsufficientAlert,
  );

  const onSubmit = useCallback(() => {
    if (!positionInfo) {
      return;
    }

    const { from, value, fastLeave: _fastLeave } = getValues();

    const request: RequestYieldLeave = {
      address: from,
      amount: value,
      fastLeave: !!_fastLeave,
      slug: slug,
      poolInfo: poolInfo,
      slippage: maxSlippage.slippage.toNumber(),
    };

    if (mustChooseValidator) {
      request.selectedTarget = currentValidator || '';
    }

    const unbondingPromise = yieldSubmitLeavePool(request);

    setLoading(true);

    setTimeout(() => {
      unbondingPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [
    positionInfo,
    getValues,
    slug,
    poolInfo,
    maxSlippage.slippage,
    mustChooseValidator,
    currentValidator,
    onSuccess,
    onError,
  ]);

  const onPressSubmit = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      if (currentConfirmations && currentConfirmations.length) {
        globalAppModalContext.setGlobalModal({
          visible: true,
          title: currentConfirmations[0].name,
          message: currentConfirmations[0].content,
          type: 'confirmation',
          externalButtons: renderConfirmationButtons(globalAppModalContext.hideGlobalModal, () => {
            onSubmit();
            globalAppModalContext.hideGlobalModal();
          }),
        });
      } else {
        onSubmit();
      }
    }, 100);
  }, [currentConfirmations, globalAppModalContext, onSubmit, renderConfirmationButtons]);

  const nominators = useMemo(() => {
    if (fromValue && positionInfo?.nominations && positionInfo.nominations.length) {
      return positionInfo.nominations.filter(n => new BigN(n.activeStake || '0').gt(BN_ZERO));
    }

    return [];
  }, [fromValue, positionInfo?.nominations]);

  const onChangeNominator = useCallback(
    (value: string) => {
      setValue('nomination', value);
    },
    [setValue],
  );

  const isDisableSubmitBtn = useMemo(
    () =>
      !!errors.value ||
      !currentValue ||
      !fromValue ||
      loading ||
      !isBalanceReady ||
      !isSlippageAcceptable ||
      (isMythosStaking && !currentValidator),
    [
      currentValidator,
      currentValue,
      errors.value,
      fromValue,
      isBalanceReady,
      isMythosStaking,
      isSlippageAcceptable,
      loading,
    ],
  );

  const onChangeFastLeave = useCallback(
    (value: string) => {
      setValue('fastLeave', value);
      formTrigger('value').catch(console.error);
    },
    [setValue, formTrigger],
  );

  useEffect(() => {
    if (!currentValidator) {
      if (nominators[0]?.validatorAddress) {
        console.log('nominators[0]', nominators[0]);
        setValue('nomination', nominators[0].validatorAddress);
      }
    }
  }, [currentValidator, nominators, setValue]);

  useEffect(() => {
    if (isMythosStaking) {
      setValue('value', bondedValue);
    }
  }, [bondedValue, isMythosStaking, setValue]);

  useEffect(() => {
    if (poolInfo?.metadata.availableMethod.defaultUnstake && poolInfo?.metadata.availableMethod.fastUnstake) {
      return;
    } else {
      if (poolInfo?.metadata.availableMethod.defaultUnstake) {
        setValue('fastLeave', '');
      } else {
        setValue('fastLeave', '1');
      }
    }
  }, [poolInfo?.metadata, setValue]);

  useEffect(() => {
    setChain(poolChain || '');
  }, [setChain, poolChain]);

  useEffect(() => {
    if (!fromValue && accountList.length === 1) {
      setFrom(accountList[0].address);
    }
  }, [accountList, fromValue, setFrom]);

  useEffect(() => {
    if (nominators && nominators.length === 1) {
      onChangeNominator(nominators[0].validatorAddress);
    }
  }, [nominators, onChangeNominator]);

  const unstakeAlertData =
    poolChain === 'bifrost_dot'
      ? UNSTAKE_BIFROST_ALERT_DATA[0]
      : poolChain.startsWith('bittensor')
      ? UNSTAKE_BITTENSOR_ALERT_DATA[0]
      : unstakeDataRaw;

  const exType = useMemo(() => {
    if (
      poolType === YieldPoolType.NOMINATION_POOL ||
      poolType === YieldPoolType.NATIVE_STAKING ||
      poolType === YieldPoolType.SUBNET_STAKING
    ) {
      return ExtrinsicType.STAKING_UNBOND;
    }

    if (poolType === YieldPoolType.LIQUID_STAKING) {
      if (chainValue === 'moonbeam') {
        return ExtrinsicType.UNSTAKE_STDOT;
      }

      return ExtrinsicType.UNSTAKE_LDOT;
    }

    if (poolType === YieldPoolType.LENDING) {
      return ExtrinsicType.UNSTAKE_LDOT;
    }

    return ExtrinsicType.STAKING_UNBOND;
  }, [poolType, chainValue]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout
          title={poolType === YieldPoolType.LENDING ? i18n.header.withdraw : i18n.header.unstake}
          disableLeftButton={loading}
          disableMainHeader={loading}>
          <>
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingTop: 16 }}
              keyboardShouldPersistTaps="handled">
              <AccountSelector
                items={accountList}
                selectedValueMap={{ [fromValue]: true }}
                disabled={loading || !isAllAccount}
                onSelectItem={item => {
                  setFrom(item.address);
                  accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                }}
                renderSelected={() => (
                  <AccountSelectField
                    label={i18n.inputLabel.unstakeFromAcc}
                    accountName={accountInfo?.name || ''}
                    value={fromValue}
                    showIcon
                  />
                )}
                accountSelectorRef={accountSelectorRef}
              />

              <GeneralFreeBalance address={fromValue} chain={chainValue} onBalanceReady={setIsBalanceReady} />

              {mustChooseValidator && (
                <>
                  <NominationSelector
                    selectedValue={currentValidator}
                    onSelectItem={onChangeNominator}
                    nominators={nominators}
                    disabled={!fromValue || loading}
                    label={
                      i18n.formatString(
                        i18n.common.selectStakingValidator,
                        getValidatorLabel(chainValue) === 'dApp'
                          ? getValidatorLabel(chainValue)
                          : getValidatorLabel(chainValue).toLowerCase(),
                      ) as string
                    }
                    poolInfo={poolInfo}
                  />
                  {renderBounded()}
                </>
              )}

              {!isMythosStaking && (
                <FormItem
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputAmount
                      ref={ref}
                      value={value}
                      maxValue={bondedValue}
                      onChangeValue={onChange}
                      decimals={decimals}
                      disable={loading}
                      showMaxButton={!!fromValue}
                    />
                  )}
                  name={'value'}
                />
              )}

              {!isDisabledSubnetContent && earningRate > 0 && <>{renderRate()}</>}

              {!mustChooseValidator && renderBounded()}

              {showFastLeave && (
                <InputCheckBox
                  checked={!!fastLeave}
                  label={i18n.inputLabel.fastUnstake}
                  disable={loading}
                  onPress={() => {
                    if (!fastLeave) {
                      onChangeFastLeave('1');
                    } else {
                      onChangeFastLeave('');
                    }
                  }}
                  checkBoxSize={20}
                  wrapperStyle={{ paddingTop: 0 }}
                />
              )}
              {!fastLeave || !showFastLeave ? (
                poolType !== YieldPoolType.LENDING ? (
                  <>
                    {!!unstakeAlertData.instructions.length && (
                      <View
                        style={{
                          gap: theme.sizeSM,
                          marginTop: mustChooseValidator && !isMythosStaking ? theme.marginSM : 0,
                          marginBottom: theme.marginSM,
                        }}>
                        {unstakeAlertData.instructions.map((_props, index) => {
                          return (
                            <AlertBoxBase
                              key={index}
                              title={_props.title}
                              description={(_props.description as string)?.replace('{unBondedTime}', unBondedTime)}
                              iconColor={_props.icon_color}
                              icon={getBannerButtonIcon(_props.icon) as PhosphorIcon}
                            />
                          );
                        })}
                      </View>
                    )}
                  </>
                ) : (
                  <AlertBox
                    title={'Withdraw'}
                    description={'You can withdraw your supplied funds immediately'}
                    type={'info'}
                  />
                )
              ) : (
                <AlertBox
                  title={'Fast unstake'}
                  description={
                    poolChain === 'bifrost_dot'
                      ? `In this mode, ${symbol} will be directly exchanged for ${altSymbol} at the market price without waiting for the unstaking period`
                      : 'With fast unstake, you will receive your funds immediately with a higher fee'
                  }
                  type={'info'}
                />
              )}

              {!isSlippageAcceptable && (
                <View ref={alertBoxRef}>
                  <AlertBox
                    title={'Slippage too high!'}
                    description={`Unable to stake due to a slippage of ${(earningSlippage * 100).toFixed(
                      2,
                    )}%, which exceeds the maximum allowed. Lower your stake amount and try again`}
                    type={'error'}
                  />
                </View>
              )}
            </ScrollView>

            <View style={{ paddingHorizontal: 16, paddingTop: 16, ...MarginBottomForSubmitButton }}>
              <Button
                disabled={isDisableSubmitBtn}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={MinusCircle}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={isDisableSubmitBtn ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }
                onPress={onPreCheck(onPressSubmit, exType)}>
                {poolType === YieldPoolType.LENDING ? i18n.buttonTitles.withdraw : i18n.buttonTitles.unstake}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone
          transactionDoneInfo={transactionDoneInfo}
          extrinsicType={fastLeave ? ExtrinsicType.STAKING_WITHDRAW : undefined}
        />
      )}
    </>
  );
};
