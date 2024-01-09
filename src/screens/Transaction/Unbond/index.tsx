import { YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { RequestYieldLeave } from '@subwallet/extension-base/types/yield/actions/others';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import { useYieldPositionDetail } from 'hooks/earning';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSelector } from 'react-redux';
import { accountFilterFunc } from 'screens/Transaction/helper/earning';
import { RootState } from 'stores/index';
import useGetChainStakingMetadata from 'hooks/screen/Staking/useGetChainStakingMetadata';
import { AmountData, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
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
import { formatBalance } from 'utils/number';
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
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { FormItem } from 'components/common/FormItem';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { getInputValuesFromString } from 'components/Input/InputAmount';
import { useGetBalance } from 'hooks/balance';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import { UNSTAKE_ALERT_DATA } from '../../../../EarningDataRaw';

interface UnstakeFormValues extends TransactionFormValues {
  nomination: string;
}

export interface UnbondBoxProps {
  title: string;
  description: React.ReactNode;
  iconColor: string;
  icon: PhosphorIcon;
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
    title,
    form: {
      setValue,
      control,
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
    },
  });

  const fromValue = useWatch<UnstakeFormValues>({ name: 'from', control });
  const currentValidator = useWatch<UnstakeFormValues>({ name: 'nomination', control });
  const chainValue = useWatch<UnstakeFormValues>({ name: 'chain', control });
  const currentValue = useWatch<UnstakeFormValues>({ name: 'value', control });

  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo.type;
  const poolChain = poolInfo.chain;

  const [isTransactionDone, setTransactionDone] = useState(false);
  const chainStakingMetadata = useGetChainStakingMetadata(poolChain);
  const { list: allPositions } = useYieldPositionDetail(slug);
  const { compound: positionInfo } = useYieldPositionDetail(slug, fromValue);
  const accountInfo = useGetAccountByAddress(fromValue);

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

  const minValue = useMemo((): string => {
    if (poolType === YieldPoolType.NOMINATION_POOL) {
      return chainStakingMetadata?.minJoinNominationPool || '0';
    } else {
      const minChain = new BigN(chainStakingMetadata?.minStake || '0');
      const minValidator = new BigN(selectedValidator?.validatorMinStake || '0');

      return minChain.gt(minValidator) ? minChain.toString() : minValidator.toString();
    }
  }, [
    chainStakingMetadata?.minJoinNominationPool,
    chainStakingMetadata?.minStake,
    selectedValidator?.validatorMinStake,
    poolType,
  ]);

  const minWithdraw = useMemo((): string => {
    switch (poolInfo.type) {
      case YieldPoolType.LENDING:
      case YieldPoolType.LIQUID_STAKING:
        return poolInfo.statistic?.minWithdrawal || '0';
      default:
        return '0';
    }
  }, [poolInfo]);

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
        symbol: estimateFee.symbol,
      };
    },
    [existentialDeposit, nativeTokenBalance.value],
  );
  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, fromValue);
  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    chainValue === 'vara_network' && poolType === YieldPoolType.NOMINATION_POOL
      ? handleDataForInsufficientAlert
      : undefined,
  );

  const onSubmit = useCallback(() => {
    if (!positionInfo) {
      return;
    }

    const request: RequestYieldLeave = {
      address: fromValue,
      amount: currentValue,
      fastLeave: false,
      slug: slug,
      poolInfo: poolInfo,
    };

    if ([YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(poolType)) {
      request.fastLeave = true;
    }

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
    poolInfo,
    positionInfo,
    fromValue,
    currentValue,
    slug,
    poolType,
    mustChooseValidator,
    currentValidator,
    onSuccess,
    onError,
  ]);

  const nominators = useMemo(() => {
    if (fromValue && positionInfo?.nominations && positionInfo.nominations.length) {
      return positionInfo.nominations.filter(n => new BigN(n.activeStake || '0').gt(BN_ZERO));
    }

    return [];
  }, [fromValue, positionInfo?.nominations]);

  const amountInputRules = useMemo(
    () => ({
      validate: (value: string): Promise<ValidateResult> => {
        const _minWithdraw = new BigN(minWithdraw);
        const _minWithdrawString = formatBalance(_minWithdraw, decimals);
        const _minValue = new BigN(minValue);
        const _maxValue = new BigN(bondedValue);
        const _middleValue = _maxValue.minus(_minValue);
        const _maxString = formatBalance(_maxValue, decimals);
        const val = new BigN(value);
        const name = 'Value';

        if (val.gt(_maxValue)) {
          return Promise.resolve(i18n.formatString(i18n.errorMessage.unbondMustBeEqualOrLessThan, name, _maxString));
        }

        if (val.lte(BN_ZERO)) {
          return Promise.resolve(i18n.formatString(i18n.errorMessage.unbondMustBeGreaterThanZero, name));
        }

        if (val.lt(_minWithdraw)) {
          return Promise.resolve(
            i18n.formatString(i18n.errorMessage.unbondMustBeEqualOrGreaterThan, name, _minWithdrawString),
          );
        }

        if (_middleValue.lt(BN_ZERO) && !val.eq(_maxValue)) {
          return Promise.resolve(i18n.formatString(i18n.errorMessage.unbondMustBeEqual, name, _maxString));
        }

        if (val.gt(_middleValue) && val.lt(_maxValue)) {
          return Promise.resolve(i18n.errorMessage.unbondInvalidAmount);
        }

        return Promise.resolve(undefined);
      },
    }),
    [bondedValue, decimals, minValue, minWithdraw],
  );

  const onChangeNominator = (value: string) => {
    setValue('nomination', value);
  };

  const isDisableSubmitBtn = useMemo(
    () => !!errors.value || !currentValue || !fromValue || loading,
    [currentValue, errors.value, fromValue, loading],
  );

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
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
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

              <GeneralFreeBalance address={fromValue} chain={chainValue} />

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
                rules={amountInputRules}
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

              {!!UNSTAKE_ALERT_DATA.length && (
                <View
                  style={{
                    gap: theme.sizeSM,
                    marginTop: mustChooseValidator ? theme.marginSM : 0,
                    marginBottom: theme.marginSM,
                  }}>
                  {UNSTAKE_ALERT_DATA.map((_props, index) => {
                    return (
                      <AlertBoxBase
                        key={index}
                        title={_props.title}
                        description={(_props.description as string)?.replace('{unBondedTime}', unBondedTime)}
                        iconColor={_props.iconColor}
                        icon={getBannerButtonIcon(_props.icon) as PhosphorIcon}
                      />
                    );
                  })}
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
                onPress={onPreCheckReadOnly(onSubmit)}>
                {i18n.buttonTitles.unbond}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};
