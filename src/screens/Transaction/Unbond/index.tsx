import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StakingScreenNavigationProps, UnbondScreenNavigationProps } from 'routes/staking/stakingScreen';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
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
import usePreCheckReadOnly from 'hooks/usePreCheckReadOnly';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { TouchableOpacity, View } from 'react-native';
import { SubHeader } from 'components/SubHeader';
import { Info, MinusCircle } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { InputAmount } from 'components/Input/InputAmount';
import { BN_TEN } from 'utils/number';
import { BN_ZERO } from 'utils/chainBalances';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { accountFilterFunc } from 'screens/Transaction/helper/staking';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { submitPoolUnbonding, submitUnbonding } from '../../../messaging';
import { FontMedium } from 'styles/sharedStyles';

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
}: UnbondScreenNavigationProps) => {
  const theme = useSubWalletTheme().swThemes;
  const stakingType = _stakingType as StakingType;
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const unbondFormConfig = useMemo(
    () => ({
      nomination: {
        name: 'Nomination',
        value: '',
      },
    }),
    [],
  );

  const { title, formState, onChangeValue, onChangeAmountValue, onChangeFromValue, onDone, onUpdateErrors } =
    useTransaction('unstake', unbondFormConfig);
  const { from, nomination: currentValidator, chain, value: currentValue } = formState.data;
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [accountSelectModalVisible, setAccountSelectModalVisible] = useState<boolean>(false);
  const isAll = isAccountAll(currentAccount?.address || '');

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

        return `${days} days${hours ? ` ${hours} 'hours'` : ''}`;
      } else {
        return `${time} 'hours'`;
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

  const onPreCheckReadOnly = usePreCheckReadOnly(from);

  const onSubmit = useCallback(() => {
    let unbondingPromise: Promise<SWTransactionResponse>;

    console.log('currentValue2222222', currentValue);
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

      console.log('params', params);

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

  useEffect(() => {
    onChangeValue('chain')(stakingChain || '');
  }, [onChangeValue, stakingChain]);

  const validateAmountInput = useCallback(
    (value: string, min: number | string | BigN, max: number | string | BigN, _decimals: number, name?: string) => {
      const _minValue = new BigN(min);
      const _maxValue = new BigN(max);
      const _middleValue = _maxValue.minus(_minValue);
      const _maxString = _maxValue.div(BN_TEN.pow(_decimals)).toString();
      const _middleString = _middleValue.div(BN_TEN.pow(_decimals)).toString();
      const val = new BigN(value);

      if (val.gt(_maxValue)) {
        onUpdateErrors('value')([`${name || 'Value'} must be equal or lesser than ${_maxString}`]);
        return;
      }

      if (val.lte(BN_ZERO)) {
        onUpdateErrors('value')([`${name || 'Value'} must be greater than 0`]);
        return;
      }

      if (_middleValue.lt(BN_ZERO) && !val.eq(_maxString)) {
        onUpdateErrors('value')([`${name || 'Value'} must be equal ${_maxString}`]);
        return;
      }

      if (val.gt(_middleValue) && val.lt(_maxValue)) {
        onUpdateErrors('value')([`${name || 'Value'} must be between 0 and ${_middleString} or equal ${_maxString}`]);
        return;
      }

      onUpdateErrors('value')([]);
    },
    [onUpdateErrors],
  );

  const _onChangeAmount = useCallback(
    (text: string) => {
      console.log('text', text);
      onChangeAmountValue(text);
      validateAmountInput(text, minValue, bondedValue, decimals);
    },
    [bondedValue, decimals, minValue, onChangeAmountValue, validateAmountInput],
  );

  return (
    <ScreenContainer backgroundColor={'#0C0C0C'}>
      <>
        <Header />

        <View style={{ marginTop: 16 }}>
          <SubHeader
            onPressBack={() => navigation.goBack()}
            title={title}
            showRightBtn
            rightIcon={Info}
            onPressRightIcon={() => {}}
          />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          {isAll && (
            <TouchableOpacity onPress={() => setAccountSelectModalVisible(true)}>
              <AccountSelectField
                label={'Unstake from account'}
                accountName={accountInfo?.name || ''}
                value={from}
                showIcon
              />
            </TouchableOpacity>
          )}

          <FreeBalance label={'Available balance:'} address={from} chain={chain} />

          {mustChooseValidator && (
            <>
              <NominationSelector
                selectedValue={currentValidator}
                onSelectItem={onChangeValue('nomination')}
                nominators={from ? nominatorMetadata?.nominations || [] : []}
                disabled={!from}
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
          />

          {!mustChooseValidator && renderBounded()}

          <Typography.Text
            style={{
              color: theme.colorTextTertiary,
              ...FontMedium,
            }}>{`Once unbonded, your funds would be available after ${unBondedTime}.`}</Typography.Text>

          <AccountSelector
            modalVisible={accountSelectModalVisible}
            onSelectItem={item => {
              onChangeFromValue(item.address);
              setAccountSelectModalVisible(false);
            }}
            items={accountList}
            onCancel={() => setAccountSelectModalVisible(false)}
          />
        </View>

        <View style={{ padding: 16 }}>
          <Button
            disabled={!formState.isValidated.value || !formState.data.value}
            loading={loading}
            icon={
              <Icon
                phosphorIcon={MinusCircle}
                weight={'fill'}
                size={'lg'}
                iconColor={
                  !formState.isValidated.value || !formState.data.value ? theme.colorTextLight5 : theme.colorWhite
                }
              />
            }
            onPress={onPreCheckReadOnly(onSubmit)}>
            Submit
          </Button>
        </View>
      </>
    </ScreenContainer>
  );
};
