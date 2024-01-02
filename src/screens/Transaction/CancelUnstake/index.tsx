import { YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { useYieldPositionDetail } from 'hooks/earning';
import { yieldSubmitStakingCancelWithdrawal } from 'messaging/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { useNavigation } from '@react-navigation/native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { accountFilterFunc } from 'screens/Transaction/helper/earning';
import { RootState } from 'stores/index';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { ScrollView, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { CancelUnstakeSelector } from 'components/Modal/common/CancelUnstakeSelector';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { CancelUnstakeProps } from 'routes/transaction/transactionAction';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useWatch } from 'react-hook-form';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';

interface CancelUnstakeFormValues extends TransactionFormValues {
  unstakeIndex: string;
}

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allNominatorInfo: YieldPositionInfo[],
  stakingType: YieldPoolType,
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
    params: { slug },
  },
}: CancelUnstakeProps) => {
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const theme = useSubWalletTheme().swThemes;

  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);

  const poolInfo = poolInfoMap[slug];
  const poolType = poolInfo.type;
  const poolChain = poolInfo.chain;

  const [isTransactionDone, setTransactionDone] = useState(false);

  const {
    title,
    onTransactionDone: onDone,
    onChangeFromValue: setFrom,
    onChangeChainValue: setChain,
    transactionDoneInfo,
    form: { control, getValues, setValue },
  } = useTransaction<CancelUnstakeFormValues>('cancel-unstake', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      unstakeIndex: '',
    },
  });

  const {
    chain: chainValue,
    from: fromValue,
    unstakeIndex,
  } = {
    ...useWatch<CancelUnstakeFormValues>({ control }),
    ...getValues(),
  };

  const accountInfo = useGetAccountByAddress(fromValue);
  const { list: allPositionInfos } = useYieldPositionDetail(slug);
  const { compound: positionInfo } = useYieldPositionDetail(slug, fromValue);
  const accountSelectorRef = useRef<ModalRef>();

  useEffect(() => {
    setChain(poolChain || '');
  }, [setChain, poolChain]);

  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allPositionInfos, poolType, poolChain));
  }, [accounts, allPositionInfos, chainInfoMap, poolChain, poolType]);

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setTransactionDone);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, fromValue);

  const onSubmit = useCallback(() => {
    if (!positionInfo) {
      return;
    }

    setLoading(true);

    const selectedUnstaking = positionInfo.unstakings[parseInt(unstakeIndex)];

    setTimeout(() => {
      yieldSubmitStakingCancelWithdrawal({
        address: fromValue,
        slug: slug,
        selectedUnstaking,
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [positionInfo, fromValue, slug, unstakeIndex, onSuccess, onError]);

  const onChangeUnstakeIndex = (value: string) => {
    setValue('unstakeIndex', value);
  };

  useEffect(() => {
    if (!fromValue && accountList.length === 1) {
      setFrom(accountList[0].address);
    }
  }, [accountList, fromValue, setFrom]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
              keyboardShouldPersistTaps={'handled'}>
              <AccountSelector
                items={accountList}
                selectedValueMap={{ [fromValue]: true }}
                onSelectItem={item => {
                  setFrom(item.address);
                  accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                }}
                renderSelected={() => (
                  <AccountSelectField accountName={accountInfo?.name || ''} value={fromValue} showIcon />
                )}
                accountSelectorRef={accountSelectorRef}
                disabled={loading || !isAllAccount}
              />

              <GeneralFreeBalance address={fromValue} chain={chainValue} onBalanceReady={setIsBalanceReady} />

              <CancelUnstakeSelector
                chain={chainValue}
                nominators={fromValue ? positionInfo?.unstakings || [] : []}
                selectedValue={unstakeIndex}
                onSelectItem={onChangeUnstakeIndex}
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
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};
