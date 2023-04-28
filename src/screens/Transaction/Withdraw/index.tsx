import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import {
  NominatorMetadata,
  RequestStakeWithdrawal,
  StakingType,
  UnstakingInfo,
  UnstakingStatus,
} from '@subwallet/extension-base/background/KoniTypes';
import { accountFilterFunc } from 'screens/Transaction/helper/staking';
import { _ChainInfo } from '@subwallet/chain-list/types';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import MetaInfo from 'components/MetaInfo';
import { isAccountAll } from 'utils/accountAll';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import usePreCheckReadOnly from 'hooks/usePreCheckReadOnly';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { isActionFromValidator } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { submitStakeWithdrawal } from 'messaging/index';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { WithdrawProps } from 'routes/transaction/transactionAction';
import {MarginBottomForSubmitButton} from "styles/sharedStyles";

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allNominatorInfo: NominatorMetadata[],
  stakingType: StakingType,
  stakingChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nomination = allNominatorInfo.find(data => isSameAddress(data.address, account.address));

    return (
      (nomination
        ? nomination.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE).length > 0
        : false) && accountFilterFunc(chainInfoMap, stakingType, stakingChain)(account)
    );
  };
};

export const Withdraw = ({
  route: {
    params: { chain: stakingChain, type: _stakingType },
  },
}: WithdrawProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const stakingType = _stakingType as StakingType;
  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [accountSelectModalVisible, setAccountSelectModalVisible] = useState<boolean>(false);
  const withDrawFormConfig = {};
  const { title, formState, onDone, onChangeFromValue, onChangeValue } = useTransaction('withdraw', withDrawFormConfig);
  const { from, chain } = formState.data;
  const allNominatorInfo = useGetNominatorInfo(stakingChain, stakingType);
  const nominatorInfo = useGetNominatorInfo(stakingChain, stakingType, from);
  const nominatorMetadata = nominatorInfo[0];
  const accountInfo = useGetAccountByAddress(from);
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (from || !formState.errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [formState.errors.from, from]);

  useEffect(() => {
    onChangeValue('chain')(stakingChain || '');
  }, [onChangeValue, stakingChain]);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allNominatorInfo, stakingType));
  }, [accounts, allNominatorInfo, chainInfoMap, stakingType]);

  const unstakingInfo = useMemo((): UnstakingInfo | undefined => {
    if (from && !isAccountAll(from)) {
      return nominatorMetadata.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE)[0];
    }

    return undefined;
  }, [from, nominatorMetadata]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const onPreCheckReadOnly = usePreCheckReadOnly(from);

  const onSubmit = useCallback(() => {
    setLoading(true);

    if (!unstakingInfo) {
      setLoading(false);

      return;
    }

    const params: RequestStakeWithdrawal = {
      unstakingInfo: unstakingInfo,
      chain: nominatorMetadata.chain,
      nominatorMetadata,
    };

    if (isActionFromValidator(stakingType, chain)) {
      params.validatorAddress = unstakingInfo.validatorAddress;
    }

    setTimeout(() => {
      submitStakeWithdrawal(params)
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [chain, nominatorMetadata, onError, onSuccess, stakingType, unstakingInfo]);

  return (
    <TransactionLayout title={title}>
      <>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          {isAllAccount && (
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

          <MetaInfo hasBackgroundWrapper>
            <MetaInfo.Chain chain={chain} label={'Network'} />

            {unstakingInfo && (
              <MetaInfo.Number
                decimals={decimals}
                label={'Withdraw amount'}
                suffix={symbol}
                value={unstakingInfo.claimable}
              />
            )}
          </MetaInfo>

          <AccountSelector
            modalVisible={accountSelectModalVisible}
            onSelectItem={item => {
              onChangeFromValue(item.address);
              setAccountSelectModalVisible(false);
            }}
            items={accountList}
            onCancel={() => setAccountSelectModalVisible(false)}
          />
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', ...MarginBottomForSubmitButton }}>
          <Button
            disabled={loading}
            style={{ flex: 1, marginRight: 4 }}
            type={'secondary'}
            onPress={() => navigation.goBack()}
            icon={
              <Icon
                phosphorIcon={XCircle}
                weight={'fill'}
                size={'lg'}
                iconColor={loading ? theme.colorTextLight5 : theme.colorWhite}
              />
            }>
            Cancel
          </Button>
          <Button
            style={{ flex: 1, marginLeft: 4 }}
            disabled={isDisabled}
            loading={loading}
            icon={
              <Icon
                phosphorIcon={ArrowCircleRight}
                weight={'fill'}
                size={'lg'}
                iconColor={isDisabled ? theme.colorTextLight5 : theme.colorWhite}
              />
            }
            onPress={onPreCheckReadOnly(onSubmit)}>
            Continue
          </Button>
        </View>
      </>
    </TransactionLayout>
  );
};
