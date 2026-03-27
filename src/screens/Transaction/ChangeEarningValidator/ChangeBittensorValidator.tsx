import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  NominationInfo,
  SubmitBittensorChangeValidatorStaking,
  ValidatorInfo,
  YieldPoolType,
} from '@subwallet/extension-base/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { findAccountByAddress } from 'utils/account';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import { useCreateGetSubnetStakingTokenName, useYieldPositionDetail } from 'hooks/earning';
import { isActionFromValidator } from '@subwallet/extension-base/services/earning-service/utils';
import { parseNominations } from 'utils/transaction';
import { reformatAddress } from '@subwallet/extension-base/utils';
import MetaInfo from 'components/MetaInfo';
import { Platform, ScrollView, StatusBar, Switch, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Logo, Number, PageIcon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import { useTaoStakingFee } from 'hooks/earning/useTaoStakingFee';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { AppModalContext } from 'providers/AppModalContext';
import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import i18n from 'utils/i18n/i18n';
import { changeEarningValidator } from 'messaging/index';
import { CheckCircleIcon, InfoIcon, WarningIcon } from 'phosphor-react-native';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { formatBalance } from 'utils/number';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useWatch } from 'react-hook-form';
import { EarningValidatorSelector } from 'components/Modal/Earning/EarningValidatorSelector';
import Tooltip from 'react-native-walkthrough-tooltip';
import { ColorMap } from 'styles/color';
import { FormItem } from 'components/common/FormItem';
import { InputAmount } from 'components/Input/InputAmount';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

interface Props {
  chain: string;
  from: string;
  slug: string;
  nominations: NominationInfo[];
  isSingleSelect?: boolean;
  setForceFetchValidator: (val: boolean) => void;
  disabled?: boolean;
}

export interface ChangeEarningValidatorValues extends TransactionFormValues {
  slug: string;
  originValidator: string;
  target: string;
}

