import React, { useMemo, useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { TouchableOpacity, View } from 'react-native';
import { StakingTab } from 'components/common/StakingTab';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { TokenSelector } from 'components/Modal/common/TokenSelector';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import useGetSupportedStakingTokens from 'hooks/screen/Staking/useGetSupportedStakingTokens';
import {
  RequestBondingSubmit,
  RequestStakePoolingBonding,
  StakingType
} from '@subwallet/extension-base/background/KoniTypes';
import { StakeScreenNavigationProps } from 'routes/staking/stakingScreen';
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
import { Button } from 'components/design-system-ui';
import { submitPoolBonding } from '../../../messaging';

const stakeFormConfig = {
  stakingType: {
    name: 'Type',
    value: 'pooled',
  },
};

const a: RequestStakePoolingBonding = {
  address: '5HbcGs2QXVAc6Q6eoTzLYNAJWpN17AkCFRLnWDaHCiGYXvNc',
  amount: '905106125',
  chain: 'kusama',
  nominatorMetadata: {
    activeStake: '100100000000',
    address: '5HbcGs2QXVAc6Q6eoTzLYNAJWpN17AkCFRLnWDaHCiGYXvNc',
    chain: 'kusama',
    nominations: [
      {
        activeStake: '100100000000',
        chain: 'kusama',
        hasUnstaking: false,
        validatorAddress: '1',
        validatorIdentity:
          '0x68747470733a2f2f616d666f72632e636f6d207c20f09fa49d204c6f7720636f6d6d697373696f6e207c20e29881efb88f204d756c7469636c6f7564207c20f09f9a8020486967682072657761726473',
      },
    ],
    // status: 'EARNING_REWARD',
    type: StakingType.POOLED,
    unstakings: [],
  },
  selectedPool: {
    address: 'F3opxRbN5ZavB4LTn2FZim9tPCHyvapGAAZzdDp5pzfg3sy',
    bondedAmount: '3110652143970825',
    id: 1,
    memberCounter: 67,
    name: '0x68747470733a2f2f616d666f72632e636f6d207c20f09fa49d204c6f7720636f6d6d697373696f6e207c20e29881efb88f204d756c7469636c6f7564207c20f09f9a8020486967682072657761726473',
    roles: {
      depositor: 'E8a4iJyDLd2ZysHt4bWfg5VG3RwNfHqSZtkyt5SPNJpmYoq',
      nominator: 'Fc51t7QUm5sPhx6gJdxzVBjznqqoRyp2gHTJSnbRBcLExAo',
      root: 'E8a4iJyDLd2ZysHt4bWfg5VG3RwNfHqSZtkyt5SPNJpmYoq',
      bouncer: 'GF5PrXFcW7YDKKKfgJsMJE9xKF1UgE64kVSWYxNNo7waZYe',
    },
    state: 'Open',
  },
};

export const Stake = ({
  route: {
    params: { chain: stakingChain, type: _stakingType },
  },
}: StakeScreenNavigationProps) => {
  const [tokenSelectModalVisible, setTokenSelectModalVisible] = useState<boolean>(false);
  const [accountSelectModalVisible, setAccountSelectModalVisible] = useState<boolean>(false);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { title, formState, onChangeValue, onChangeFromValue, onChangeAssetValue, onChangeAmountValue } =
    useTransaction('stake', stakeFormConfig);
  const tokenList = useGetSupportedStakingTokens(
    formState.data.stakingType as StakingType,
    formState.data.from,
    stakingChain,
  );
  const accountInfo = useGetAccountByAddress(formState.data.from);
  const { nativeTokenBalance } = useGetBalance(formState.data.chain, formState.data.from);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(formState.data.chain);

  const existentialDeposit = useMemo(() => {
    const assetInfo = assetRegistry[formState.data.asset];

    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetRegistry, formState.data.asset]);

  const maxValue = useMemo(() => {
    const balance = new BigN(nativeTokenBalance.value);
    const ed = new BigN(existentialDeposit);

    if (ed.gte(balance)) {
      return '0';
    } else {
      return balance.minus(ed).toString();
    }
  }, [existentialDeposit, nativeTokenBalance.value]);

  console.log('value', formState.data);

  return (
    <ScreenContainer backgroundColor={'#0C0C0C'}>
      <>
        <Header />
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <StakingTab
            selectedType={formState.data.stakingType as StakingType}
            onSelectType={type => onChangeValue('stakingType')(type)}
          />

          <TouchableOpacity onPress={() => setAccountSelectModalVisible(true)}>
            <AccountSelectField accountName={accountInfo?.name || ''} value={formState.data.from} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setTokenSelectModalVisible(true);
            }}>
            <TokenSelectField
              logoKey={symbol.toLowerCase()}
              subLogoKey={formState.data.chain}
              value={symbol}
              showIcon
            />
          </TouchableOpacity>

          <FreeBalance label={'Available balance:'} address={formState.data.from} chain={formState.data.chain} />

          <InputAmount
            value={formState.data.asset}
            maxValue={maxValue}
            onChangeValue={onChangeAmountValue}
            decimals={decimals}
          />

          <Button
            onPress={() => {
              submitPoolBonding(a)
                .then(() => console.log(123))
                .catch(() => {
                  console.log(456);
                });
            }}>
            Test
          </Button>
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
            items={tokenList}
            onCancel={() => setTokenSelectModalVisible(false)}
            acceptDefaultValue
            onSelectItem={item => {
              onChangeAssetValue(item.slug);
              setTokenSelectModalVisible(false);
            }}
          />
        </View>
      </>
    </ScreenContainer>
  );
};
