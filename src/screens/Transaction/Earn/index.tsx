import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import {
  _getAssetDecimals,
  _getAssetSymbol,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  EarningStatus,
  NominationPoolInfo,
  OptimalYieldPathParams,
  ValidatorInfo,
  YieldPoolType,
  YieldStepType,
} from '@subwallet/extension-base/types';
import { OptimalYieldPath } from '@subwallet/extension-base/types/yield/actions/join/step';
import {
  SubmitJoinNativeStaking,
  SubmitJoinNominationPool,
  SubmitYieldJoinData,
} from '@subwallet/extension-base/types/yield/actions/join/submit';
import { addLazy } from '@subwallet/extension-base/utils/lazy';
import BigN from 'bignumber.js';
import { FormItem } from 'components/common/FormItem';
import { ActivityIndicator, Button, Divider, Icon, Number } from 'components/design-system-ui';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { getInputValuesFromString, InputAmount } from 'components/Input/InputAmount';
import EarningProcessItem from 'components/Item/Earning/EarningProcessItem';
import MetaInfo from 'components/MetaInfo';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import EarningPoolDetailModal from 'components/Modal/Earning/EarningPoolDetailModal';
import { EarningPoolSelector, PoolSelectorRef } from 'components/Modal/Earning/EarningPoolSelector';
import { EarningValidatorSelector, ValidatorSelectorRef } from 'components/Modal/Earning/EarningValidatorSelector';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import useFetchChainState from 'hooks/screen/useFetchChainState';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNativeTokenSlug from 'hooks/useGetNativeTokenSlug';
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
import { Alert, Keyboard, ScrollView, View } from 'react-native';
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
import { parseNominations } from 'utils/transaction/stake';
import { accountFilterFunc, getJoinYieldParams } from '../helper/earning';
import createStyle from './style';
import { useYieldPositionDetail } from 'hooks/earning';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { STAKE_ALERT_DATA } from 'constants/earning/EarningDataRaw';
import { insufficientMessages } from 'hooks/transaction/useHandleSubmitTransaction';
import { useGetBalance } from 'hooks/balance';
import reformatAddress from 'utils/index';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { EarningAutoClaimItem } from 'components/Item/Earning/EarningAutoClaimItem';
import { EarningManageClaimPermissions } from 'components/Modal/Earning/EarningManageClaimPermissions';

export enum PalletNominationPoolsClaimPermission {
  PERMISSIONED = 'Permissioned',
  PERMISSIONLESS_COMPOUND = 'PermissionlessCompound',
  PERMISSIONLESS_WITHDRAW = 'PermissionlessWithdraw',
}

interface StakeFormValues extends TransactionFormValues {
  slug: string;
  target: string;
}

const loadingStepPromiseKey = 'earning.step.loading';

// Not enough balance to xcm;
export const insufficientXCMMessages = ['You can only enter a maximum'];

