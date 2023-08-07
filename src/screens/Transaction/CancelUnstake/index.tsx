import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { NominatorMetadata, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { useNavigation } from '@react-navigation/native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { submitStakeCancelWithdrawal } from 'messaging/index';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { ScrollView, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
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
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { CancelUnstakeProps } from 'routes/transaction/transactionAction';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';

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
}: CancelUnstakeProps) => {
  const stakingType = _stakingType as StakingType;
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);

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
  const accountSelectorRef = useRef<ModalRef>();

  useEffect(() => {
    onChangeValue('chain')(stakingChain || '');
  }, [onChangeValue, stakingChain]);

  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allNominatorInfo, stakingType, stakingChain));
  }, [accounts, allNominatorInfo, chainInfoMap, stakingChain, stakingType]);

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, from);

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
    <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
      <>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} keyboardShouldPersistTaps={'handled'}>
          {isAllAccount && (
            <AccountSelector
              items={accountList}
              selectedValueMap={{ [from]: true }}
              onSelectItem={item => {
                onChangeFromValue(item.address);
                accountSelectorRef && accountSelectorRef.current?.onCloseModal();
              }}
              renderSelected={() => <AccountSelectField accountName={accountInfo?.name || ''} value={from} showIcon />}
              accountSelectorRef={accountSelectorRef}
              disabled={loading}
            />
          )}

          <FreeBalance
            label={`${i18n.inputLabel.availableBalance}:`}
            address={from}
            chain={chain}
            onBalanceReady={setIsBalanceReady}
          />

          <CancelUnstakeSelector
            chain={chain}
            nominators={from ? nominatorMetadata?.unstakings || [] : []}
            selectedValue={unstakeIndex}
            onSelectItem={onChangeValue('unstakeIndex')}
            disabled={loading}
          />
        </ScrollView>

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
            {i18n.buttonTitles.cancel}
          </Button>
          <Button
            style={{ flex: 1, marginLeft: 4 }}
            disabled={!isBalanceReady || loading}
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
            {i18n.buttonTitles.continue}
          </Button>
        </View>
      </>
    </TransactionLayout>
  );
};
