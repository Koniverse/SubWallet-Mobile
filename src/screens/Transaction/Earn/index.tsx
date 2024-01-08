import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  NominationPoolInfo,
  OptimalYieldPathParams,
  ValidatorInfo,
  YieldAssetExpectedEarning,
  YieldCompoundingPeriod,
  YieldPoolType,
  YieldStepType,
} from '@subwallet/extension-base/types';
import { OptimalYieldPath } from '@subwallet/extension-base/types/yield/actions/join/step';
import {
  SubmitJoinNativeStaking,
  SubmitJoinNominationPool,
  SubmitYieldJoinData,
} from '@subwallet/extension-base/types/yield/actions/join/submit';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { addLazy } from '@subwallet/extension-base/utils/lazy';
import { FormItem } from 'components/common/FormItem';
import { ActivityIndicator, Button, Divider, Icon, Number, Typography } from 'components/design-system-ui';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { getInputValuesFromString, InputAmount } from 'components/Input/InputAmount';
import EarningProcessItem from 'components/Item/Earning/EarningProcessItem';
import MetaInfo from 'components/MetaInfo';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import EarningPoolDetailModal from 'components/Modal/Earning/EarningPoolDetailModal';
import { EarningPoolSelector } from 'components/Modal/Earning/EarningPoolSelector';
import { EarningValidatorSelector, ValidatorSelectorRef } from 'components/Modal/Earning/EarningValidatorSelector';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import useFetchChainState from 'hooks/screen/useFetchChainState';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import {
  fetchPoolTarget,
  getOptimalYieldPath,
  submitJoinYieldPool,
  unlockDotCheckCanMint,
  validateYieldProcess,
} from 'messaging/index';
import { PlusCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Keyboard, ScrollView, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { DEFAULT_YIELD_PROCESS, EarningActionType, earningReducer } from 'reducers/earning';
import { EarningProps } from 'routes/transaction/transactionAction';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import FreeBalanceToYield from 'screens/Transaction/parts/FreeBalanceToEarn';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { RootState, store } from 'stores/index';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ModalRef } from 'types/modalRef';
import i18n from 'utils/i18n/i18n';
import { balanceFormatter, formatNumber } from 'utils/number';
import { parseNominations } from 'utils/transaction/stake';
import { accountFilterFunc, getJoinYieldParams } from '../helper/earning';
import createStyle from './style';
import { useYieldPositionDetail } from 'hooks/earning';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { STAKE_ALERT_DATA } from '../../../../EarningDataRaw';

interface _YieldAssetExpectedEarning extends YieldAssetExpectedEarning {
  symbol: string;
}

interface StakeFormValues extends TransactionFormValues {
  slug: string;
  target: string;
}

const loadingStepPromiseKey = 'earning.step.loading';

