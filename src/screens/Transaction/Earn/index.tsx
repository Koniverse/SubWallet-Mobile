import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  EarningStatus,
  NominationPoolInfo,
  OptimalYieldPathParams,
  ProcessType,
  SlippageType,
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
import {
  ActivityIndicator,
  Button,
  Divider,
  Icon,
  Logo,
  Number,
  PageIcon,
  Typography,
} from 'components/design-system-ui';
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
import useGetNativeTokenSlug from 'hooks/useGetNativeTokenSlug';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import {
  fetchPoolTarget,
  getOptimalYieldPath,
  submitJoinYieldPool,
  submitProcess,
  unlockDotCheckCanMint,
  validateYieldProcess,
} from 'messaging/index';
import { Info, PencilSimpleLine, PlusCircle, Warning } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
  Alert,
  findNodeHandle,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
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
import { getJoinYieldParams } from '../helper/earning';
import createStyle from './style';
import { useYieldPositionDetail } from 'hooks/earning';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { STAKE_ALERT_DATA } from 'constants/earning/EarningDataRaw';
import { useGetBalance } from 'hooks/balance';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { _ChainAsset } from '@subwallet/chain-list/types';
import {
  _handleDisplayForEarningError,
  _handleDisplayInsufficientEarningError,
} from '@subwallet/extension-base/core/logic-validation/earning';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';
import { GlobalModalContext } from 'providers/GlobalModalContext';
import { AppModalContext } from 'providers/AppModalContext';
import { AccountAddressItemType } from 'types/account';
import useGetYieldPositionForSpecificAccount from 'hooks/earning/useGetYieldPositionForSpecificAccount';
import { VoidFunction } from 'types/index';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { getId } from '@subwallet/extension-base/utils/getId';
import useOneSignProcess from 'hooks/account/useOneSignProcess';
import useReformatAddress from 'hooks/common/useReformatAddress';
import { ImageLogosMap } from 'assets/logo';
import Tooltip from 'react-native-walkthrough-tooltip';
import { SlippageModal } from 'components/Modal/Swap/SlippageModal';
import { useTaoStakingFee } from 'hooks/earning/useTaoStakingFee';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

interface StakeFormValues extends TransactionFormValues {
  slug: string;
  target: string;
}

const loadingStepPromiseKey = 'earning.step.loading';

// Not enough balance to xcm;
export const insufficientXCMMessages = ['You can only enter a maximum'];

