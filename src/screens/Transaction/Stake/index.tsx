import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StakingTab } from 'components/common/StakingTab';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { TokenItemType, TokenSelector } from 'components/Modal/common/TokenSelector';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import useGetSupportedStakingTokens from 'hooks/screen/Staking/useGetSupportedStakingTokens';
import {
  NominationPoolInfo,
  NominatorMetadata,
  StakingType,
  ValidatorInfo,
} from '@subwallet/extension-base/background/KoniTypes';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
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
import { ValidatorSelector } from 'components/Modal/common/ValidatorSelector';
import { isEthereumAddress } from '@polkadot/util-crypto';
import reformatAddress from 'utils/index';
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

export const Stake = ({
  route: {
    params: { chain: stakingChain = ALL_KEY, type: _stakingType = ALL_KEY },
  },
}: StakeProps) => {
  const theme = useSubWalletTheme().swThemes;
  const { nominationPoolInfoMap, validatorInfoMap } = useSelector((state: RootState) => state.bonding);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);
  const [tokenSelectModalVisible, setTokenSelectModalVisible] = useState<boolean>(false);
  const [accountSelectModalVisible, setAccountSelectModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [poolLoading, setPoolLoading] = useState(false);
  const [detailNetworkModalVisible, setDetailNetworkModalVisible] = useState(false);
  const [validatorLoading, setValidatorLoading] = useState(false);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const isEthAdr = isEthereumAddress(currentAccount?.address);
  const [isBalanceReady, setIsBalanceReady] = useState(true);

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

  const stakeFormConfig = useMemo(
    () => ({
      stakingType: {
        name: 'Type',
        value: defaultStakingType,
      },
      pool: {
        name: 'Pool',
        value: '',
      },

      validator: {
        name: 'Validator',
        value: '',
      },
    }),
    [defaultStakingType],
  );

  const {
    title,
    formState,
    onChangeValue,
    onChangeFromValue,
    onChangeAssetValue,
    onChangeAmountValue,
    onDone,
    onUpdateErrors,
  } = useTransaction('stake', stakeFormConfig);

  const {
    asset,
    pool: currentPool,
    chain,
    from,
    validator: currentValidator,
    stakingType: currentStakingType,
    value: currentValue,
  } = formState.data;

  const chainStakingMetadata = useGetChainStakingMetadata(chain);
  const nominatorMetadataList = useGetNominatorInfo(chain, currentStakingType as StakingType, from);
  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
  const nominatorMetadata: NominatorMetadata | undefined = useMemo(
    () => nominatorMetadataList[0],
    [nominatorMetadataList],
  );

  useEffect(() => {
    let unmount = false;

    // fetch validators when change chain
    // _stakingType is predefined form start
    if (!!chain && !!from) {
      fetchChainValidators(chain, _stakingType || ALL_KEY, unmount, setPoolLoading, setValidatorLoading);
    }

    return () => {
      unmount = true;
    };
  }, [from, _stakingType, chain]);

  const tokenList = useGetSupportedStakingTokens(currentStakingType as StakingType, from, stakingChain);
  const accountInfo = useGetAccountByAddress(from);
  const { nativeTokenBalance } = useGetBalance(chain, from);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);
  const isAllAccount = isAccountAll(currentAccount?.address || '');
  const existentialDeposit = useMemo(() => {
    const assetInfo = assetRegistry[asset];

    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetRegistry, asset]);

  const maxValue = useMemo(() => {
    const balance = new BigN(nativeTokenBalance.value);
    const ed = new BigN(existentialDeposit);

    if (ed.gte(balance)) {
      return '0';
    } else {
      return balance.minus(ed).toString();
    }
  }, [existentialDeposit, nativeTokenBalance.value]);

  const validateAmountInput = useCallback(
    (value: string) => {
      const val = new BigN(value);
      if (currentStakingType === StakingType.POOLED) {
        if (val.lte(0)) {
          onUpdateErrors('value')(['Value must be greater than 0']);
          return;
        }
      } else {
        if (!nominatorMetadata?.isBondedBefore || !isRelayChain) {
          if (val.lte(0)) {
            onUpdateErrors('value')(['Value must be greater than 0']);
            return;
          }
        }
      }

      if (val.gt(nativeTokenBalance.value)) {
        const maxString = new BigN(nativeTokenBalance.value).div(BN_TEN.pow(decimals)).toFixed(6);
        onUpdateErrors('value')([`Value must be equal or less than ${maxString}`]);
        return;
      }

      onUpdateErrors('value')([]);
    },
    [
      currentStakingType,
      decimals,
      isRelayChain,
      nativeTokenBalance.value,
      nominatorMetadata?.isBondedBefore,
      onUpdateErrors,
    ],
  );

  const _onChangeAmount = useCallback(
    (text: string) => {
      onChangeAmountValue(text);
      validateAmountInput(text);
    },
    [onChangeAmountValue, validateAmountInput],
  );

  const selectedValidators = useMemo(() => {
    const validatorList = validatorInfoMap[chain];
    const nominations = parseNominations(currentValidator);

    if (!validatorList) {
      return [];
    }

    const result: ValidatorInfo[] = [];

    validatorList.forEach(validator => {
      if (nominations.includes(reformatAddress(validator.address, 42))) {
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

  const minStake = useMemo(
    () =>
      currentStakingType === StakingType.POOLED
        ? chainStakingMetadata?.minPoolBonding || '0'
        : chainStakingMetadata?.minStake || '0',
    [chainStakingMetadata?.minPoolBonding, chainStakingMetadata?.minStake, currentStakingType],
  );

  const getMetaInfo = useCallback(() => {
    if (chainStakingMetadata) {
      return (
        <MetaInfo labelColorScheme={'gray'} spaceSize={'xs'} valueColorScheme={'light'}>
          {chainStakingMetadata.expectedReturn && (
            <MetaInfo.Number
              label={'Estimated earnings:'}
              suffix={'% / year'}
              value={chainStakingMetadata.expectedReturn}
            />
          )}

          {chainStakingMetadata.minStake && (
            <MetaInfo.Number
              decimals={decimals}
              label={'Minimum active:'}
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
        amount: '0',
        chain: chain,
        nominatorMetadata: nominatorMetadata,
        selectedPool: selectedPool as NominationPoolInfo,
        address: from,
      });
    } else {
      bondingPromise = submitBonding({
        amount: '0',
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
      onChangeAssetValue(item.slug);
      setTokenSelectModalVisible(false);
    },
    [onChangeAssetValue],
  );

  const onPreCheckReadOnly = usePreCheckReadOnly(from);

  return (
    <TransactionLayout
      title={title}
      showRightHeaderButton
      onPressRightHeaderBtn={() => setDetailNetworkModalVisible(true)}>
      <>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          {_stakingType === ALL_KEY && (
            <StakingTab
              selectedType={currentStakingType as StakingType}
              onSelectType={type => onChangeValue('stakingType')(type)}
            />
          )}

          {isAllAccount && (
            <TouchableOpacity onPress={() => setAccountSelectModalVisible(true)}>
              <AccountSelectField accountName={accountInfo?.name || ''} value={from} showIcon />
            </TouchableOpacity>
          )}

          {_stakingType === ALL_KEY && (
            <FreeBalance label={'Available balance:'} address={from} chain={chain} onBalanceReady={setIsBalanceReady} />
          )}

          <TouchableOpacity
            disabled={stakingChain !== ALL_KEY || !from}
            onPress={() => {
              setTokenSelectModalVisible(true);
            }}>
            <TokenSelectField
              disabled={stakingChain !== ALL_KEY || !from}
              logoKey={symbol.toLowerCase()}
              subLogoKey={chain}
              value={symbol}
              showIcon
            />
          </TouchableOpacity>

          {_stakingType !== ALL_KEY && (
            <FreeBalance label={'Available balance:'} address={from} chain={chain} onBalanceReady={setIsBalanceReady} />
          )}

          <InputAmount
            value={currentValue}
            maxValue={maxValue}
            onChangeValue={_onChangeAmount}
            decimals={decimals}
            errorMessages={formState.errors.value}
          />

          {currentStakingType === StakingType.POOLED && (
            <PoolSelector
              from={from}
              chain={chain}
              onSelectItem={onChangeValue('pool')}
              poolLoading={poolLoading}
              selectedPool={selectedPool}
            />
          )}

          {currentStakingType === StakingType.NOMINATED && (
            <ValidatorSelector
              from={from}
              chain={chain}
              validatorLoading={validatorLoading}
              selectedValidator={currentValidator}
              onSelectItem={onChangeValue('validator')}
              disabled={loading}
            />
          )}

          {chainStakingMetadata && (
            <>
              <Divider style={{ marginTop: 10, marginBottom: 16 }} color={theme.colorBgDivider} />
              {getMetaInfo()}
            </>
          )}

          <AccountSelector
            modalVisible={accountSelectModalVisible}
            onSelectItem={item => {
              onChangeFromValue(item.address);
              setAccountSelectModalVisible(false);
            }}
            items={accounts}
            onCancel={() => setAccountSelectModalVisible(false)}
          />

          <TokenSelector
            modalVisible={tokenSelectModalVisible}
            defaultValue={asset}
            items={tokenList}
            acceptDefaultValue
            onCancel={() => setTokenSelectModalVisible(false)}
            onSelectItem={onSelectToken}
          />
        </ScrollView>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, ...MarginBottomForSubmitButton }}>
          <Button
            disabled={!formState.isValidated.value || !formState.data.value || !isBalanceReady || loading}
            loading={loading}
            icon={
              <Icon
                phosphorIcon={PlusCircle}
                weight={'fill'}
                size={'lg'}
                iconColor={
                  !formState.isValidated.value || !formState.data.value ? theme.colorTextLight5 : theme.colorWhite
                }
              />
            }
            onPress={onPreCheckReadOnly(onSubmit)}>
            Stake
          </Button>
        </View>

        {chainStakingMetadata && (
          <NetworkDetailModal
            modalVisible={detailNetworkModalVisible}
            chainStakingMetadata={chainStakingMetadata}
            stakingType={_stakingType as StakingType}
            minimumActive={{ decimals, value: minStake, symbol }}
            onCloseModal={() => setDetailNetworkModalVisible(false)}
          />
        )}
      </>
    </TransactionLayout>
  );
};