const EarnTransaction: React.FC<EarningProps> = (props: EarningProps) => {
  const {
    route: {
      params: { slug, target, redirectFromPreview },
    },
  } = props;

  const navigation = useNavigation<RootNavigationProps>();
  const isFocused = useIsFocused();
  const theme = useSubWalletTheme().swThemes;
  const { show, hideAll } = useToast();
  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap, poolTargetsMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry: chainAsset } = useSelector((state: RootState) => state.assetRegistry);
  const { priceMap } = useSelector((state: RootState) => state.price);
  const defaultTarget = useRef<string | undefined>(target);
  const redirectFromPreviewRef = useRef(!!redirectFromPreview);
  const autoCheckCompoundRef = useRef<boolean>(true);

  const {
    title,
    form: {
      control,
      setValue,
      formState: { errors },
      getValues,
      setFocus,
    },
    onChangeFromValue: setFrom,
    onChangeAssetValue: setAsset,
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<StakeFormValues>('earn', {
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
  const poolSelectorRef = useRef<PoolSelectorRef>(null);
  const isReadyToShowAlertRef = useRef<boolean>(true);
  const fromRef = useRef<string>(currentFrom);
  const isPressInfoBtnRef = useRef<boolean>(false);
  const nativeTokenSlug = useGetNativeTokenSlug(chain);

  const [processState, dispatchProcessState] = useReducer(earningReducer, DEFAULT_YIELD_PROCESS);

  const currentStep = processState.currentStep;
  const firstStep = currentStep === 0;
  const submitStepType = processState.steps?.[!currentStep ? currentStep + 1 : currentStep]?.type;

  const accountInfo = useGetAccountByAddress(currentFrom);
  const preCheckAction = usePreCheckAction(currentFrom);
  const { compound } = useYieldPositionDetail(slug);
  const { nativeTokenBalance } = useGetBalance(chain, currentFrom);
  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo?.type || '';
  const poolChain = poolInfo?.chain || '';

  const styles = useMemo(() => createStyle(theme), [theme]);

  const accountSelectorList = useMemo(
    () => accounts.filter(accountFilterFunc(chainInfoMap, poolType, poolChain)),
    [accounts, poolChain, chainInfoMap, poolType],
  );

  const mustChooseTarget = useMemo(
    () => [YieldPoolType.NATIVE_STAKING, YieldPoolType.NOMINATION_POOL].includes(poolType),
    [poolType],
  );

  const balanceTokens = useMemo(() => {
    const result: Array<{ chain: string; token: string }> = [];

    if (!poolInfo) {
      return [];
    }
    const _chain = poolInfo?.chain;

    result.push({
      token: poolInfo?.metadata.inputAsset,
      chain: _chain,
    });

    if (poolInfo?.type === YieldPoolType.LENDING || poolInfo?.type === YieldPoolType.LIQUID_STAKING) {
      const altAsset = poolInfo?.metadata?.altInputAssets;
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

  const chainState = useFetchChainState(poolInfo?.chain || '');

  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const [targetLoading, setTargetLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState<boolean>(true);
  const [submitString, setSubmitString] = useState<string | undefined>();
  const [connectionError, setConnectionError] = useState<string>();
  const [, setCanMint] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [checkMintLoading, setCheckMintLoading] = useState(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowAlert, setIsShowAlert] = useState<boolean>(false);
  const [useParamValidator, setUseParamValidator] = useState<boolean>(redirectFromPreviewRef.current);
  const [checkValidAccountLoading, setCheckValidAccountLoading] = useState<boolean>(redirectFromPreviewRef.current);
  const [manageAutoClaimModalVisible, setManageAutoClaimModalVisible] = useState<boolean>(false);
  const [stateAutoClaimManage, setAutoStateClaimManage] = useState<PalletNominationPoolsClaimPermission>(
    PalletNominationPoolsClaimPermission.PERMISSIONED,
  );

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
      checkMintLoading,
      stepLoading,
      connectionError,
      currentAmount,
      isBalanceReady,
      errors.value,
      submitLoading,
      targetLoading,
      mustChooseTarget,
      poolTarget,
    ],
  );

  const inputAsset = useMemo(
    () => chainAsset[poolInfo?.metadata?.inputAsset],
    [chainAsset, poolInfo?.metadata?.inputAsset],
  );

  const nativeAsset = useMemo(() => chainAsset[nativeTokenSlug], [chainAsset, nativeTokenSlug]);

  const assetDecimals = inputAsset ? _getAssetDecimals(inputAsset) : 0;
  const priceValue = priceMap[inputAsset.priceId || ''] || 0;
  const convertValue = currentAmount ? parseFloat(currentAmount) / 10 ** assetDecimals : 0;
  const transformAmount = convertValue * priceValue;

  const estimatedFee = useMemo(() => {
    let _totalFee = 0;

    if (processState.feeStructure) {
      processState.feeStructure.forEach(fee => {
        if (fee.slug !== '') {
          const asset = chainAsset[fee.slug];
          const feeDecimals = _getAssetDecimals(asset);
          const _priceValue = asset.priceId ? priceMap[asset.priceId] ?? 0 : 0;
          const feeNumb = _priceValue * (fee.amount ? parseFloat(fee.amount) / 10 ** feeDecimals : 0);

          _totalFee += feeNumb;
        }
      });
    }

    return _totalFee;
  }, [chainAsset, priceMap, processState.feeStructure]);

  const maintainString = useMemo(() => {
    if (!poolInfo) {
      return '';
    }
    const maintainAsset = chainAsset[poolInfo?.metadata?.maintainAsset];
    const maintainBalance = poolInfo?.metadata?.maintainBalance;

    return `${getInputValuesFromString(maintainBalance, maintainAsset.decimals || 0)} ${maintainAsset.symbol}`;
  }, [chainAsset, poolInfo]);

  const getTargetedPool = useMemo(() => {
    const _poolTargets = poolTargetsMap[slug];
    if (!_poolTargets) {
      return [];
    } else {
      if (YieldPoolType.NOMINATION_POOL === poolType) {
        const poolTargets = _poolTargets as NominationPoolInfo[];

        for (const pool of poolTargets) {
          if (String(pool.id) === poolTarget) {
            return [pool];
          }
        }

        return [];
      } else if (YieldPoolType.NATIVE_STAKING === poolType) {
        const validatorList = _poolTargets as ValidatorInfo[];

        if (!validatorList) {
          return [];
        }

        const result: ValidatorInfo[] = [];
        const nominations = parseNominations(poolTarget);
        const newValidatorList: { [address: string]: ValidatorInfo } = {};
        validatorList.forEach(validator => {
          newValidatorList[reformatAddress(validator.address, 0)] = validator;
        });
        nominations.forEach(nomination => {
          if (newValidatorList?.[reformatAddress(nomination, 0)]) {
            // remember the format of the address
            result.push(newValidatorList[reformatAddress(nomination, 0)]);
          }
        });

        return result;
      } else {
        return [];
      }
    }
  }, [poolTarget, poolTargetsMap, poolType, slug]);

  const handleOpenDetailModal = useCallback((): void => {
    Keyboard.dismiss();
    isPressInfoBtnRef.current = true;
    setDetailModalVisible(true);
  }, []);

  const handleDataForInsufficientAlert = useCallback(() => {
    const _assetDecimals = nativeAsset.decimals || 0;
    const existentialDeposit = nativeAsset.minAmount || '0';
    return {
      existentialDeposit: getInputValuesFromString(existentialDeposit, _assetDecimals),
      availableBalance: getInputValuesFromString(nativeTokenBalance.value, _assetDecimals),
      maintainBalance: getInputValuesFromString(poolInfo?.metadata?.maintainBalance || '0', _assetDecimals),
      symbol: nativeAsset.symbol,
    };
  }, [nativeAsset, nativeTokenBalance.value, poolInfo?.metadata?.maintainBalance]);

  const onError = useCallback(
    (error: Error) => {
      if (insufficientMessages.some(v => error.message.includes(v))) {
        const _data = handleDataForInsufficientAlert();
        const isAvailableBalanceEqualZero = new BigN(_data.availableBalance).isZero();
        const isAmountGtAvailableBalance = new BigN(convertValue).gt(_data.availableBalance);
        let alertMessage = '';
        if (isAmountGtAvailableBalance && !isAvailableBalanceEqualZero) {
          alertMessage = i18n.warningMessage.insufficientBalanceMessageV2;
        } else {
          alertMessage = i18n.formatString(
            i18n.warningMessage.insufficientBalanceMessage,
            _data.availableBalance,
            _data.symbol,
            _data.existentialDeposit,
            _data.maintainBalance || '0',
          ) as string;
        }

        Alert.alert(i18n.warningTitle.insufficientBalance, alertMessage, [
          {
            text: 'I understand',
          },
        ]);
        dispatchProcessState({
          type: EarningActionType.STEP_ERROR_ROLLBACK,
          payload: error,
        });

        return;
      } else if (insufficientXCMMessages.some(v => error.message.includes(v))) {
        Alert.alert(i18n.warningTitle.insufficientBalance, error.message, [
          {
            text: 'I understand',
          },
        ]);
        dispatchProcessState({
          type: EarningActionType.STEP_ERROR_ROLLBACK,
          payload: error,
        });

        return;
      }

      setTransactionDone(false);
      hideAll();
      show(error.message, { type: 'danger', duration: 8000 });
      dispatchProcessState({
        type: EarningActionType.STEP_ERROR_ROLLBACK,
        payload: error,
      });
    },
    [convertValue, handleDataForInsufficientAlert, hideAll, show],
  );

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, warnings } = rs;
        if (_errors.length || warnings.length) {
          if (_errors[0]?.message !== 'Rejected by user') {
            if (
              _errors[0]?.message.startsWith('UnknownError Connection to Indexed DataBase server lost') ||
              _errors[0]?.message.startsWith('Provided address is invalid, the capitalization checksum test failed') ||
              _errors[0]?.message.startsWith('connection not open on send()')
            ) {
              hideAll();
              show(
                'Your selected network has lost connection. Update it by re-enabling it or changing network provider',
                { type: 'danger', duration: 8000 },
              );

              return false;
            }

            hideAll();
            onError(_errors[0]);
            return false;
          } else {
            dispatchProcessState({
              type: needRollback ? EarningActionType.STEP_ERROR_ROLLBACK : EarningActionType.STEP_ERROR,
              payload: _errors[0],
            });
            setTransactionDone(false);
            return false;
          }
        } else if (id) {
          dispatchProcessState({
            type: EarningActionType.STEP_COMPLETE,
            payload: rs,
          });

          if (lastStep) {
            onDone(id);
            setTransactionDone(true);
            return false;
          }
          return true;
        } else {
          return false;
        }
      };
    },
    [hideAll, onDone, onError, show],
  );

  const onChangeTarget = useCallback(
    (value: string) => {
      setValue('target', value);
    },
    [setValue],
  );

  const renderMetaInfo = useCallback(() => {
    if (!poolInfo) {
      Alert.alert('Unable to get earning data', 'Please, go back and try again later');
    }
    const value = currentAmount ? parseFloat(currentAmount) / 10 ** assetDecimals : 0;
    const assetSymbol = inputAsset.symbol;

    const assetEarnings =
      poolInfo?.statistic && 'assetEarning' in poolInfo?.statistic ? poolInfo?.statistic.assetEarning : [];
    const derivativeAssets = 'derivativeAssets' in poolInfo?.metadata ? poolInfo?.metadata.derivativeAssets : [];
    const showFee = [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(poolInfo?.type);

    let minJoinPool: string | undefined;

    if (poolInfo?.statistic) {
      const minPoolJoin = poolInfo?.statistic.earningThreshold.join;
      const targeted = getTargetedPool?.[0];

      if (targeted) {
        if ('minBond' in targeted) {
          const minTargetJoin = new BigN(targeted.minBond || '0');

          minJoinPool = minTargetJoin.gt(minPoolJoin || '0') ? minTargetJoin.toString() : minPoolJoin;
        } else {
          minJoinPool = minPoolJoin;
        }
      } else {
        minJoinPool = minPoolJoin;
      }
    }

    return (
      <MetaInfo labelColorScheme={'gray'} spaceSize={'sm'} valueColorScheme={'gray'}>
        {!!assetEarnings.length &&
          assetEarnings.map(item => {
            if (item.exchangeRate === undefined || !derivativeAssets.length) {
              return null;
            }

            const derivativeAssetSlug = derivativeAssets[0];
            const derivativeAssetInfo = chainAsset[derivativeAssetSlug];

            return (
              <MetaInfo.Number
                decimals={0}
                key={item.slug}
                label={"You'll receive"}
                suffix={_getAssetSymbol(derivativeAssetInfo)}
                value={value / item.exchangeRate}
              />
            );
          })}
        {minJoinPool && (
          <MetaInfo.Number
            decimals={assetDecimals}
            label={'Minimum active stake'}
            suffix={assetSymbol}
            value={minJoinPool}
          />
        )}

        <MetaInfo.Chain chain={chainInfoMap[chain].slug} label={i18n.inputLabel.network} />

        {showFee && (
          <MetaInfo.Number decimals={0} label={i18n.inputLabel.estimatedFee} prefix={'$'} value={estimatedFee} />
        )}
      </MetaInfo>
    );
  }, [
    poolInfo,
    currentAmount,
    assetDecimals,
    inputAsset.symbol,
    chainInfoMap,
    chain,
    estimatedFee,
    getTargetedPool,
    chainAsset,
  ]);

  const onSubmit = useCallback(() => {
    if (!poolInfo) {
      Alert.alert('Unable to get earning data', 'Please, go back and try again later');
    }
    setSubmitLoading(true);
    const values = getValues();
    const { from, value: _currentAmount } = values;

    const getData = (submitStep: number): SubmitYieldJoinData => {
      if ([YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo?.type) && poolTarget) {
        const targets = getTargetedPool;
        if (poolInfo?.type === YieldPoolType.NOMINATION_POOL) {
          const selectedPool = targets[0];
          return {
            slug: slug,
            address: from,
            amount: _currentAmount,
            selectedPool,
          } as SubmitJoinNominationPool;
        } else {
          return {
            slug: slug,
            address: from,
            amount: _currentAmount,
            selectedValidators: targets,
          } as SubmitJoinNativeStaking;
        }
      } else {
        return getJoinYieldParams(poolInfo, from, _currentAmount, processState.feeStructure[submitStep]);
      }
    };

    const path: OptimalYieldPath = {
      steps: processState.steps,
      totalFee: processState.feeStructure,
    };

    const submitData = async (step: number): Promise<boolean> => {
      dispatchProcessState({
        type: EarningActionType.STEP_SUBMIT,
        payload: null,
      });
      const isFirstStep = step === 0;
      const isLastStep = step === processState.steps.length - 1;
      const needRollback = step === 1;
      const data = getData(step);

      try {
        if (isFirstStep) {
          const validatePromise = validateYieldProcess({
            path: path,
            data: data,
          });

          const _errors = await validatePromise;

          if (_errors.length) {
            onError(_errors[0]);

            return false;
          } else {
            dispatchProcessState({
              type: EarningActionType.STEP_COMPLETE,
              payload: true,
            });
            dispatchProcessState({
              type: EarningActionType.STEP_SUBMIT,
              payload: null,
            });

            return await submitData(step + 1);
          }
        } else {
          const submitPromise: Promise<SWTransactionResponse> = submitJoinYieldPool({
            path: path,
            data: data,
            currentStep: step,
          });

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

    const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer ?? 1;
    const userSelectedPoolCount = poolTarget.split(',').length ?? 1;
    const label = getValidatorLabel(chain);
    if (userSelectedPoolCount < maxCount && label === 'Validator') {
      return Alert.alert(
        'Pay attention!',
        `You are recommended to choose ${maxCount} validators to optimize your earnings. Do you wish to continue with ${userSelectedPoolCount} validator${
          userSelectedPoolCount === 1 ? '' : 's'
        }?`,
        [
          {
            text: 'Go back',
            onPress: () => {
              setSubmitLoading(false);
            },
            style: 'default',
          },
          {
            text: 'Continue',
            style: 'default',
            isPreferred: false,
            onPress: () => {
              submitData(currentStep)
                .catch(onError)
                .finally(() => {
                  setSubmitLoading(false);
                });
            },
          },
        ],
      );
    }
    submitData(currentStep)
      .catch(onError)
      .finally(() => {
        setSubmitLoading(false);
      });
  }, [
    chain,
    currentStep,
    getTargetedPool,
    getValues,
    onError,
    onSuccess,
    poolInfo,
    poolTarget,
    processState.feeStructure,
    processState.steps,
    slug,
  ]);

  const onBack = useCallback(() => {
    if (firstStep) {
      if (!slug || redirectFromPreviewRef.current) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home', params: { screen: 'Main', params: { screen: 'Earning' } } }],
        });
      } else {
        navigation.goBack();
      }
    } else {
      Alert.alert(
        'Cancel earning process?',
        'Going back will cancel the current earning process. Do you wish to cancel?',
        [
          {
            text: 'Cancel earning',
            onPress: () => {
              if (redirectFromPreviewRef.current) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home', params: { screen: 'Main', params: { screen: 'Earning' } } }],
                });
                return;
              }

              navigation.goBack();
            },
          },
          {
            text: 'Not now',
          },
        ],
      );
    }
  }, [slug, firstStep, navigation]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    let timeout: NodeJS.Timeout;

    if (isLoading && redirectFromPreviewRef.current) {
      const checkCompoundReady = () => {
        if (compound) {
          clearInterval(timer);
          clearTimeout(timeout);
          setIsLoading(false);
        }
      };

      timer = setInterval(checkCompoundReady, 500);

      timeout = setTimeout(() => {
        clearInterval(timer);
        setIsLoading(false);
      }, 5000);
    } else {
      setTimeout(() => setIsLoading(false), 350);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [compound, isLoading]);

  useEffect(() => {
    setAsset(inputAsset.slug || '');
  }, [inputAsset.slug, setAsset]);

  useEffect(() => {
    if (!currentFrom && (isAllAccount || accountSelectorList.length === 1)) {
      if ((redirectFromPreviewRef.current && accountSelectorList.length >= 1) || accountSelectorList.length === 1) {
        setFrom(accountSelectorList[0].address);
      }
    }
  }, [accountSelectorList, currentFrom, isAllAccount, setFrom]);

  useEffect(() => {
    if (currentStep === 0) {
      const submitData: OptimalYieldPathParams = {
        address: currentFrom,
        amount: currentAmount,
        slug: slug,
        targets: poolTarget ? getTargetedPool : undefined,
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
              .catch((e: Error) => console.log('eeee', e.message))
              .finally(() => setStepLoading(false));
          },
          1000,
          5000,
          false,
        );
      }
    }
  }, [
    submitString,
    currentAmount,
    currentStep,
    chainInfoMap,
    currentFrom,
    slug,
    hideAll,
    show,
    poolTarget,
    getTargetedPool,
  ]);

  useEffect(() => {
    setCheckMintLoading(true);

    unlockDotCheckCanMint({
      slug: poolInfo?.slug || '',
      address: currentFrom,
      network: poolInfo?.chain || '',
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
  }, [currentFrom, poolInfo?.chain, poolInfo?.slug]);

  useEffect(() => {
    let unmount = false;

    if ((!!chain && !!currentFrom && chainState?.active) || forceFetchValidator) {
      setTargetLoading(true);
      fetchPoolTarget({ slug })
        .then(result => {
          if (!unmount) {
            store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
          }
        })
        .catch((e: Error) => console.log('eeee', e.message))
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
    if (redirectFromPreviewRef.current && !accountSelectorList.length && checkValidAccountLoading) {
      const isChainEvm = chainInfoMap[poolChain] && _isChainEvmCompatible(chainInfoMap[poolChain]);
      const accountType = isChainEvm ? EVM_ACCOUNT_TYPE : SUBSTRATE_ACCOUNT_TYPE;
      const chainName = chainInfoMap[poolChain]?.name;
      navigation.navigate('Home', {
        screen: 'Main',
        params: {
          screen: 'Earning',
          params: { screen: 'EarningList', params: { step: 1, noAccountValid: true, accountType, chain: chainName } },
        },
      });
    } else {
      setCheckValidAccountLoading(false);
    }
  }, [accountSelectorList.length, chainInfoMap, checkValidAccountLoading, navigation, poolChain]);

  useEffect(() => {
    if (!compound || redirectFromPreviewRef.current) {
      isPressInfoBtnRef.current = false;
      setTimeout(() => setDetailModalVisible(true), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!compound]);

  const isUnstakeAll = useMemo(() => {
    if (compound) {
      if (compound.nominations && compound.nominations.length) {
        return compound.nominations.some(item => item.activeStake === '0' && item.status === EarningStatus.NOT_EARNING);
      } else {
        return true;
      }
    }

    return false;
  }, [compound]);

  useEffect(() => {
    if (redirectFromPreviewRef.current && !targetLoading && isShowAlert && !isLoading && isFocused) {
      if (!isAllAccount && !!compound && autoCheckCompoundRef.current) {
        autoCheckCompoundRef.current = false;

        if (isUnstakeAll) {
          if (poolType === YieldPoolType.NOMINATION_POOL) {
            isReadyToShowAlertRef.current &&
              Alert.alert(
                'Pay attention',
                "This account is unstaking all stake and can't nominate validators. You can change your account on the Account tab or try again after withdrawing unstaked funds",
                [
                  {
                    text: 'I understand',
                    onPress: () => {
                      isReadyToShowAlertRef.current = true;
                    },
                  },
                ],
              );

            isReadyToShowAlertRef.current = false;

            return;
          } else if (poolType === YieldPoolType.NATIVE_STAKING) {
            if (_STAKING_CHAIN_GROUP.para.includes(chain)) {
              isReadyToShowAlertRef.current &&
                Alert.alert(
                  'Pay attention',
                  "This account is unstaking all stake and can't nominate validators. You can change your account on the Account tab or try again after withdrawing unstaked funds",
                  [
                    {
                      text: 'I understand',
                      onPress: () => {
                        isReadyToShowAlertRef.current = true;
                      },
                    },
                  ],
                );
              isReadyToShowAlertRef.current = false;
            }

            return;
          }
        }

        const content =
          poolType === YieldPoolType.NATIVE_STAKING
            ? `This account is currently nominating ${compound.nominations.length} validators. You can change validators or change your account on the Account tab`
            : poolType === YieldPoolType.NOMINATION_POOL
            ? 'This account is currently a member of a nomination pool. You can continue using nomination pool, explore other Earning options or change your account on the Account tab'
            : '';

        const onPressCancel = () => {
          if (poolType === YieldPoolType.NOMINATION_POOL) {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Home',
                  params: {
                    screen: 'Main',
                    params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: 2 } } },
                  },
                },
              ],
            });
          }

          setUseParamValidator(false);
        };

        const onPressContinue = () => {
          isReadyToShowAlertRef.current = true;
          if (poolType === YieldPoolType.NATIVE_STAKING) {
            onChangeTarget(defaultTarget.current || '');
          }
        };

        isReadyToShowAlertRef.current &&
          Alert.alert('Pay attention', content, [
            {
              text:
                poolType === YieldPoolType.NATIVE_STAKING
                  ? 'Change validators'
                  : poolType === YieldPoolType.NOMINATION_POOL
                  ? 'Use nomination pool'
                  : '',
              onPress: onPressContinue,
            },
            {
              text:
                poolType === YieldPoolType.NATIVE_STAKING
                  ? 'Keep current validators'
                  : poolType === YieldPoolType.NOMINATION_POOL
                  ? 'Explore Earning options'
                  : '',
              onPress: onPressCancel,
            },
          ]);
        isReadyToShowAlertRef.current = false;
      }
    }
  }, [
    isLoading,
    targetLoading,
    compound,
    isUnstakeAll,
    poolType,
    chain,
    navigation,
    onChangeTarget,
    isShowAlert,
    isAllAccount,
    isFocused,
  ]);

  const validatorDefaultValue = (() => {
    if (useParamValidator) {
      return defaultTarget.current;
    } else {
      if (target === 'not-support' || !!compound) {
        return undefined;
      } else {
        return defaultTarget.current;
      }
    }
  })();

  const handleSetModeAutoCompound = useCallback((mode: PalletNominationPoolsClaimPermission) => {
    return new Promise(resolve => {
      setAutoStateClaimManage(mode);
      resolve(mode);
    });
  }, []);

  const openManageAutoClaimModal = useCallback(() => {
    setManageAutoClaimModalVisible(true);
  }, []);

  const handleToggleAutoCompoundSwitch = useCallback((checked: boolean) => {
    setAutoStateClaimManage(
      checked
        ? PalletNominationPoolsClaimPermission.PERMISSIONLESS_COMPOUND
        : PalletNominationPoolsClaimPermission.PERMISSIONED,
    );
  }, []);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout
          title={title}
          disableMainHeader={submitLoading}
          showRightHeaderButton
          disableLeftButton={submitLoading}
          disableRightButton={!poolInfo?.statistic || submitLoading}
          onPressBack={onBack}
          onPressRightHeaderBtn={handleOpenDetailModal}>
          <>
            {(isLoading || checkValidAccountLoading) && (
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <ActivityIndicator size={32} />
              </View>
            )}

            {!isLoading && !checkValidAccountLoading && (
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
                    disabled={submitLoading || !isAllAccount}
                    onSelectItem={item => {
                      setUseParamValidator(false);
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
                    hidden={submitStepType !== YieldStepType.XCM}
                  />
                  <View>
                    <FreeBalance
                      address={currentFrom}
                      chain={poolInfo?.chain || ''}
                      hidden={[YieldStepType.XCM].includes(submitStepType)}
                      isSubscribe={true}
                      label={`${i18n.inputLabel.availableBalance}:`}
                      tokenSlug={inputAsset.slug}
                      showNetwork
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
                      <>
                        <EarningPoolSelector
                          ref={poolSelectorRef}
                          from={currentFrom}
                          slug={slug}
                          chain={poolChain}
                          onSelectItem={onChangeTarget}
                          poolLoading={targetLoading}
                          targetPool={poolTarget}
                          disabled={submitLoading}
                          setForceFetchValidator={setForceFetchValidator}
                          defaultValidatorAddress={compound ? '' : defaultTarget.current}
                        />

                        <EarningAutoClaimItem
                          value={stateAutoClaimManage}
                          onValueChange={handleToggleAutoCompoundSwitch}
                          openManageAutoClaimModal={openManageAutoClaimModal}
                        />
                      </>
                    )}

                    {poolType === YieldPoolType.NATIVE_STAKING && (
                      <EarningValidatorSelector
                        from={currentFrom}
                        chain={chain}
                        slug={slug}
                        setForceFetchValidator={setForceFetchValidator}
                        validatorLoading={targetLoading}
                        selectedValidator={poolTarget}
                        onSelectItem={onChangeTarget}
                        disabled={submitLoading}
                        ref={validatorSelectorRef}
                        defaultValidatorAddress={validatorDefaultValue}
                      />
                    )}
                  </View>
                  {renderMetaInfo()}

                  <View style={{ marginTop: theme.marginSM }}>
                    <AlertBox
                      type={'warning'}
                      title={STAKE_ALERT_DATA.title}
                      description={STAKE_ALERT_DATA.description.replace('{tokenAmount}', maintainString)}
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

                <EarningPoolDetailModal
                  modalVisible={detailModalVisible}
                  slug={slug}
                  setVisible={setDetailModalVisible}
                  onStakeMore={() => {
                    setDetailModalVisible(false);
                    setIsShowAlert(true);
                    setFocus('value');
                  }}
                  isShowStakeMoreBtn={!isPressInfoBtnRef.current}
                  onPressBack={() => {
                    if (!slug || redirectFromPreviewRef.current) {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home', params: { screen: 'Main', params: { screen: 'Earning' } } }],
                      });
                    } else {
                      navigation.goBack();
                    }
                  }}
                />

                <EarningManageClaimPermissions
                  modalVisible={manageAutoClaimModalVisible}
                  setModalVisible={setManageAutoClaimModalVisible}
                  currentMode={stateAutoClaimManage}
                  onSubmit={handleSetModeAutoCompound}
                />
              </>
            )}
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};

export default EarnTransaction;
