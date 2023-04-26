import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CancelUnstakeScreenNavigationProps, StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { NominatorMetadata, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { useNavigation } from '@react-navigation/native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { submitStakeCancelWithdrawal } from '../../../messaging';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { ScreenContainer } from 'components/ScreenContainer';
import TransactionHeader from 'screens/Transaction/parts/TransactionHeader';
import { TouchableOpacity, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { accountFilterFunc } from 'screens/Transaction/helper/staking';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { CancelUnstakeSelector } from 'components/Modal/common/CancelUnstakeSelector';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allNominatorInfo: NominatorMetadata[],
  stakingType: StakingType,
  stakingChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nomination = allNominatorInfo.find(data => isSameAddress(data.address, account.address));

    return (
      (nomination ? nomination.unstakings.length > 0 : false) &&
      accountFilterFunc(chainInfoMap, stakingType, stakingChain)(account)
    );
  };
};

export const CancelUnstake = ({
  route: {
    params: { chain: stakingChain, type: _stakingType },
  },
}: CancelUnstakeScreenNavigationProps) => {
  const stakingType = _stakingType as StakingType;
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const [accountSelectModalVisible, setAccountSelectModalVisible] = useState<boolean>(false);

  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const cancelUnstakeFormConfig = {
    unstakeIndex: {
      name: 'Unstake index',
      value: '',
    },
  };

  const { title, formState, onDone, onChangeValue, onChangeFromValue } = useTransaction(
    'cancel-unstake',
    cancelUnstakeFormConfig,
  );
  const { from, chain, unstakeIndex } = formState.data;
  const accountInfo = useGetAccountByAddress(from);
  const allNominatorInfo = useGetNominatorInfo(stakingChain, stakingType);
  const nominatorInfo = useGetNominatorInfo(stakingChain, stakingType, from);
  const nominatorMetadata = nominatorInfo[0];

  useEffect(() => {
    onChangeValue('chain')(stakingChain || '');
  }, [onChangeValue, stakingChain]);

  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allNominatorInfo, stakingType, stakingChain));
  }, [accounts, allNominatorInfo, chainInfoMap, stakingChain, stakingType]);

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);

  const onPreCheckReadOnly = usePreCheckReadOnly(from);

  const onSubmit = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      submitStakeCancelWithdrawal({
        address: from,
        chain: chain,
        selectedUnstaking: nominatorMetadata.unstakings[parseInt(unstakeIndex)],
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [chain, from, nominatorMetadata.unstakings, onError, onSuccess, unstakeIndex]);

  return (
    <ScreenContainer backgroundColor={'#0C0C0C'}>
      <>
        <TransactionHeader title={title} navigation={navigation} />

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
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

          <FreeBalance label={'Available balance:'} address={from} chain={chain} onBalanceReady={setIsBalanceReady} />

          <CancelUnstakeSelector
            chain={chain}
            nominators={from ? nominatorMetadata?.unstakings || [] : []}
            selectedValue={unstakeIndex}
            onSelectItem={onChangeValue('unstakeIndex')}
          />

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

        <View style={{ padding: 16, flexDirection: 'row' }}>
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
            disabled={!isBalanceReady}
            loading={loading}
            icon={
              <Icon
                phosphorIcon={ArrowCircleRight}
                weight={'fill'}
                size={'lg'}
                iconColor={!isBalanceReady ? theme.colorTextLight5 : theme.colorWhite}
              />
            }
            onPress={onPreCheckReadOnly(onSubmit)}>
            Continue
          </Button>
        </View>
      </>
    </ScreenContainer>
  );
};