const EarnTransaction: React.FC<EarningProps> = (props: EarningProps) => {
  const {
    route: {
      params: { slug },
    },
  } = props;
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { show, hideAll } = useToast();

  const {
    title,
    form: {
      control,
      setValue,
      formState: { errors },
      getValues,
    },
    onChangeFromValue: setFrom,
    onChangeAssetValue: setAsset,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<StakeFormValues>('stake', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      slug: slug,
      target: '',
    },
  });

  const currentFrom = useWatch<StakeFormValues>({ name: 'from', control });
  const currentAmount = useWatch<StakeFormValues>({ name: 'value', control });
  const chain = useWatch<StakeFormValues>({ name: 'chain', control });
  const poolTarget = useWatch<StakeFormValues>({ name: 'target', control });

  const accountSelectorRef = useRef<ModalRef>();
  const validatorSelectorRef = useRef<ValidatorSelectorRef>(null);
  const fromRef = useRef<string>(currentFrom);
  const isPressInfoBtnRef = useRef<boolean>(false);

  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap, poolTargetsMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry: chainAsset } = useSelector((state: RootState) => state.assetRegistry);
  const { priceMap } = useSelector((state: RootState) => state.price);

  const [processState, dispatchProcessState] = useReducer(earningReducer, DEFAULT_YIELD_PROCESS);

  const currentStep = processState.currentStep;
  const nextStepType = processState.steps?.[currentStep + 1]?.type;

  const accountInfo = useGetAccountByAddress(currentFrom);
  const preCheckAction = usePreCheckAction(currentFrom);
  const { compound } = useYieldPositionDetail(slug);

  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo.type;
  const poolChain = poolInfo.chain;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const accountSelectorList = useMemo(
    () => accounts.filter(accountFilterFunc(chainInfoMap, poolType, poolChain)),
    [accounts, poolChain, chainInfoMap, poolType],
  );

  const mustChooseTarget = useMemo(
    () => [YieldPoolType.NATIVE_STAKING, YieldPoolType.NATIVE_STAKING].includes(poolType),
    [poolType],
  );

  const balanceTokens = useMemo(() => {
    const result: Array<{ chain: string; token: string }> = [];

    const _chain = poolInfo.chain;

    result.push({
      token: poolInfo.metadata.inputAsset,
      chain: _chain,
    });

    if (poolInfo.type === YieldPoolType.LENDING || poolInfo.type === YieldPoolType.LIQUID_STAKING) {
      const altAsset = poolInfo.metadata.altInputAssets;
      const asset = chainAsset[altAsset || ''];

      if (asset) {
        result.push({
          token: asset.slug,
          chain: asset.originChain,
        });
      }
    }

    return result;
  }, [chainAsset, poolInfo]);

  const chainState = useFetchChainState(poolInfo.chain);

  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState<boolean>(true);
  const [submitString, setSubmitString] = useState<string | undefined>();
  const [connectionError, setConnectionError] = useState<string>();
  const [, setCanMint] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [checkMintLoading, setCheckMintLoading] = useState(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDisabledButton = useMemo(
    () =>
      checkMintLoading ||
      stepLoading ||
      !!connectionError ||
      !currentAmount ||
      !isBalanceReady ||
      !!errors.value ||
      submitLoading ||
      targetLoading ||
      (mustChooseTarget && !poolTarget),
    [
      connectionError,
      currentAmount,
      errors.value,
      isBalanceReady,
      submitLoading,
      mustChooseTarget,
      poolTarget,
      targetLoading,
      checkMintLoading,
      stepLoading,
    ],
  );

  const inputAsset = useMemo(
    () => chainAsset[poolInfo.metadata.inputAsset],
    [chainAsset, poolInfo.metadata.inputAsset],
  );
  const assetDecimals = inputAsset ? _getAssetDecimals(inputAsset) : 0;
  const priceValue = priceMap[inputAsset.priceId || ''] || 0;
  const convertValue = currentAmount ? parseFloat(currentAmount) / 10 ** assetDecimals : 0;
  const transformAmount = convertValue * priceValue;

  const _assetEarnings: Record<string, _YieldAssetExpectedEarning> = useMemo(() => {
    const yearlyEarnings: Record<string, _YieldAssetExpectedEarning> = {};

    if (poolInfo) {
      const decimals = _getAssetDecimals(inputAsset);
      const currentAmountNumb = currentAmount ? parseFloat(currentAmount) / 10 ** decimals : 0;

      if (poolInfo.statistic) {
        if ('assetEarning' in poolInfo.statistic) {
          poolInfo.statistic?.assetEarning.forEach(assetEarningStats => {
            const assetSlug = assetEarningStats.slug;
            const rewardAsset = chainAsset[assetSlug];

            if (assetEarningStats.apy !== undefined) {
              yearlyEarnings[assetSlug] = {
                apy: assetEarningStats.apy,
                rewardInToken: (assetEarningStats.apy / 100) * currentAmountNumb,
                symbol: rewardAsset.symbol,
              };
            } else {
              const assetApr = assetEarningStats?.apr || 0;

              yearlyEarnings[assetSlug] = {
                ...calculateReward(assetApr, currentAmountNumb, YieldCompoundingPeriod.YEARLY),
                symbol: rewardAsset.symbol,
              };
            }
          });
        } else {
          const assetSlug = inputAsset.slug;
          if (poolInfo.statistic.totalApy !== undefined) {
            yearlyEarnings[assetSlug] = {
              apy: poolInfo.statistic.totalApy,
              rewardInToken: (poolInfo.statistic.totalApy / 100) * currentAmountNumb,
              symbol: inputAsset.symbol,
            };
          } else {
            const assetApr = poolInfo.statistic.totalApr || 0;

            yearlyEarnings[assetSlug] = {
              ...calculateReward(assetApr, currentAmountNumb, YieldCompoundingPeriod.YEARLY),
              symbol: inputAsset.symbol,
            };
          }
        }
      }
    }

    return yearlyEarnings;
  }, [chainAsset, currentAmount, inputAsset, poolInfo]);

  const estimatedFee = useMemo(() => {
    let _totalFee = 0;

    if (processState.feeStructure) {
      processState.feeStructure.forEach(fee => {
        if (fee.slug !== '') {
          const asset = chainAsset[fee.slug];
          const feeDecimals = _getAssetDecimals(asset);
          const _priceValue = asset.priceId ? priceMap[asset.priceId] : 0;
          const feeNumb = _priceValue * (fee.amount ? parseFloat(fee.amount) / 10 ** feeDecimals : 0);

          _totalFee += feeNumb;
        }
      });
    }

    return _totalFee;
  }, [chainAsset, priceMap, processState.feeStructure]);

  const existentialDeposit = useMemo(() => {
    const assetInfo = Object.values(chainAsset).find(v => v.originChain === chain);
    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [chainAsset, chain]);

  const handleOpenDetailModal = useCallback((): void => {
    Keyboard.dismiss();
    isPressInfoBtnRef.current = true;
    setDetailModalVisible(true);
  }, []);

  const onError = useCallback(
    (error: Error) => {
      setTransactionDone(false);
      hideAll();
      show(error.message, { type: 'danger', duration: 8000 });
      dispatchProcessState({
        type: EarningActionType.STEP_ERROR_ROLLBACK,
        payload: error,
      });
    },
    [hideAll, show],
  );

  const onSuccess = useCallback(
    (lastStep: boolean) => {
      return (rs: SWTransactionResponse) => {
        const { errors: _errors, id, warnings } = rs;
        if (_errors.length || warnings.length) {
          if (_errors[0]?.message !== 'Rejected by user') {
            hideAll();
            show(_errors[0]?.message || warnings[0]?.message, { type: 'danger' });
            onError(_errors[0]);
          } else {
            dispatchProcessState({
              type: EarningActionType.STEP_ERROR_ROLLBACK,
              payload: _errors[0],
            });
            setTransactionDone(false);
          }
        } else if (id) {
          dispatchProcessState({
            type: EarningActionType.STEP_COMPLETE,
            payload: rs,
          });

          if (lastStep) {
            onDone(id);
            setTransactionDone(true);
          }
        }
      };
    },
    [hideAll, onDone, onError, show],
  );

  const renderMetaInfo = useCallback(() => {
    const value = currentAmount ? parseFloat(currentAmount) / 10 ** assetDecimals : 0;
    const assetSymbol = inputAsset.symbol;

    // TODO
    console.log(value);

    return (
      <MetaInfo labelColorScheme={'gray'} spaceSize={'sm'} valueColorScheme={'gray'}>
        {/*{poolInfo.statistic && 'assetEarning' in poolInfo.statistic &&*/}
        {/*  poolInfo.statistic?.assetEarning?.map(item => {*/}
        {/*    if (item.exchangeRate === undefined || !poolInfo.metadata.derivativeAssets) {*/}
        {/*      return null;*/}
        {/*    }*/}

        {/*    const derivativeAssetSlug = poolInfo.derivativeAssets[0];*/}
        {/*    const derivativeAssetInfo = chainAsset[derivativeAssetSlug];*/}

        {/*    return (*/}
        {/*      <MetaInfo.Number*/}
        {/*        decimals={0}*/}
        {/*        key={item.slug}*/}
        {/*        label={"You'll receive"}*/}
        {/*        suffix={_getAssetSymbol(derivativeAssetInfo)}*/}
        {/*        value={value / item.exchangeRate}*/}
        {/*      />*/}
        {/*    );*/}
        {/*  })}*/}

        <MetaInfo.Default label={'Yearly rewards'}>
          <Typography.Text>
            {Object.values(_assetEarnings)
              .map(_value => {
                const amount = _value.apy || 0;

                return `${formatNumber(amount, 0, balanceFormatter)}% ${_value.symbol}`;
              })
              .join(' - ')}
          </Typography.Text>
        </MetaInfo.Default>
        <MetaInfo.Default label={'Estimated earnings'}>
          <Typography.Text>
            {Object.values(_assetEarnings)
              .map(_value => {
                const amount = _value.rewardInToken || 0;

                return `${formatNumber(amount, 0, balanceFormatter)} ${_value.symbol}`;
              })
              .join(' - ')
              .concat('/year')}
          </Typography.Text>
        </MetaInfo.Default>

        {poolInfo.statistic?.minJoinPool && (
          <MetaInfo.Number
            decimals={assetDecimals}
            label={'Minimum active stake'}
            suffix={assetSymbol}
            value={poolInfo.statistic.minJoinPool}
          />
        )}

        <MetaInfo.Number decimals={0} label={i18n.inputLabel.estimatedFee} prefix={'$'} value={estimatedFee} />
      </MetaInfo>
    );
  }, [currentAmount, assetDecimals, inputAsset.symbol, _assetEarnings, poolInfo, estimatedFee]);

  const onSubmit = useCallback(() => {
    setSubmitLoading(true);
    dispatchProcessState({
      type: EarningActionType.STEP_SUBMIT,
      payload: null,
    });

    const values = getValues();
    const { from, target, value: _currentAmount } = values;

    let data: SubmitYieldJoinData;
    const isFirstStep = processState.currentStep === 0;

    const submitStep = isFirstStep ? processState.currentStep + 1 : processState.currentStep;
    const isLastStep = submitStep === processState.steps.length - 1;

    if ([YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo.type) && target) {
      if (poolInfo.type === YieldPoolType.NOMINATION_POOL) {
        const getPoolInfo = () => {
          const poolTargets = poolTargetsMap[slug] as NominationPoolInfo[];

          for (const pool of poolTargets) {
            if (String(pool.id) === target) {
              return pool;
            }
          }

          return undefined;
        };
        data = {
          slug: slug,
          address: from,
          amount: _currentAmount,
          selectedPool: getPoolInfo(),
        } as SubmitJoinNominationPool;
      } else {
        const getSelectedValidators = (nominations: string[]) => {
          const validatorList = poolTargetsMap[slug] as ValidatorInfo[];

          if (!validatorList) {
            return [];
          }

          const result: ValidatorInfo[] = [];

          validatorList.forEach(validator => {
            if (nominations.some(nomination => isSameAddress(nomination, validator.address))) {
              // remember the format of the address
              result.push(validator);
            }
          });

          return result;
        };

        data = {
          slug: slug,
          address: from,
          amount: _currentAmount,
          selectedValidators: getSelectedValidators(parseNominations(target)),
        } as SubmitJoinNativeStaking;
      }
    } else {
      data = getJoinYieldParams(poolInfo, from, _currentAmount, processState.feeStructure[submitStep]);
    }

    const path: OptimalYieldPath = {
      steps: processState.steps,
      totalFee: processState.feeStructure,
    };

    const submitPromise: Promise<SWTransactionResponse> = submitJoinYieldPool({
      path: path,
      data: data,
      currentStep: submitStep,
    });

    if (isFirstStep) {
      const validatePromise = validateYieldProcess({
        path: path,
        data: data,
      });

      setTimeout(() => {
        validatePromise
          .then(_errors => {
            if (_errors.length) {
              onError(_errors[0]);

              return undefined;
            } else {
              dispatchProcessState({
                type: EarningActionType.STEP_COMPLETE,
                payload: true,
              });
              dispatchProcessState({
                type: EarningActionType.STEP_SUBMIT,
                payload: null,
              });

              return submitPromise;
            }
          })
          .then(rs => {
            if (rs) {
              onSuccess(isLastStep)(rs);
            }
          })
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
          });
      }, 300);
    } else {
      setTimeout(() => {
        submitPromise
          .then(onSuccess(isLastStep))
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
          });
      }, 300);
    }
  }, [getValues, onError, onSuccess, poolInfo, poolTargetsMap, processState, slug]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 350);
  }, []);

  useEffect(() => {
    setAsset(inputAsset.slug || '');
  }, [inputAsset.slug, setAsset]);

  useEffect(() => {
    if (currentStep === 0) {
      const submitData: OptimalYieldPathParams = {
        address: currentFrom,
        amount: currentAmount,
        slug: slug,
      };

      const newData = JSON.stringify(submitData);

      if (newData !== submitString) {
        setSubmitString(newData);

        setStepLoading(true);

        addLazy(
          loadingStepPromiseKey,
          () => {
            getOptimalYieldPath(submitData)
              .then(res => {
                dispatchProcessState({
                  payload: {
                    steps: res.steps,
                    feeStructure: res.totalFee,
                  },
                  type: EarningActionType.STEP_CREATE,
                });

                const errorNetwork = res.connectionError;

                if (errorNetwork) {
                  const networkName = chainInfoMap[errorNetwork].name;
                  const text = 'Please enable {{networkName}} network'.replace('{{networkName}}', networkName);

                  hideAll();
                  show(text, { type: 'danger', duration: 8000 });
                }

                setConnectionError(errorNetwork);
              })
              .catch(console.error)
              .finally(() => setStepLoading(false));
          },
          1000,
          5000,
          false,
        );
      }
    }
  }, [submitString, currentAmount, currentStep, chainInfoMap, currentFrom, slug, hideAll, show]);

  useEffect(() => {
    setCheckMintLoading(true);

    unlockDotCheckCanMint({
      slug: poolInfo.slug,
      address: currentFrom,
      network: poolInfo.chain,
    })
      .then(value => {
        setCanMint(value);
      })
      .finally(() => {
        setCheckMintLoading(false);
      });

    return () => {
      setCanMint(false);
    };
  }, [currentFrom, poolInfo.chain, poolInfo.slug]);

  useEffect(() => {
    let unmount = false;

    if ((!!chain && !!currentFrom && chainState?.active) || forceFetchValidator) {
      setTargetLoading(true);
      fetchPoolTarget({ slug })
        .then(result => {
          store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
        })
        .catch(console.error)
        .finally(() => {
          if (!unmount) {
            setTargetLoading(false);
            setForceFetchValidator(false);
          }
        });
    }

    return () => {
      unmount = true;
    };
  }, [chain, chainState?.active, forceFetchValidator, currentFrom, slug]);

  useEffect(() => {
    if (!compound) {
      isPressInfoBtnRef.current = false;
      setTimeout(() => setDetailModalVisible(true), 300);
    }
  }, [compound]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout
          title={title}
          // disableMainHeader={loading}
          showRightHeaderButton
          // disableLeftButton={loading}
          // disableRightButton={!chainStakingMetadata || loading}
          onPressRightHeaderBtn={handleOpenDetailModal}>
          <>
            <>
              {!isLoading ? (
                <>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1, paddingHorizontal: 16, marginTop: 16 }}
                    keyboardShouldPersistTaps={'handled'}>
                    {processState.steps && (
                      <>
                        <View>
                          {stepLoading ? (
                            <View style={styles.loadingStepContainer}>
                              <ActivityIndicator size={theme.sizeLG} />
                            </View>
                          ) : (
                            <EarningProcessItem
                              index={processState.currentStep}
                              stepName={processState.steps[processState.currentStep]?.name}
                              stepStatus={processState.stepResults[processState.currentStep]?.status}
                            />
                          )}
                        </View>

                        <Divider style={{ marginVertical: theme.marginSM }} />
                      </>
                    )}
                    <AccountSelector
                      items={accountSelectorList}
                      selectedValueMap={{ [currentFrom]: true }}
                      accountSelectorRef={accountSelectorRef}
                      disabled={!isAllAccount}
                      onSelectItem={item => {
                        setFrom(item.address);
                        fromRef.current = item.address;
                        accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                      }}
                      renderSelected={() => (
                        <AccountSelectField accountName={accountInfo?.name || ''} value={currentFrom} showIcon />
                      )}
                    />
                    <FreeBalanceToYield
                      address={currentFrom}
                      label={`${i18n.inputLabel.availableBalance}:`}
                      onBalanceReady={setIsBalanceReady}
                      tokens={balanceTokens}
                      hidden={nextStepType !== YieldStepType.XCM}
                    />
                    <View>
                      <FreeBalance
                        address={currentFrom}
                        chain={poolInfo.chain}
                        hidden={[YieldStepType.XCM].includes(nextStepType)}
                        isSubscribe={true}
                        label={`${i18n.inputLabel.availableBalance}:`}
                        tokenSlug={inputAsset.slug}
                      />

                      <FormItem
                        style={{ marginBottom: theme.marginXS }}
                        control={control}
                        // rules={amountInputRules}
                        render={({ field: { value, ref, onChange } }) => (
                          <InputAmount
                            ref={ref}
                            value={value}
                            maxValue={'1'} // TODO
                            onChangeValue={onChange}
                            decimals={assetDecimals}
                            disable={processState.currentStep !== 0}
                            showMaxButton={false}
                          />
                        )}
                        name={'value'}
                      />

                      <Number
                        decimal={0}
                        decimalColor={theme.colorTextLight4}
                        intColor={theme.colorTextLight4}
                        prefix={'$'}
                        unitColor={theme.colorTextLight4}
                        value={transformAmount}
                        style={{ marginBottom: theme.marginSM }}
                      />

                      {poolType === YieldPoolType.NOMINATION_POOL && (
                        <EarningPoolSelector
                          from={currentFrom}
                          slug={slug}
                          chain={poolChain}
                          onSelectItem={(value: string) => {
                            setValue('target', value);
                          }}
                          poolLoading={targetLoading}
                          targetPool={poolTarget}
                          disabled={submitLoading}
                          setForceFetchValidator={setForceFetchValidator}
                        />
                      )}

                      {poolType === YieldPoolType.NATIVE_STAKING && (
                        <EarningValidatorSelector
                          from={currentFrom}
                          chain={chain}
                          slug={slug}
                          setForceFetchValidator={setForceFetchValidator}
                          validatorLoading={targetLoading}
                          selectedValidator={poolTarget}
                          onSelectItem={(value: string) => setValue('target', value)}
                          disabled={submitLoading}
                          ref={validatorSelectorRef}
                        />
                      )}
                    </View>
                    {renderMetaInfo()}

                    <View style={{ marginTop: theme.marginSM }}>
                      <AlertBox
                        type={'warning'}
                        title={STAKE_ALERT_DATA.title}
                        description={STAKE_ALERT_DATA.description.replace(
                          '{tokenAmount}',
                          `${getInputValuesFromString(existentialDeposit, assetDecimals)} ${inputAsset.symbol}`,
                        )}
                      />
                    </View>
                  </ScrollView>
                  <View style={{ paddingHorizontal: 16, paddingTop: 16, ...MarginBottomForSubmitButton }}>
                    <Button
                      disabled={isDisabledButton}
                      loading={submitLoading}
                      icon={
                        <Icon
                          phosphorIcon={PlusCircle}
                          weight={'fill'}
                          size={'lg'}
                          iconColor={isDisabledButton ? theme.colorTextLight5 : theme.colorWhite}
                        />
                      }
                      onPress={preCheckAction(onSubmit, ExtrinsicType.JOIN_YIELD_POOL)}>
                      {i18n.buttonTitles.stake}
                    </Button>
                  </View>
                </>
              ) : (
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <ActivityIndicator size={32} />
                </View>
              )}
            </>
            <EarningPoolDetailModal
              modalVisible={detailModalVisible}
              slug={slug}
              setVisible={setDetailModalVisible}
              onStakeMore={() => setDetailModalVisible(false)}
              isShowStakeMoreBtn={!isPressInfoBtnRef.current}
              onPressBack={() => {
                navigation.goBack();
              }}
            />
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};

export default EarnTransaction;