const DO_NOT_SHOW_VALIDATOR_ALERT_CASES = [
  'TAO___native_staking___bittensor',
  'TAO___native_staking___bittensor_devnet',
];

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
  const { accountProxies, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap, poolTargetsMap } = useSelector((state: RootState) => state.earning);
  const { assetRegistry: chainAsset } = useSelector((state: RootState) => state.assetRegistry);
  const { priceMap, currencyData } = useSelector((state: RootState) => state.price);
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
    defaultValues,
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
  const isShowNoPoolInfoPopupRef = useRef<boolean>(false);
  const oneSign = useOneSignProcess(currentFrom);
  const nativeTokenSlug = useGetNativeTokenSlug(chain);
  const getReformatAddress = useReformatAddress();

  const [processState, dispatchProcessState] = useReducer(earningReducer, DEFAULT_YIELD_PROCESS);

  const currentStep = processState.currentStep;
  const firstStep = currentStep === 0;
  const submitStepType = processState.steps?.[!currentStep ? currentStep + 1 : currentStep]?.type;
  const preCheckAction = usePreCheckAction(currentFrom);
  const { compound } = useYieldPositionDetail(slug);
  const specificList = useGetYieldPositionForSpecificAccount(currentFrom);
  const { nativeTokenBalance } = useGetBalance(chain, currentFrom);
  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo?.type || '';
  const poolChain = poolInfo?.chain || '';

  const styles = useMemo(() => createStyle(theme), [theme]);

  const accountAddressItems = useMemo(() => {
    const chainInfo = poolChain ? chainInfoMap[poolChain] : undefined;

    if (!chainInfo) {
      return [];
    }

    const result: AccountAddressItemType[] = [];

    accountProxies.forEach(ap => {
      if (!(!defaultValues.fromAccountProxy || ap.id === defaultValues.fromAccountProxy)) {
        return;
      }

      ap.accounts.forEach(a => {
        const address = getReformatAddress(a, chainInfo);

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
  }, [accountProxies, chainInfoMap, defaultValues.fromAccountProxy, getReformatAddress, poolChain]);

  const accountInfo = useMemo(() => {
    if (!currentFrom) {
      return undefined;
    }

    return accountAddressItems.find(i => i.address === currentFrom);
  }, [accountAddressItems, currentFrom]);

  const mustChooseTarget = useMemo(
    () =>
      [YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING, YieldPoolType.NOMINATION_POOL].includes(poolType),
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
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
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
  const globalAppModalContext = useContext(GlobalModalContext);
  const { confirmModal } = useContext(AppModalContext);

  const inputAsset = useMemo(
    () => chainAsset[poolInfo?.metadata?.inputAsset],
    [chainAsset, poolInfo?.metadata?.inputAsset],
  );

  const nativeAsset: _ChainAsset | undefined = useMemo(
    () => chainAsset[nativeTokenSlug],
    [chainAsset, nativeTokenSlug],
  );

  const assetDecimals = inputAsset ? _getAssetDecimals(inputAsset) : 0;
  const priceValue = inputAsset && inputAsset.priceId ? priceMap[inputAsset.priceId] : 0;
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

  const poolTargets = useMemo(() => {
    const _poolTargets = poolTargetsMap[slug];
    if (!_poolTargets) {
      return [];
    } else {
      if (YieldPoolType.NOMINATION_POOL === poolType) {
        const __poolTargets = _poolTargets as NominationPoolInfo[];

        for (const pool of __poolTargets) {
          if (String(pool.id) === poolTarget) {
            return [pool];
          }
        }

        return [];
      } else if (YieldPoolType.NATIVE_STAKING === poolType || YieldPoolType.SUBNET_STAKING === poolType) {
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

  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('stake');

  const currentConfirmations = useMemo(() => {
    if (slug) {
      return getCurrentConfirmation([slug]);
    } else {
      return undefined;
    }
  }, [slug, getCurrentConfirmation]);

  const chainStakingBoth = useMemo(() => {
    const hasNativeStaking = (_chain: string) =>
      specificList.some(item => item.chain === _chain && item.type === YieldPoolType.NATIVE_STAKING);
    const hasNominationPool = (_chain: string) =>
      specificList.some(item => item.chain === _chain && item.type === YieldPoolType.NOMINATION_POOL);

    const chains = ['polkadot', 'kusama'];
    let chainStakingInBoth;

    for (const _chain of chains) {
      if (
        hasNativeStaking(_chain) &&
        hasNominationPool(_chain) &&
        [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolType) &&
        _chain === chain
      ) {
        chainStakingInBoth = _chain;
        break;
      } else if (
        ((hasNativeStaking(_chain) && poolType === YieldPoolType.NOMINATION_POOL) ||
          (hasNominationPool(_chain) && poolType === YieldPoolType.NATIVE_STAKING)) &&
        _chain === chain
      ) {
        chainStakingInBoth = _chain;
        break;
      }
    }

    return chainStakingInBoth;
  }, [specificList, poolType, chain]);

  const onHandleOneSignConfirmation = useCallback(
    (transactionProcessId: string) => {
      navigation.navigate('TransactionSubmission', {
        transactionProcessId: transactionProcessId,
        processType: ProcessType.EARNING,
      });
    },
    [navigation],
  );

  const handleOpenDetailModal = useCallback((): void => {
    Keyboard.dismiss();
    isPressInfoBtnRef.current = true;
    delayActionAfterDismissKeyboard(() => setDetailModalVisible(true));
  }, []);

  const handleDataForInsufficientAlert = useCallback(() => {
    const _assetDecimals = nativeAsset?.decimals || 0;

    return {
      minJoinPool: getInputValuesFromString(poolInfo?.statistic?.earningThreshold.join || '0', _assetDecimals),
      symbol: nativeAsset?.symbol || '',
      chain: chainInfoMap[poolChain].name,
      isXCM: poolInfo?.type === YieldPoolType.LENDING || poolInfo?.type === YieldPoolType.LIQUID_STAKING,
    };
  }, [
    chainInfoMap,
    nativeAsset?.decimals,
    nativeAsset?.symbol,
    poolChain,
    poolInfo?.statistic?.earningThreshold.join,
    poolInfo?.type,
  ]);

  const onError = useCallback(
    (error: Error) => {
      console.log('error', error);
      const { chain: _chain, isXCM, minJoinPool, symbol } = handleDataForInsufficientAlert();
      const balanceDisplayInfo = _handleDisplayInsufficientEarningError(
        error,
        isXCM,
        nativeTokenBalance.value || '0',
        currentAmount || '0',
        minJoinPool,
      );

      if (balanceDisplayInfo) {
        // @ts-ignore
        let message = balanceDisplayInfo.message.replaceAll('{{minJoinPool}}', minJoinPool);
        message = message.replaceAll('{{symbol}}', symbol);
        message = message.replaceAll('{{chain}}', _chain);
        Alert.alert(balanceDisplayInfo.title, message, [
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
    [currentAmount, handleDataForInsufficientAlert, hideAll, nativeTokenBalance.value, show],
  );

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, processId, warnings } = rs;
        if (_errors.length || warnings.length) {
          const error = _errors[0]; // we only handle the first error for now

          if (_errors[0]?.message !== 'Rejected by user') {
            const displayInfo = _handleDisplayForEarningError(error);

            if (displayInfo) {
              hideAll();
              show(displayInfo.message, { type: 'danger', duration: 8000 });

              return false;
            }

            hideAll();
            onError(error);

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
            processId ? onHandleOneSignConfirmation(processId) : onDone(id);
            !processId && setTransactionDone(true);
            return false;
          }
          return true;
        } else {
          return false;
        }
      };
    },
    [hideAll, onDone, onError, onHandleOneSignConfirmation, show],
  );

  const { earningRate, earningSlippage, stakingFee } = useTaoStakingFee(
    poolInfo,
    currentAmount,
    assetDecimals,
    poolInfo.metadata.subnetData?.netuid || 0,
    ExtrinsicType.STAKING_BOND,
    setSubmitLoading,
  );

  const onChangeTarget = useCallback(
    (value: string) => {
      setValue('target', value);
    },
    [setValue],
  );

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);

  // For subnet staking
  const scrollViewRef = useRef<ScrollView>(null);
  const alertBoxRef = useRef<View>(null);
  const [slippageModalVisible, setSlippageModalVisible] = useState<boolean>(false);
  const [maxSlippage, setMaxSlippage] = useState<SlippageType>({ slippage: new BigN(0.005), isCustomType: true });
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

  const networkKey = useMemo(() => {
    const _netuid = poolInfo.metadata.subnetData?.netuid || 0;

    // @ts-ignore
    return ImageLogosMap[`subnet-${_netuid}`] ? `subnet-${_netuid}` : 'subnet-0';
  }, [poolInfo.metadata.subnetData?.netuid]);

  const isDisabledSubnetContent = useMemo(
    () => !isSubnetStaking || !currentAmount || (mustChooseTarget && !poolTarget),

    [isSubnetStaking, currentAmount, mustChooseTarget, poolTarget],
  );

  const isSlippageAcceptable = useMemo(() => {
    if (earningSlippage === null || !currentAmount) {
      return true;
    }

    return earningSlippage <= maxSlippage.slippage.toNumber();
  }, [earningSlippage, maxSlippage, currentAmount]);

  useEffect(() => {
    if (!isSlippageAcceptable && !hasScrolled) {
      scrollToAlertBox();
      setHasScrolled(true);
    }
  }, [isSlippageAcceptable, hasScrolled, scrollToAlertBox]);

  const onSelectSlippage = useCallback((slippage: SlippageType) => {
    setMaxSlippage(slippage);
  }, []);

  const onOpenSlippageModal = useCallback(() => {
    setSlippageModalVisible(true);
  }, []);

  const renderSubnetStaking = useCallback(() => {
    return (
      <>
        <MetaInfo.Default label={'Subnet'}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
            <Logo size={24} isShowSubLogo={false} network={networkKey} shape={'circle'} />
            <Typography.Text style={{ color: theme['gray-5'] }}>{poolInfo.metadata.shortName}</Typography.Text>
          </View>
        </MetaInfo.Default>

        {!isDisabledSubnetContent && earningRate > 0 && (
          <>
            <MetaInfo.Number
              decimals={assetDecimals}
              label={'Expected alpha amount'}
              suffix={poolInfo.metadata?.subnetData?.subnetSymbol || ''}
              value={BigN(currentAmount).multipliedBy(1 / earningRate)}
            />

            <MetaInfo.Default label={'Conversion rate'}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Typography.Text style={{ color: theme['gray-5'] }}>{`1 ${inputAsset.symbol} = `}</Typography.Text>
                <Number
                  size={14}
                  intColor={theme['gray-5']}
                  decimalColor={theme['gray-5']}
                  unitColor={theme['gray-5']}
                  value={BigN(1)
                    .multipliedBy(10 ** assetDecimals)
                    .multipliedBy(1 / earningRate)}
                  decimal={assetDecimals}
                  suffix={poolInfo.metadata?.subnetData?.subnetSymbol || ''}
                />
              </View>
            </MetaInfo.Default>
          </>
        )}

        <MetaInfo.Default
          label={
            <Tooltip
              isVisible={tooltipVisible}
              disableShadow={true}
              placement={'top'}
              showChildInTooltip={false}
              topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
              contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
              closeOnBackgroundInteraction={true}
              onClose={() => setTooltipVisible(false)}
              content={
                <Typography.Text size={'sm'} style={{ color: theme.colorWhite, textAlign: 'center' }}>
                  {'If slippage exceeds this limit, transaction will not be executed'}
                </Typography.Text>
              }>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}
                onPress={() => setTooltipVisible(true)}>
                <Typography.Text style={{ color: theme['gray-5'] }}>{'Slippage'}</Typography.Text>
                <Icon phosphorIcon={Info} size="xs" iconColor={theme['gray-5']} weight={'bold'} />
              </TouchableOpacity>
            </Tooltip>
          }>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}
            onPress={() => onOpenSlippageModal()}>
            <Typography.Text style={{ color: isSlippageAcceptable ? theme['gray-5'] : '#BF1616' }}>
              {maxSlippage.slippage.toNumber() * 100}%
            </Typography.Text>
            <Icon phosphorIcon={PencilSimpleLine} size={'xs'} iconColor={theme['gray-5']} weight={'bold'} />
          </TouchableOpacity>
        </MetaInfo.Default>
      </>
    );
  }, [
    assetDecimals,
    currentAmount,
    earningRate,
    inputAsset.symbol,
    isDisabledSubnetContent,
    isSlippageAcceptable,
    maxSlippage.slippage,
    networkKey,
    onOpenSlippageModal,
    poolInfo.metadata.shortName,
    poolInfo.metadata?.subnetData?.subnetSymbol,
    theme,
    tooltipVisible,
  ]);

  // For subnet staking

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
      !isSlippageAcceptable ||
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
      isSlippageAcceptable,
      mustChooseTarget,
      poolTarget,
    ],
  );

  const renderMetaInfo = useCallback(() => {
    if (!poolInfo && !isShowNoPoolInfoPopupRef.current) {
      isShowNoPoolInfoPopupRef.current = true;
      Alert.alert('Unable to get earning data', 'Please, go back and try again later');
    }
    const value = currentAmount ? parseFloat(currentAmount) / 10 ** assetDecimals : 0;
    const assetSymbol = inputAsset ? inputAsset.symbol : '';

    const assetEarnings =
      poolInfo?.statistic && 'assetEarning' in poolInfo?.statistic ? poolInfo?.statistic.assetEarning : [];
    const derivativeAssets =
      poolInfo?.metadata && 'derivativeAssets' in poolInfo?.metadata ? poolInfo?.metadata.derivativeAssets : [];
    const showFee = [YieldPoolType.LENDING, YieldPoolType.LIQUID_STAKING].includes(poolInfo?.type);

    let minJoinPool: string | undefined;

    if (poolInfo?.statistic) {
      const minPoolJoin = poolInfo?.statistic.earningThreshold.join;
      const targeted = poolTargets[0];

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
                intColor={theme['gray-5']}
                decimalColor={theme['gray-5']}
                unitColor={theme['gray-5']}
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
            intColor={theme['gray-5']}
            decimalColor={theme['gray-5']}
            unitColor={theme['gray-5']}
            label={'Minimum active stake'}
            suffix={assetSymbol}
            value={minJoinPool}
          />
        )}

        {!isSubnetStaking ? <MetaInfo.Chain chain={chain} label={i18n.inputLabel.network} /> : renderSubnetStaking()}

        {showFee && (
          <MetaInfo.Number
            decimals={0}
            label={i18n.inputLabel.estimatedFee}
            prefix={currencyData?.symbol}
            value={estimatedFee}
          />
        )}
      </MetaInfo>
    );
  }, [
    poolInfo,
    currentAmount,
    assetDecimals,
    inputAsset,
    theme,
    isSubnetStaking,
    chain,
    renderSubnetStaking,
    currencyData?.symbol,
    estimatedFee,
    poolTargets,
    chainAsset,
  ]);

  const showValidatorMaxCountWarning = useCallback(
    (maxCount: number, userSelectedPoolCount: number, callback: VoidFunction) => {
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
            onPress: callback,
          },
        ],
      );
    },
    [],
  );

  const netuid = useMemo(() => poolInfo.metadata.subnetData?.netuid, [poolInfo.metadata.subnetData]);

  const onSubmit = useCallback(() => {
    if (!poolInfo) {
      Alert.alert('Unable to get earning data', 'Please, go back and try again later');
    }

    setSubmitLoading(true);
    const values = getValues();
    const { from, value: _currentAmount } = values;
    let processId = processState.processId;
    const getData = (submitStep: number): SubmitYieldJoinData => {
      if (
        [YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING, YieldPoolType.SUBNET_STAKING].includes(
          poolInfo.type,
        ) &&
        poolTarget
      ) {
        const targets = poolTargets;

        if (poolInfo.type === YieldPoolType.NOMINATION_POOL) {
          const selectedPool = targets[0];

          return {
            slug: slug,
            address: from,
            amount: _currentAmount,
            selectedPool,
            selectedValidators: targets,
          } as SubmitJoinNominationPool;
        } else {
          return {
            slug: slug,
            address: from,
            amount: _currentAmount,
            selectedValidators: targets,
            subnetData: {
              netuid: netuid,
              slippage: maxSlippage?.slippage.toNumber(),
              stakingFee: stakingFee,
            },
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
      const isFirstStep = step === 0;
      const isLastStep = step === processState.steps.length - 1;
      const needRollback = step === 1;
      const data = getData(step);

      if (isFirstStep) {
        processId = getId();
      }

      dispatchProcessState({
        type: EarningActionType.STEP_SUBMIT,
        payload: isFirstStep ? { processId } : null,
      });

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
          if (oneSign && path.steps.length > 2) {
            const submitPromise: Promise<SWTransactionResponse> = submitProcess({
              address: from,
              id: processId,
              type: ProcessType.EARNING,
              request: {
                path: path,
                data: data,
                currentStep: step,
              },
            });

            const rs = await submitPromise;

            onSuccess(true, needRollback)(rs);

            return true;
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
        }
      } catch (e) {
        onError(e as Error);
        return false;
      }
    };
    const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer ?? 1;
    const userSelectedPoolCount = poolTarget.split(',').length ?? 1;
    const label = getValidatorLabel(chain);

    if (
      userSelectedPoolCount < maxCount &&
      label === 'Validator' &&
      !DO_NOT_SHOW_VALIDATOR_ALERT_CASES.includes(slug) &&
      !slug.startsWith('TAO___subnet_staking___bittensor')
    ) {
      showValidatorMaxCountWarning(maxCount, userSelectedPoolCount, () => {
        submitData(currentStep)
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
          });
      });

      return; // recheck this code
    }
    submitData(currentStep)
      .catch(onError)
      .finally(() => {
        setSubmitLoading(false);
      });
  }, [
    chain,
    currentStep,
    getValues,
    maxSlippage?.slippage,
    netuid,
    onError,
    onSuccess,
    oneSign,
    poolInfo,
    poolTarget,
    poolTargets,
    processState.feeStructure,
    processState.processId,
    processState.steps,
    showValidatorMaxCountWarning,
    slug,
    stakingFee,
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
      } else if (chainStakingBoth) {
        // hotfix for mkt campaign
        const chainInfo = chainStakingBoth && chainInfoMap[chainStakingBoth];

        const symbol = (!!chainInfo && chainInfo?.substrateInfo?.symbol) || '';
        const originChain = (!!chainInfo && chainInfo?.name) || '';
        let currentPoolType;
        let stakedPoolType;
        if (poolType === YieldPoolType.NOMINATION_POOL) {
          currentPoolType = 'nomination pool';
          stakedPoolType = 'direct nomination';
        } else if (poolType === YieldPoolType.NATIVE_STAKING) {
          currentPoolType = 'direct nomination';
          stakedPoolType = 'nomination pool';
        }
        confirmModal.setConfirmModal({
          visible: true,
          completeBtnTitle: i18n.buttonTitles.continue,
          customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
          title: 'Continue staking?',
          message: (
            <Typography.Text>
              <Typography.Text>{`You're currently staking ${symbol} via ${stakedPoolType}. Due to ${originChain}'s `}</Typography.Text>
              <Typography.Text
                style={{ color: theme.colorPrimary, textDecorationLine: 'underline' }}
                onPress={() =>
                  Linking.openURL(
                    'https://support.polkadot.network/support/solutions/articles/65000188140-changes-for-nomination-pool-members-and-opengov-participation',
                  )
                }>
                {'upcoming changes'}
              </Typography.Text>
              <Typography.Text>
                {`, continuing to stake via ${currentPoolType} will lead to pool-staked funds being frozen (e.g., can't unstake, claim rewards)`}
              </Typography.Text>
            </Typography.Text>
          ),
          onCancelModal: confirmModal.hideConfirmModal,
          onCompleteModal: () => {
            confirmModal.hideConfirmModal();
            onSubmit();
          },
        });
      } else {
        onSubmit();
      }
    }, 100);
  }, [
    chainInfoMap,
    chainStakingBoth,
    confirmModal,
    currentConfirmations,
    globalAppModalContext,
    onSubmit,
    poolType,
    renderConfirmationButtons,
    theme.colorPrimary,
    theme.colorWarning,
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
    setAsset(inputAsset ? inputAsset.slug : '');
  }, [inputAsset, setAsset]);

  useEffect(() => {
    if (!currentFrom && accountAddressItems.length === 1) {
      if ((redirectFromPreviewRef.current && accountAddressItems.length >= 1) || accountAddressItems.length === 1) {
        setFrom(accountAddressItems[0].address);
      }
    }
  }, [accountAddressItems, currentFrom, isAllAccount, setFrom]);

  useEffect(() => {
    if (currentStep === 0) {
      const submitData: OptimalYieldPathParams = {
        address: currentFrom,
        amount: currentAmount,
        slug: slug,
        targets: poolTarget ? poolTargets : undefined,
        netuid: netuid,
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
              .catch((e: Error) => console.log('error when getOptimalYieldPath', e.message))
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
    poolTargets,
    netuid,
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
        .catch((e: Error) => console.log('error when fetchPoolTarget', e.message))
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
    if (redirectFromPreviewRef.current && !accountAddressItems.length && checkValidAccountLoading) {
      const chainName = chainInfoMap[poolChain]?.name;
      navigation.navigate('Home', {
        screen: 'Main',
        params: {
          screen: 'Earning',
          params: {
            screen: 'EarningList',
            params: { step: 1, noAccountValid: true, accountType: undefined, chain: chainName },
          },
        },
      });
    } else {
      setCheckValidAccountLoading(false);
    }
  }, [accountAddressItems.length, chainInfoMap, checkValidAccountLoading, navigation, poolChain]);

  useEffect(() => {
    if (!isLoading && !checkValidAccountLoading && (!compound || redirectFromPreviewRef.current)) {
      isPressInfoBtnRef.current = false;
      setTimeout(() => setDetailModalVisible(true), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!compound, isLoading, checkValidAccountLoading]);

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

  return (
    <>
      {!isTransactionDone || (oneSign && processState.steps.length > 2) ? (
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
                  ref={scrollViewRef}
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
                    items={accountAddressItems}
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
                      <AccountSelectField
                        accountName={accountInfo?.accountName || ''}
                        value={currentFrom}
                        showIcon
                        outerStyle={{ marginBottom: theme.sizeSM }}
                      />
                    )}
                  />
                  <FreeBalanceToYield
                    address={currentFrom}
                    label={`${i18n.inputLabel.availableBalance}`}
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
                      label={`${i18n.inputLabel.availableBalance}`}
                      tokenSlug={inputAsset ? inputAsset.slug : ''}
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
                      prefix={currencyData?.symbol}
                      unitColor={theme.colorTextLight4}
                      value={transformAmount}
                      style={{ marginBottom: theme.marginSM }}
                    />

                    {poolType === YieldPoolType.NOMINATION_POOL && (
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
                    )}

                    {(poolType === YieldPoolType.NATIVE_STAKING || poolType === YieldPoolType.SUBNET_STAKING) && (
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

                    {!isSlippageAcceptable && (
                      <View style={{ marginTop: theme.marginSM }} ref={alertBoxRef}>
                        <AlertBox
                          title={'Slippage too high!'}
                          description={`Unable to stake due to a slippage of ${(earningSlippage * 100).toFixed(
                            2,
                          )}%, which exceeds the current slippage set for this transaction. Lower your stake amount or increase slippage and try again`}
                          type={'error'}
                        />
                      </View>
                    )}
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
                    onPress={preCheckAction(onPressSubmit, ExtrinsicType.JOIN_YIELD_POOL)}>
                    {i18n.buttonTitles.stake}
                  </Button>
                </View>

                <SlippageModal
                  modalVisible={slippageModalVisible}
                  setModalVisible={setSlippageModalVisible}
                  slippageValue={maxSlippage}
                  onApplySlippage={onSelectSlippage}
                />

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
              </>
            )}
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.JOIN_YIELD_POOL} />
      )}
    </>
  );
};

export default EarnTransaction;