export const ChangeBittensorValidator = ({
  chain,
  from,
  slug,
  nominations,
  isSingleSelect: _isSingleSelect = false,
  setForceFetchValidator,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { show, hideAll } = useToast();
  const { confirmModal } = useContext(AppModalContext);
  const [isShowAmountChange, setIsShowAmountChange] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { poolTargetsMap } = useSelector((state: RootState) => state.earning);
  const getSubnetStakingTokenName = useCreateGetSubnetStakingTokenName();
  const account = findAccountByAddress(accounts, from);
  const poolInfo = poolInfoMap[slug];
  const poolType = useMemo(() => poolInfo.type, [poolInfo]);
  const poolChain = useMemo(() => poolInfo.chain, [poolInfo]);
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

  const {
    form: { setValue, getValues, control },
    onTransactionDone: onDone,
    transactionDoneInfo,
  } = useTransaction<ChangeEarningValidatorValues>('change-earning-validator', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      target: '',
      slug: slug,
      chain: chain,
      from: from,
    },
  });

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setTransactionDone);

  const originValidator = useWatch<ChangeEarningValidatorValues>({ name: 'originValidator', control });
  const toTarget = useWatch<ChangeEarningValidatorValues>({ name: 'target', control });
  const value = useWatch<ChangeEarningValidatorValues>({ name: 'value', control });
  const bondedAsset = useGetChainAssetInfo(bondedSlug || poolInfo.metadata.inputAsset);
  const symbol = poolInfo.metadata.subnetData?.subnetSymbol || bondedAsset?.symbol;
  const decimals = useMemo(() => bondedAsset?.decimals || 0, [bondedAsset]);
  const { compound: positionInfo } = useYieldPositionDetail(slug, from);

  const selectedValidator = useMemo(() => {
    return positionInfo?.nominations.find(item => item.validatorAddress === originValidator);
  }, [originValidator, positionInfo]);

  const mustChooseValidator = useMemo(() => isActionFromValidator(poolType, poolChain || ''), [poolChain, poolType]);

  const bondedValue = useMemo(() => {
    switch (poolInfo.type) {
      case YieldPoolType.NATIVE_STAKING:
      case YieldPoolType.SUBNET_STAKING:
        if (!mustChooseValidator) {
          return positionInfo?.activeStake || '0';
        }

        return selectedValidator?.activeStake || '0';

      case YieldPoolType.LENDING: {
        const input = poolInfo.metadata.inputAsset;
        const exchangeRate = poolInfo.statistic?.assetEarning.find(item => item.slug === input)?.exchangeRate || 1;

        return new BigN(positionInfo?.activeStake || '0').multipliedBy(exchangeRate).toFixed(0);
      }

      case YieldPoolType.LIQUID_STAKING:
      case YieldPoolType.NOMINATION_POOL:
      default:
        return positionInfo?.activeStake || '0';
    }
  }, [
    mustChooseValidator,
    poolInfo.metadata.inputAsset,
    poolInfo.statistic?.assetEarning,
    poolInfo.type,
    positionInfo?.activeStake,
    selectedValidator?.activeStake,
  ]);

  const poolTargets = useMemo(() => {
    const _poolTargets = poolTargetsMap[slug];

    if (!_poolTargets) {
      return [];
    }

    if (poolType === YieldPoolType.NATIVE_STAKING || poolType === YieldPoolType.SUBNET_STAKING) {
      const validatorList = _poolTargets as ValidatorInfo[];

      if (!validatorList) {
        return [];
      }

      const result: ValidatorInfo[] = [];
      const _nominations = parseNominations(toTarget);
      const newValidatorList: { [address: string]: ValidatorInfo } = {};

      validatorList.forEach(validator => {
        newValidatorList[reformatAddress(validator.address)] = validator;
      });
      _nominations.forEach(nomination => {
        if (newValidatorList?.[reformatAddress(nomination)]) {
          result.push(newValidatorList[reformatAddress(nomination)]);
        }
      });

      return result;
    }

    return [];
  }, [toTarget, poolTargetsMap, poolType, slug]);

  const netuid = useMemo(() => poolInfo.metadata.subnetData?.netuid, [poolInfo.metadata.subnetData]);
  const isDisabled = useMemo(
    () => !originValidator || !toTarget || (isShowAmountChange && !value),
    [originValidator, toTarget, isShowAmountChange, value],
  );

  const isSubnetStaking = useMemo(() => [YieldPoolType.SUBNET_STAKING].includes(poolType), [poolType]);

  const subnetToken = useMemo(() => {
    return getSubnetStakingTokenName(poolInfo.chain, poolInfo.metadata.subnetData?.netuid || 0);
  }, [getSubnetStakingTokenName, poolInfo.chain, poolInfo.metadata.subnetData?.netuid]);

  const renderSubnetStaking = useCallback(() => {
    return (
      <MetaInfo.Default label={'Subnet'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Logo network={poolChain} shape={'circle'} size={24} isShowSubLogo={false} token={subnetToken} />
          <Typography.Text style={{ color: theme['gray-5'] }}>{poolInfo.metadata.shortName}</Typography.Text>
        </View>
      </MetaInfo.Default>
    );
  }, [poolChain, poolInfo.metadata.shortName, subnetToken, theme]);

  const showAmountChangeInput = useCallback(() => {
    setIsShowAmountChange(!isShowAmountChange);
  }, [isShowAmountChange]);

  //todo: write useEffect to convert onValuesChange

  const notifyTooHighAmount = useCallback(() => {
    hideAll();
    show(
      `Amount too high. Lower your amount to no more than ${formatBalance(bondedValue, decimals)} ${
        symbol || ''
      } and try again`,
      { type: 'danger' },
    );
  }, [bondedValue, decimals, hideAll, show, symbol]);

  const { earningRate, stakingFee } = useTaoStakingFee(
    poolInfo,
    value || bondedValue,
    decimals,
    poolInfo.metadata.subnetData?.netuid || 0,
    ExtrinsicType.STAKING_UNBOND,
    setSubmitLoading,
  );

  const onPressSubmit = () => {
    if (isShowAmountChange && new BigN(value).gt(bondedValue)) {
      notifyTooHighAmount();

      return;
    }

    const { originValidator: currentOriginValue, value: currentValue } = getValues();

    const isMovePartialStake = new BigN(value).lt(bondedValue);

    const baseData = {
      slug: poolInfo.slug,
      address: from,
      selectedValidators: poolTargets,
      originValidator: currentOriginValue,
      metadata: {
        subnetSymbol: symbol as string,
      },
      isMovePartialStake,
      maxAmount: bondedValue,
      ...(netuid !== undefined && {
        subnetData: {
          netuid,
          slippage: 0,
          stakingFee,
        },
      }),
    };

    const send = (amount: string): void => {
      setSubmitLoading(true);

      const submitData: SubmitBittensorChangeValidatorStaking = {
        ...baseData,
        amount,
      };

      changeEarningValidator(submitData)
        .then(onSuccess)
        .catch((error: TransactionError) => {
          if (error.message.includes('remaining')) {
            confirmModal.setConfirmModal({
              visible: true,
              title: i18n.warningTitle.payAttention,
              message: error.message,
              cancelBtnTitle: i18n.buttonTitles.cancel,
              completeBtnTitle: 'Move all',
              onCancelModal: () => {
                confirmModal.hideConfirmModal();
                setSubmitLoading(false);
              },
              onCompleteModal: () => {
                confirmModal.hideConfirmModal();
                send(bondedValue);
              },
              customIcon: <PageIcon icon={WarningIcon} color={theme.colorWarning} />,
            });
          } else {
            onError(error);
            setSubmitLoading(false);
          }
        })
        .finally(() => {
          setSubmitLoading(false);
        });
    };

    send(isShowAmountChange ? currentValue : bondedValue);
  };

  useEffect(() => {
    if (confirmModal.confirmModalState.visible) {
      setIsShowAmountChange(false);
    }
  }, [confirmModal.confirmModalState.visible]);
  const onPreCheck = usePreCheckAction(from);

  const onChangeNominator = useCallback(
    (nominatorValue: string) => {
      setValue('originValidator', nominatorValue);
    },
    [setValue],
  );

  useEffect(() => {
    if (!originValidator) {
      if (nominations[0]?.validatorAddress) {
        setValue('originValidator', nominations[0].validatorAddress);
      }
    }
  }, [nominations, originValidator, setValue]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={'Change validator'} titleTextAlign={'center'} showMainHeader={false}>
          <ScrollView>
            <View style={{ paddingHorizontal: theme.padding, flex: 1, marginTop: theme.margin }}>
              <AccountItemWithName accountName={account?.name} address={from} avatarSize={20} />
              <Typography.Text
                style={{
                  color: theme.colorTextTertiary,
                  paddingVertical: theme.paddingXS,
                }}>{`Staked balance: ${formatBalance(bondedValue, decimals)} ${symbol}`}</Typography.Text>

              <NominationSelector
                chain={chain}
                disabled={!from}
                isChangeValidator
                label={i18n.inputLabel.from}
                nominators={nominations}
                poolInfo={poolInfo}
                selectedValue={originValidator}
                onSelectItem={onChangeNominator}
              />

              <EarningValidatorSelector
                from={from}
                chain={chain}
                slug={slug}
                disabled={!from}
                label={'Change to'}
                setForceFetchValidator={setForceFetchValidator}
                originValidator={originValidator}
                validatorLoading={false}
                selectedValidator={toTarget}
                onSelectItem={_value => setValue('target', _value)}
              />

              <MetaInfo>
                {!isSubnetStaking ? (
                  <MetaInfo.Chain chain={chain} label={i18n.inputLabel.network} />
                ) : (
                  renderSubnetStaking()
                )}
              </MetaInfo>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.colorBgSecondary,
                  padding: theme.paddingSM,
                  marginVertical: theme.paddingSM,
                  borderRadius: theme.borderRadiusLG,
                }}>
                <Tooltip
                  isVisible={tooltipVisible}
                  disableShadow={true}
                  placement={'bottom'}
                  showChildInTooltip={false}
                  topAdjustment={
                    Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0
                  }
                  contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
                  closeOnBackgroundInteraction={true}
                  onClose={() => setTooltipVisible(false)}
                  content={
                    <Typography.Text size={'sm'} style={{ color: theme.colorWhite, textAlign: 'center' }}>
                      {'Amount you want to move from the selected validator to the new validator'}
                    </Typography.Text>
                  }>
                  <TouchableOpacity
                    activeOpacity={BUTTON_ACTIVE_OPACITY}
                    onPress={() => setTooltipVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
                    <Typography.Text style={{ color: theme.colorWhite }}>{'Change staking amount'}</Typography.Text>
                    <Icon phosphorIcon={InfoIcon} size={'sm'} weight={'fill'} />
                  </TouchableOpacity>
                </Tooltip>

                <Switch
                  ios_backgroundColor={ColorMap.switchInactiveButtonColor}
                  value={isShowAmountChange}
                  onValueChange={showAmountChangeInput}
                />
              </View>

              {isShowAmountChange && (
                <>
                  <FormItem
                    control={control}
                    name={'value'}
                    render={({ field: { onChange, value: _value, ref } }) => (
                      <InputAmount
                        ref={ref}
                        value={_value}
                        maxValue={bondedValue}
                        onChangeValue={onChange}
                        decimals={decimals}
                        disable={submitLoading}
                        showMaxButton={true}
                      />
                    )}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: theme.paddingXS }}>
                    <Typography.Text style={{ color: theme.colorTextTertiary }}>
                      {'Minimum active stake'}
                    </Typography.Text>
                    <Number
                      decimal={decimals}
                      value={
                        earningRate > 0
                          ? BigN(poolInfo.statistic?.earningThreshold.join || 0).div(earningRate)
                          : BigN(poolInfo.statistic?.earningThreshold.join || 0)
                      }
                      suffix={earningRate > 0 ? symbol : bondedAsset?.symbol}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
          <View style={{ paddingHorizontal: theme.padding, paddingBottom: theme.padding, paddingTop: theme.padding }}>
            <Button
              icon={
                <Icon
                  phosphorIcon={CheckCircleIcon}
                  weight={'fill'}
                  iconColor={isDisabled || submitLoading ? theme.colorTextTertiary : theme.colorWhite}
                />
              }
              loading={submitLoading}
              onPress={onPreCheck(onPressSubmit, ExtrinsicType.CHANGE_EARNING_VALIDATOR)}
              disabled={isDisabled || submitLoading}>
              {'Update validator'}
            </Button>
          </View>
        </TransactionLayout>
      ) : (
        <TransactionDone
          transactionDoneInfo={transactionDoneInfo}
          extrinsicType={ExtrinsicType.CHANGE_EARNING_VALIDATOR}
        />
      )}
    </>
  );
};
