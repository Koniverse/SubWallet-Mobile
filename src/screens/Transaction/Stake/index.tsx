import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StakingTab } from 'components/common/StakingTab';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { TokenItemType, TokenSelector } from 'components/Modal/common/TokenSelector';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransactionV2';
import useGetSupportedStakingTokens from 'hooks/screen/Staking/useGetSupportedStakingTokens';
import {
  AmountData,
  NominationPoolInfo,
  NominatorMetadata,
  StakingType,
  ValidatorInfo,
} from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { InputAmount } from 'components/Input/InputAmount';
import { useGetBalance } from 'hooks/balance';
import BigN from 'bignumber.js';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { Button, Divider, Icon } from 'components/design-system-ui';
import { submitBonding, submitPoolBonding } from 'messaging/index';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { PoolSelector } from 'components/Modal/common/PoolSelector';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { fetchChainValidators } from 'screens/Transaction/helper/staking';
import { ALL_KEY } from 'constants/index';
import { ValidatorSelector, ValidatorSelectorRef } from 'components/Modal/common/ValidatorSelector';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { parseNominations } from 'utils/transaction/stake';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfo from 'components/MetaInfo';
import useGetChainStakingMetadata from 'hooks/screen/Staking/useGetChainStakingMetadata';
import { PlusCircle } from 'phosphor-react-native';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { isAccountAll } from 'utils/accountAll';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { BN_TEN } from 'utils/number';
import { NetworkDetailModal } from 'screens/Transaction/Stake/NetworkDetailModal';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { StakeProps } from 'routes/transaction/transactionAction';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { accountFilterFunc } from 'screens/Transaction/helper/base';
import useFetchChainState from 'hooks/screen/useFetchChainState';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { BN, BN_ZERO } from '@polkadot/util';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { ChainStatus } from 'hooks/chain/useChainChecker';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { useWatch } from 'react-hook-form';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { FormItem } from 'components/common/FormItem';
import { InstructionModal } from 'screens/Home/Staking/InstructionModal';
import { mmkvStore } from 'utils/storage';
import { getInputValuesFromString } from 'components/Input/InputAmountV2';

interface StakeFormValues extends TransactionFormValues {
  stakingType: StakingType;
  pool: string;
  validator: string;
}

