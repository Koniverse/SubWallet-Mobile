import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useGetChainStakingMetadata from 'hooks/screen/Staking/useGetChainStakingMetadata';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import {
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
  const unbondFormConfig = useMemo(
    () => ({
      nomination: {
        name: 'Nomination',
        value: '',
      },
    }),
    [],
  );
  const accountSelectorRef = useRef<ModalRef>();
  const { title, formState, onChangeValue, onChangeAmountValue, onChangeFromValue, onDone, onUpdateErrors } =
    useTransaction('unstake', unbondFormConfig, {});
  const { from, nomination: currentValidator, chain, value: currentValue } = formState.data;
  const { accounts, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(stakingChain || '');
  const chainStakingMetadata = useGetChainStakingMetadata(stakingChain);
  const allNominatorInfo = useGetNominatorInfo(stakingChain, stakingType);
  const nominatorInfo = useGetNominatorInfo(stakingChain, stakingType, from);
  const nominatorMetadata = nominatorInfo[0];
  const accountInfo = useGetAccountByAddress(from);
  const selectedValidator = useMemo((): NominationInfo | undefined => {
    if (nominatorMetadata) {
      return nominatorMetadata.nominations.find(item => item.validatorAddress === currentValidator);
    } else {
      return undefined;
    }
  }, [currentValidator, nominatorMetadata]);

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
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);

  const accountList = useMemo(() => {
    return accounts.filter(_accountFilterFunc(allNominatorInfo, chainInfoMap, stakingType, stakingChain));
  }, [accounts, allNominatorInfo, chainInfoMap, stakingChain, stakingType]);

  const renderBounded = useCallback(() => {
    return <BondedBalance bondedBalance={bondedValue} decimals={decimals} symbol={symbol} />;
  }, [bondedValue, decimals, symbol]);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, from);

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
    if (from && nominatorMetadata?.nominations && nominatorMetadata.nominations.length) {
      return nominatorMetadata.nominations.filter(n => new BigN(n.activeStake || '0').gt(BN_ZERO));
    }

    return [];
  }, [from, nominatorMetadata?.nominations]);

  useEffect(() => {
    onChangeValue('chain')(stakingChain || '');
  }, [onChangeValue, stakingChain]);

  const validateAmountInput = useCallback(
    (value: string, min: number | string | BigN, max: number | string | BigN, _decimals: number, name?: string) => {
      const _minValue = new BigN(min);
      const _maxValue = new BigN(max);
      const _middleValue = _maxValue.minus(_minValue);
      const _maxString = formatBalance(_maxValue, _decimals);
      const val = new BigN(value);

      if (val.gt(_maxValue)) {
        onUpdateErrors('value')([i18n.errorMessage.unbondMustBeEqualOrLessThan(_maxString, name)]);
        return;
      }

      if (val.lte(BN_ZERO)) {
        onUpdateErrors('value')([i18n.errorMessage.unbondMustBeGreaterThanZero(name)]);
        return;
      }

      if (_middleValue.lt(BN_ZERO) && !val.eq(_maxValue)) {
        onUpdateErrors('value')([i18n.errorMessage.unbondMustBeEqual(_maxString, name)]);
        return;
      }

      if (val.gt(_middleValue) && val.lt(_maxValue)) {
        onUpdateErrors('value')([i18n.errorMessage.unbondInvalidAmount]);
        return;
      }

      onUpdateErrors('value')([]);
    },
    [onUpdateErrors],
  );

  const _onChangeAmount = useCallback(
    (text: string) => {
      onChangeAmountValue(text);
      validateAmountInput(text, minValue, bondedValue, decimals);
    },
    [bondedValue, decimals, minValue, onChangeAmountValue, validateAmountInput],
  );

  return (
    <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
      <>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} keyboardShouldPersistTaps="handled">
          {isAllAccount && (
            <AccountSelector
              items={accountList}
              selectedValueMap={{ [from]: true }}
              disabled={loading}
              onSelectItem={item => {
                onChangeFromValue(item.address);
                accountSelectorRef && accountSelectorRef.current?.onCloseModal();
              }}
              renderSelected={() => (
                <AccountSelectField
                  label={i18n.inputLabel.unstakeFromAcc}
                  accountName={accountInfo?.name || ''}
                  value={from}
                  showIcon
                />
              )}
              accountSelectorRef={accountSelectorRef}
            />
          )}

          <FreeBalance label={`${i18n.inputLabel.availableBalance}:`} address={from} chain={chain} />

          {mustChooseValidator && (
            <>
              <NominationSelector
                selectedValue={currentValidator}
                onSelectItem={onChangeValue('nomination')}
                nominators={nominators}
                disabled={!from || loading}
              />
              {renderBounded()}
            </>
          )}

          <InputAmount
            value={currentValue}
            maxValue={bondedValue}
            onChangeValue={_onChangeAmount}
            decimals={decimals}
            errorMessages={formState.errors.value}
            disable={loading}
            showMaxButton={!!from}
          />

          {!mustChooseValidator && renderBounded()}

          <Typography.Text
            style={{
              color: theme.colorTextTertiary,
              ...FontMedium,
            }}>
            {i18n.message.unBondMessage(unBondedTime)}
          </Typography.Text>
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, ...MarginBottomForSubmitButton }}>
          <Button
            disabled={!formState.isValidated.value || !formState.data.value || !formState.data.from || loading}
            loading={loading}
            icon={
              <Icon
                phosphorIcon={MinusCircle}
                weight={'fill'}
                size={'lg'}
                iconColor={
                  !formState.isValidated.value || !formState.data.value || !formState.data.from
                    ? theme.colorTextLight5
                    : theme.colorWhite
                }
              />
            }
            onPress={onPreCheckReadOnly(onSubmit)}>
            {i18n.buttonTitles.unbond}
          </Button>
        </View>
      </>
    </TransactionLayout>
  );
};
