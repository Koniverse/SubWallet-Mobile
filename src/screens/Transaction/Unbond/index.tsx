import { YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { RequestYieldLeave } from '@subwallet/extension-base/types/yield/actions/others';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import InputCheckBox from 'components/Input/InputCheckBox';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import { useYieldPositionDetail } from 'hooks/earning';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSelector } from 'react-redux';
import { accountFilterFunc } from 'screens/Transaction/helper/earning';
import { RootState } from 'stores/index';
import { AmountData, ExtrinsicType, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { BondedBalance } from 'screens/Transaction/parts/BondedBalance';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import { ScrollView, View } from 'react-native';
import { MinusCircle } from 'phosphor-react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { InputAmount } from 'components/Input/InputAmount';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { BN_ZERO } from 'utils/chainBalances';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { yieldSubmitLeavePool } from 'messaging/index';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { UnbondProps } from 'routes/transaction/transactionAction';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useWatch } from 'react-hook-form';
import { FormItem } from 'components/common/FormItem';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { getInputValuesFromString } from 'components/Input/InputAmount';
import { useGetBalance } from 'hooks/balance';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { mmkvStore } from 'utils/storage';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { UNSTAKE_ALERT_DATA } from 'constants/earning/EarningDataRaw';

interface UnstakeFormValues extends TransactionFormValues {
  nomination: string;
  fastLeave: string;
}

const _accountFilterFunc = (
  positionInfos: YieldPositionInfo[],
  chainInfoMap: Record<string, _ChainInfo>,
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nominator = positionInfos.find(item => item.address.toLowerCase() === account.address.toLowerCase());

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

  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo.type;
  const poolChain = poolInfo.chain;

  const [isTransactionDone, setTransactionDone] = useState(false);
  const { list: allPositions } = useYieldPositionDetail(slug);
  const { compound: positionInfo } = useYieldPositionDetail(slug, fromValue);
  const accountInfo = useGetAccountByAddress(fromValue);
  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);

  const unstakeDataRaw = useMemo(() => {
    try {
      return JSON.parse(mmkvStore.getString('unstakeStaticData') || '')[0] as StaticDataProps;
    } catch (e) {
      return UNSTAKE_ALERT_DATA[0];
    }
  }, []);

  const bondedSlug = useMemo(() => {
    switch (poolInfo.type) {
      case YieldPoolType.LIQUID_STAKING:
        return poolInfo.metadata.derivativeAssets[0];
      case YieldPoolType.LENDING:
      case YieldPoolType.NATIVE_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return poolInfo.metadata.inputAsset;
    }
  }, [poolInfo]);

  const bondedAsset = useGetChainAssetInfo(bondedSlug || poolInfo.metadata.inputAsset);
  const decimals = bondedAsset?.decimals || 0;
  const symbol = bondedAsset?.symbol || '';

  const selectedValidator = useMemo((): NominationInfo | undefined => {
    if (positionInfo) {
      return positionInfo.nominations.find(item => item.validatorAddress === currentValidator);
    } else {
      return undefined;
    }
  }, [currentValidator, positionInfo]);
  const { nativeTokenBalance } = useGetBalance(chainValue, fromValue);
  const existentialDeposit = useMemo(() => {
    const assetInfo = Object.values(assetRegistry).find(v => v.originChain === chainValue);
    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetRegistry, chainValue]);

  const showFastLeave = useMemo(() => {
    return poolInfo.metadata.availableMethod.defaultUnstake && poolInfo.metadata.availableMethod.fastUnstake;
  }, [poolInfo.metadata]);

  const mustChooseValidator = useMemo(() => {
    return isActionFromValidator(poolType, poolChain || '');
  }, [poolChain, poolType]);

  const bondedValue = useMemo((): string => {
    switch (poolInfo.type) {
      case YieldPoolType.NATIVE_STAKING:
        if (!mustChooseValidator) {
          return positionInfo?.activeStake || '0';
        } else {
          return selectedValidator?.activeStake || '0';
        }
      case YieldPoolType.LENDING: {
        const input = poolInfo.metadata.inputAsset;
        const exchaneRate = poolInfo.statistic?.assetEarning.find(item => item.slug === input)?.exchangeRate || 1;

        return new BigN(positionInfo?.activeStake || '0').multipliedBy(exchaneRate).toFixed(0);
      }
      case YieldPoolType.LIQUID_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return positionInfo?.activeStake || '0';
    }
  }, [poolInfo, mustChooseValidator, positionInfo?.activeStake, selectedValidator?.activeStake]);

  const unBondedTime = useMemo((): string => {
    if (
      poolInfo.statistic &&
      'unstakingPeriod' in poolInfo.statistic &&
      poolInfo.statistic.unstakingPeriod !== undefined
    ) {
      const time = poolInfo.statistic.unstakingPeriod;

      if (time >= 24) {
        const days = Math.floor(time / 24);
        const hours = time - days * 24;

        return `${days} days${hours ? ` ${hours} ${i18n.common.hours}` : ''}`;
      } else {
        return `${time} ${i18n.common.hours}`;
      }
    } else {
      return 'unknown time';
    }
  }, [poolInfo.statistic]);

  const [loading, setLoading] = useState(false);
  const accountList = useMemo(() => {
    return accounts.filter(_accountFilterFunc(allPositions, chainInfoMap, poolType, poolChain));
  }, [accounts, allPositions, chainInfoMap, poolChain, poolType]);

  const renderBounded = useCallback(() => {
    return <BondedBalance bondedBalance={bondedValue} decimals={decimals} symbol={symbol} />;
  }, [bondedValue, decimals, symbol]);

  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        existentialDeposit: getInputValuesFromString(existentialDeposit, estimateFee.decimals),
        availableBalance: getInputValuesFromString(nativeTokenBalance.value, estimateFee.decimals),
        maintainBalance: getInputValuesFromString(poolInfo.metadata.maintainBalance || '0', estimateFee.decimals),
        symbol: estimateFee.symbol,
      };
    },
    [existentialDeposit, nativeTokenBalance.value, poolInfo.metadata.maintainBalance],
  );
  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, fromValue);
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
  }, [positionInfo, getValues, slug, poolInfo, mustChooseValidator, currentValidator, onSuccess, onError]);

  const nominators = useMemo(() => {
    if (fromValue && positionInfo?.nominations && positionInfo.nominations.length) {
      return positionInfo.nominations.filter(n => new BigN(n.activeStake || '0').gt(BN_ZERO));
    }

    return [];
  }, [fromValue, positionInfo?.nominations]);

  const onChangeNominator = (value: string) => {
    setValue('nomination', value);
  };

  const isDisableSubmitBtn = useMemo(
    () => !!errors.value || !currentValue || !fromValue || loading || !isBalanceReady,
    [currentValue, errors.value, fromValue, isBalanceReady, loading],
  );

  const onChangeFastLeave = useCallback(
    (value: string) => {
      setValue('fastLeave', value);
      formTrigger('value').catch(console.error);
    },
    [setValue, formTrigger],
  );

  useEffect(() => {
    if (poolInfo.metadata.availableMethod.defaultUnstake && poolInfo.metadata.availableMethod.fastUnstake) {
      return;
    } else {
      if (poolInfo.metadata.availableMethod.defaultUnstake) {
        setValue('fastLeave', '');
      } else {
        setValue('fastLeave', '1');
      }
    }
  }, [poolInfo.metadata, setValue]);

  useEffect(() => {
    setChain(poolChain || '');
  }, [setChain, poolChain]);

  useEffect(() => {
    if (!fromValue && accountList.length === 1) {
      setFrom(accountList[0].address);
    }
  }, [accountList, fromValue, setFrom]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout
          title={poolInfo.type === YieldPoolType.LENDING ? i18n.header.withdraw : i18n.header.unstake}
          disableLeftButton={loading}
          disableMainHeader={loading}>
          <>
            <ScrollView
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
                  />
                  {renderBounded()}
                </>
              )}

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
                poolInfo.type !== YieldPoolType.LENDING ? (
                  <>
                    {!!unstakeDataRaw.instructions.length && (
                      <View
                        style={{
                          gap: theme.sizeSM,
                          marginTop: mustChooseValidator ? theme.marginSM : 0,
                          marginBottom: theme.marginSM,
                        }}>
                        {unstakeDataRaw.instructions.map((_props, index) => {
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
                  description={'With fast unstake, you will receive your funds immediately with a higher fee'}
                  type={'info'}
                />
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
                onPress={onPreCheckReadOnly(onSubmit)}>
                {poolInfo.type === YieldPoolType.LENDING ? i18n.buttonTitles.withdraw : i18n.buttonTitles.unstake}
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