// mmkvStore.set('shown-vara-instruction', false)
export const Stake = ({
  route: {
    params: { chain: stakingChain = ALL_KEY, type: _stakingType = ALL_KEY },
  },
}: StakeProps) => {
  const shownVaraInstruction = mmkvStore.getBoolean('shown-vara-instruction') ?? false;
  const theme = useSubWalletTheme().swThemes;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { nominationPoolInfoMap, validatorInfoMap } = useSelector((state: RootState) => state.bonding);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);
  const [loading, setLoading] = useState(false);
  const [poolLoading, setPoolLoading] = useState(false);
  const [detailNetworkModalVisible, setDetailNetworkModalVisible] = useState(false);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [validatorLoading, setValidatorLoading] = useState(false);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const isEthAdr = isEthereumAddress(currentAccount?.address);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const accountSelectorRef = useRef<ModalRef>();
  const tokenSelectorRef = useRef<ModalRef>();

  const defaultStakingType: StakingType = useMemo(() => {
    if (isEthAdr) {
      return StakingType.NOMINATED;
    }

    switch (_stakingType) {
      case StakingType.POOLED:
        return StakingType.POOLED;
      case StakingType.NOMINATED:
        return StakingType.NOMINATED;
      default:
        return StakingType.POOLED;
    }
  }, [_stakingType, isEthAdr]);

  const {
    title,
    form: {
      control,
      getValues,
      setValue,
      formState: { errors },
    },
    onChangeFromValue: setFrom,
    onChangeAssetValue: setAsset,
    onTransactionDone: onDone,
    transactionDoneInfo,
    connectingChainStatus,
  } = useTransaction<StakeFormValues>('stake', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      stakingType: defaultStakingType,
      pool: '',
      validator: '',
    },
  });

  const {
    asset,
    pool: currentPool,
    chain,
    from,
    validator: currentValidator,
    stakingType: currentStakingType,
    value: currentValue,
  } = {
    ...useWatch<StakeFormValues>({ control }),
    ...getValues(),
  };

  const chainState = useFetchChainState(chain);
  const chainStakingMetadata = useGetChainStakingMetadata(chain);
  const nominatorMetadataList = useGetNominatorInfo(chain, currentStakingType as StakingType, from);
  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
  const nominatorMetadata: NominatorMetadata | undefined = useMemo(
    () => nominatorMetadataList[0],
    [nominatorMetadataList],
  );

  const accountSelectorList = useMemo(
    () => accounts.filter(accountFilterFunc(chainInfoMap, currentStakingType as StakingType, stakingChain)),
    [accounts, stakingChain, chainInfoMap, currentStakingType],
  );

  const [instructionModalVisible, setInstructionModalVisible] = useState(!shownVaraInstruction);
  const fromRef = useRef<string>(from);
  const tokenRef = useRef<string>(asset);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);
  const tokenList = useGetSupportedStakingTokens(currentStakingType as StakingType, from, stakingChain);
  const accountInfo = useGetAccountByAddress(from);
  const { nativeTokenBalance } = useGetBalance(chain, from);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const isAllAccount = isAccountAll(currentAccount?.address || '');
  const validatorSelectorRef = useRef<ValidatorSelectorRef>(null);
  const existentialDeposit = useMemo(() => {
    const assetInfo = assetRegistry[asset];

    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetRegistry, asset]);
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

  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    chain === 'vara_network' && currentStakingType === StakingType.POOLED ? handleDataForInsufficientAlert : undefined,
  );
  const getSelectedValidators = useCallback(
    (nominations: string[]) => {
      const validatorList = validatorInfoMap[chain];

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
    },
    [chain, validatorInfoMap],
  );

  const maxValue = useMemo(() => {
    const balance = new BigN(nativeTokenBalance.value);
    const ed = new BigN(existentialDeposit);

    if (ed.gte(balance)) {
      return '0';
    } else {
      return balance.minus(ed).toString();
    }
  }, [existentialDeposit, nativeTokenBalance.value]);

  const amountInputRules = useMemo(
    () => ({
      validate: (value: string): Promise<ValidateResult> => {
        const val = new BigN(value);
        if (currentStakingType === StakingType.POOLED) {
          if (val.lte(0)) {
            return Promise.resolve(i18n.formatString(i18n.errorMessage.unbondMustBeGreaterThanZero, 'Value') as string);
          }
        } else {
          if (!nominatorMetadata?.isBondedBefore || !isRelayChain) {
            if (val.lte(0)) {
              return Promise.resolve(
                i18n.formatString(i18n.errorMessage.unbondMustBeGreaterThanZero, 'Value') as string,
              );
            }
          }
        }

        if (val.gt(nativeTokenBalance.value)) {
          const maxString = new BigN(nativeTokenBalance.value).div(BN_TEN.pow(decimals)).toFixed(6);
          return Promise.resolve(
            i18n.formatString(i18n.errorMessage.unbondMustBeEqualOrLessThan, 'Value', maxString) as string,
          );
        }

        return Promise.resolve(undefined);
      },
    }),
    [currentStakingType, decimals, isRelayChain, nativeTokenBalance.value, nominatorMetadata?.isBondedBefore],
  );

  useEffect(() => {
    let unmount = false;

    if ((!!chain && !!from && chainState?.active) || forceFetchValidator) {
      fetchChainValidators(
        chain,
        currentStakingType || ALL_KEY,
        unmount,
        setPoolLoading,
        setValidatorLoading,
        setForceFetchValidator,
      );
    }

    return () => {
      unmount = true;
    };
  }, [from, _stakingType, chain, chainState?.active, currentStakingType, forceFetchValidator]);

  const selectedValidators = useMemo(() => {
    const validatorList = validatorInfoMap[chain];
    const nominations = parseNominations(currentValidator);

    if (!validatorList) {
      return [];
    }

    const result: ValidatorInfo[] = [];

    validatorList.forEach(validator => {
      if (nominations.includes(validator.address)) {
        // remember the format of the address
        result.push(validator);
      }
    });

    return result;
  }, [chain, currentValidator, validatorInfoMap]);

  const selectedPool: NominationPoolInfo | undefined = useMemo(() => {
    const nominationPoolList = nominationPoolInfoMap[chain];
    if (!currentPool || !nominationPoolList) {
      return undefined;
    }

    for (const pool of nominationPoolList) {
      if (String(pool.id) === currentPool) {
        return pool;
      }
    }

    return undefined;
  }, [nominationPoolInfoMap, chain, currentPool]);

  const getValidatorMinStake = useCallback((validatorInfos: ValidatorInfo[]) => {
    let minStake = BN_ZERO;

    validatorInfos.forEach(validatorInfo => {
      const bnMinBond = new BN(validatorInfo?.minBond);

      if (bnMinBond.gt(minStake)) {
        minStake = bnMinBond;
      }
    });

    return minStake.toString();
  }, []);

  const chainMinStake = useMemo(() => {
    return currentStakingType === StakingType.NOMINATED
      ? chainStakingMetadata?.minStake || '0'
      : chainStakingMetadata?.minJoinNominationPool || '0';
  }, [chainStakingMetadata?.minJoinNominationPool, chainStakingMetadata?.minStake, currentStakingType]);

  const minStake = useMemo(() => {
    if (currentStakingType === StakingType.NOMINATED) {
      const validatorInfos = getSelectedValidators(parseNominations(currentValidator));
      const validatorMinStake = getValidatorMinStake(validatorInfos);

      const nominatedMinStake = BN.max(new BN(validatorMinStake), new BN(chainStakingMetadata?.minStake || '0'));
      return nominatedMinStake.toString();
    }

    return chainStakingMetadata?.minJoinNominationPool || '0';
  }, [
    chainStakingMetadata?.minJoinNominationPool,
    chainStakingMetadata?.minStake,
    currentStakingType,
    currentValidator,
    getSelectedValidators,
    getValidatorMinStake,
  ]);

  const getMetaInfo = useCallback(() => {
    if (chainStakingMetadata) {
      return (
        <MetaInfo labelColorScheme={'gray'} spaceSize={'xs'} valueColorScheme={'light'}>
          {chainStakingMetadata.expectedReturn && (
            <MetaInfo.Number
              label={`${i18n.inputLabel.estimatedEarnings}:`}
              suffix={`% / ${i18n.common.year}`}
              value={chainStakingMetadata.expectedReturn}
            />
          )}

          {chainStakingMetadata.minStake && (
            <MetaInfo.Number
              decimals={decimals}
              label={`${i18n.inputLabel.minimumActive}:`}
              suffix={symbol}
              value={minStake}
              valueColorSchema={'success'}
            />
          )}
        </MetaInfo>
      );
    }

    return null;
  }, [chainStakingMetadata, decimals, minStake, symbol]);

  const onSubmit = () => {
    setLoading(true);
    let bondingPromise: Promise<SWTransactionResponse>;

    if (currentPool && currentStakingType === StakingType.POOLED) {
      bondingPromise = submitPoolBonding({
        amount: currentValue,
        chain: chain,
        nominatorMetadata: nominatorMetadata,
        selectedPool: selectedPool as NominationPoolInfo,
        address: from,
      });
    } else {
      bondingPromise = submitBonding({
        amount: currentValue,
        chain: chain,
        nominatorMetadata: nominatorMetadata,
        selectedValidators,
        address: from,
        type: StakingType.NOMINATED,
      });
    }

    setTimeout(() => {
      bondingPromise
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  };

  const onSelectToken = useCallback(
    (item: TokenItemType) => {
      console.log(item.originChain);
      setAsset(item.slug);
      validatorSelectorRef?.current?.resetValue();
      tokenRef.current = item.slug;
      tokenSelectorRef.current?.onCloseModal();
    },
    [setAsset],
  );

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, from);

  const isDisabledButton = useMemo(
    () =>
      !currentValue ||
      !isBalanceReady ||
      !!errors.value ||
      loading ||
      (currentStakingType === StakingType.POOLED ? !currentPool || poolLoading : !currentValidator || validatorLoading),
    [
      currentPool,
      currentStakingType,
      currentValidator,
      currentValue,
      errors.value,
      isBalanceReady,
      loading,
      poolLoading,
      validatorLoading,
    ],
  );

  useEffect(() => {
    const isTokenIncludeTokenList = !!tokenList.find(item => item.slug === asset);
    if (tokenList && tokenList.length) {
      if (!isTokenIncludeTokenList) {
        setAsset(tokenList[0].slug);
      }
    } else {
      setAsset('');
    }
  }, [asset, setAsset, tokenList]);

  const onChangeStakingType = useCallback(
    (type: StakingType) => {
      setValue('stakingType', type);

      if (isAllAccount && isEthereumAddress(from) && currentStakingType === StakingType.NOMINATED) {
        setFrom('');
        setAsset('');
      } else {
        setFrom(fromRef.current);
        setAsset(tokenRef.current);
      }
    },
    [currentStakingType, from, isAllAccount, setAsset, setFrom, setValue],
  );

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout
          disableMainHeader={loading}
          title={title}
          showRightHeaderButton
          disableLeftButton={loading}
          disableRightButton={!chainStakingMetadata || loading}
          onPressRightHeaderBtn={() => setDetailNetworkModalVisible(true)}>
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, paddingHorizontal: 16, marginTop: 16 }}
              keyboardShouldPersistTaps={'handled'}>
              {_stakingType === ALL_KEY && (
                <StakingTab
                  disabled={connectingChainStatus === ChainStatus.CONNECTING}
                  from={from}
                  selectedType={currentStakingType as StakingType}
                  onSelectType={onChangeStakingType}
                />
              )}

              {isAllAccount && (
                <AccountSelector
                  items={accountSelectorList}
                  selectedValueMap={{ [from]: true }}
                  accountSelectorRef={accountSelectorRef}
                  onSelectItem={item => {
                    setFrom(item.address);
                    fromRef.current = item.address;
                    accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                  }}
                  renderSelected={() => (
                    <AccountSelectField accountName={accountInfo?.name || ''} value={from} showIcon />
                  )}
                />
              )}

              {_stakingType === ALL_KEY && (
                <FreeBalance
                  label={`${i18n.inputLabel.availableBalance}:`}
                  address={from}
                  chain={chain}
                  onBalanceReady={setIsBalanceReady}
                />
              )}

              <TokenSelector
                items={tokenList}
                selectedValueMap={{ [asset]: true }}
                onSelectItem={onSelectToken}
                disabled={stakingChain !== ALL_KEY || !from || loading}
                defaultValue={asset}
                showAddBtn={false}
                acceptDefaultValue={true}
                tokenSelectorRef={tokenSelectorRef}
                renderSelected={() => <TokenSelectField logoKey={asset} subLogoKey={chain} value={symbol} showIcon />}
              />

              {_stakingType !== ALL_KEY && (
                <FreeBalance
                  label={`${i18n.inputLabel.availableBalance}:`}
                  address={from}
                  chain={chain}
                  onBalanceReady={setIsBalanceReady}
                />
              )}

              <FormItem
                style={{ marginBottom: theme.marginXS }}
                control={control}
                rules={amountInputRules}
                render={({ field: { value, ref, onChange } }) => (
                  <InputAmount
                    ref={ref}
                    value={value}
                    maxValue={maxValue}
                    onChangeValue={onChange}
                    decimals={decimals}
                    disable={loading}
                    showMaxButton={false}
                  />
                )}
                name={'value'}
              />

              {currentStakingType === StakingType.POOLED && (
                <PoolSelector
                  from={from}
                  chain={chain}
                  onSelectItem={(value: string) => setValue('pool', value)}
                  poolLoading={poolLoading}
                  selectedPool={selectedPool}
                  disabled={loading}
                  setForceFetchValidator={setForceFetchValidator}
                />
              )}

              {currentStakingType === StakingType.NOMINATED && (
                <ValidatorSelector
                  from={from}
                  chain={chain}
                  setForceFetchValidator={setForceFetchValidator}
                  validatorLoading={validatorLoading}
                  selectedValidator={currentValidator}
                  onSelectItem={(value: string) => setValue('validator', value)}
                  disabled={loading}
                  ref={validatorSelectorRef}
                />
              )}

              {chainStakingMetadata && (
                <>
                  <Divider style={{ marginTop: 10, marginBottom: 16 }} color={theme.colorBgDivider} />
                  {getMetaInfo()}
                </>
              )}
            </ScrollView>

            <View style={{ paddingHorizontal: 16, paddingTop: 16, ...MarginBottomForSubmitButton }}>
              <Button
                disabled={isDisabledButton}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={PlusCircle}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={isDisabledButton ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }
                onPress={onPreCheckReadOnly(onSubmit)}>
                {i18n.buttonTitles.stake}
              </Button>
            </View>

            {chainStakingMetadata && (
              <NetworkDetailModal
                modalVisible={detailNetworkModalVisible}
                chainStakingMetadata={chainStakingMetadata}
                stakingType={currentStakingType as StakingType}
                minimumActive={{ decimals, value: chainMinStake, symbol }}
                setVisible={setDetailNetworkModalVisible}
              />
            )}
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
      {chain === 'vara_network' && (
        <InstructionModal
          setDetailModalVisible={() => {
            setInstructionModalVisible(false);
            mmkvStore.set('shown-vara-instruction', true);
          }}
          modalVisible={instructionModalVisible}
          modalTitle="Stake in Vara nomination pools easily with SubWallet"
          onPressStake={() => {
            setInstructionModalVisible(false);
            mmkvStore.set('shown-vara-instruction', true);
          }}
        />
      )}
    </>
  );
};
