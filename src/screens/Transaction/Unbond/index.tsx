import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransactionV2';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useGetChainStakingMetadata from 'hooks/screen/Staking/useGetChainStakingMetadata';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import {
  AmountData,
  NominationInfo,
  NominatorMetadata,
  RequestStakePoolingUnbonding,
  RequestUnbondingSubmit,
  StakingType,
} from '@subwallet/extension-base/background/KoniTypes';
import { isActionFromValidator } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import BigN from 'bignumber.js';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { BondedBalance } from 'screens/Transaction/parts/BondedBalance';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import { ScrollView, View } from 'react-native';
import { MinusCircle } from 'phosphor-react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { InputAmount } from 'components/Input/InputAmount';
import { formatBalance } from 'utils/number';
import { BN_ZERO } from 'utils/chainBalances';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { accountFilterFunc } from 'screens/Transaction/helper/staking';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { submitPoolUnbonding, submitUnbonding } from 'messaging/index';
import { FontMedium, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { UnbondProps } from 'routes/transaction/transactionAction';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { FormItem } from 'components/common/FormItem';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { getInputValuesFromString } from 'components/Input/InputAmountV2';
import { useGetBalance } from 'hooks/balance';

interface UnstakeFormValues extends TransactionFormValues {
  nomination: string;
}

const _accountFilterFunc = (
  allNominator: NominatorMetadata[],
  chainInfoMap: Record<string, _ChainInfo>,
  stakingType: StakingType,
  stakingChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nominator = allNominator.find(item => item.address.toLowerCase() === account.address.toLowerCase());

    return (
      new BigN(nominator?.activeStake || BN_ZERO).gt(BN_ZERO) &&
      accountFilterFunc(chainInfoMap, stakingType, stakingChain)(account)
    );
  };
};

export const Unbond = ({
  route: {
    params: { chain: stakingChain, type: _stakingType },
  },
}: UnbondProps) => {
  const theme = useSubWalletTheme().swThemes;
  const stakingType = _stakingType as StakingType;
  const accountSelectorRef = useRef<ModalRef>();
  const {
    title,
    form: {
      setValue,
      getValues,
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
  const {
    from: fromValue,
    nomination: currentValidator,
    chain: chainValue,
    value: currentValue,
  } = {
    ...useWatch<UnstakeFormValues>({ control }),
    ...getValues(),
  };

  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(stakingChain || '');
  const chainStakingMetadata = useGetChainStakingMetadata(stakingChain);
  const allNominatorInfo = useGetNominatorInfo(stakingChain, stakingType);
  const nominatorInfo = useGetNominatorInfo(stakingChain, stakingType, fromValue);
  const nominatorMetadata = nominatorInfo[0];
  const accountInfo = useGetAccountByAddress(fromValue);
  const selectedValidator = useMemo((): NominationInfo | undefined => {
    if (nominatorMetadata) {
      return nominatorMetadata.nominations.find(item => item.validatorAddress === currentValidator);
    } else {
      return undefined;
    }
  }, [currentValidator, nominatorMetadata]);
  const { nativeTokenBalance } = useGetBalance(chainValue, fromValue);
  const existentialDeposit = useMemo(() => {
    const assetInfo = Object.values(assetRegistry).find(v => v.originChain === chainValue);
    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetRegistry, chainValue]);

  const mustChooseValidator = useMemo(() => {
    return isActionFromValidator(stakingType, stakingChain || '');
  }, [stakingChain, stakingType]);

  const bondedValue = useMemo((): string => {
    if (!mustChooseValidator) {
      return nominatorMetadata?.activeStake || '0';
    } else {
      return selectedValidator?.activeStake || '0';
    }
  }, [mustChooseValidator, nominatorMetadata?.activeStake, selectedValidator?.activeStake]);

  const minValue = useMemo((): string => {
    if (stakingType === StakingType.POOLED) {
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
    stakingType,
  ]);

  const unBondedTime = useMemo((): string => {
    if (chainStakingMetadata) {
      const time = chainStakingMetadata.unstakingPeriod;

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
  }, [chainStakingMetadata]);

  const [loading, setLoading] = useState(false);
  const accountList = useMemo(() => {
    return accounts.filter(_accountFilterFunc(allNominatorInfo, chainInfoMap, stakingType, stakingChain));
  }, [accounts, allNominatorInfo, chainInfoMap, stakingChain, stakingType]);

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
    chainValue === 'vara_network' && stakingType === StakingType.POOLED ? handleDataForInsufficientAlert : undefined,
  );

  const onSubmit = useCallback(() => {
    let unbondingPromise: Promise<SWTransactionResponse>;

    if (nominatorMetadata.type === StakingType.POOLED) {
      const params: RequestStakePoolingUnbonding = {
        amount: currentValue,
        chain: nominatorMetadata.chain,
        nominatorMetadata,
      };

      unbondingPromise = submitPoolUnbonding(params);
    } else {
      const params: RequestUnbondingSubmit = {
        amount: currentValue,
        chain: nominatorMetadata.chain,
        nominatorMetadata,
      };

      if (mustChooseValidator) {
        params.validatorAddress = currentValidator || '';
      }

      unbondingPromise = submitUnbonding(params);
    }

    setLoading(true);

    setTimeout(() => {
      unbondingPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [currentValidator, currentValue, mustChooseValidator, nominatorMetadata, onError, onSuccess]);

  const nominators = useMemo(() => {
    if (fromValue && nominatorMetadata?.nominations && nominatorMetadata.nominations.length) {
      return nominatorMetadata.nominations.filter(n => new BigN(n.activeStake || '0').gt(BN_ZERO));
    }

    return [];
  }, [fromValue, nominatorMetadata?.nominations]);

  useEffect(() => {
    setChain(stakingChain || '');
  }, [setChain, stakingChain]);

  const amountInputRules = useMemo(
    () => ({
      validate: (value: string): Promise<ValidateResult> => {
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

        if (_middleValue.lt(BN_ZERO) && !val.eq(_maxValue)) {
          return Promise.resolve(i18n.formatString(i18n.errorMessage.unbondMustBeEqual, name, _maxString));
        }

        if (val.gt(_middleValue) && val.lt(_maxValue)) {
          return Promise.resolve(i18n.errorMessage.unbondInvalidAmount);
        }

        return Promise.resolve(undefined);
      },
    }),
    [bondedValue, decimals, minValue],
  );

  const onChangeNominator = (value: string) => {
    setValue('nomination', value);
  };

  const isDisableSubmitBtn = useMemo(
    () => !!errors.value || !currentValue || !fromValue || loading,
    [currentValue, errors.value, fromValue, loading],
  );

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} keyboardShouldPersistTaps="handled">
              {isAllAccount && (
                <AccountSelector
                  items={accountList}
                  selectedValueMap={{ [fromValue]: true }}
                  disabled={loading}
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
              )}

              <FreeBalance label={`${i18n.inputLabel.availableBalance}:`} address={fromValue} chain={chainValue} />

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

              <Typography.Text
                style={{
                  color: theme.colorTextTertiary,
                  ...FontMedium,
                }}>
                {i18n.formatString(i18n.message.unBondMessage, unBondedTime)}
              </Typography.Text>
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
