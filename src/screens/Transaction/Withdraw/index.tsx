import { getAstarWithdrawable } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/astar';
import {
  RequestYieldWithdrawal,
  UnstakingInfo,
  UnstakingStatus,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { ScrollView, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { useSelector } from 'react-redux';
import { accountFilterFunc } from 'screens/Transaction/helper/earning';
import { RootState } from 'stores/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { AmountData, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainInfo } from '@subwallet/chain-list/types';
import MetaInfo from 'components/MetaInfo';
import { isAccountAll } from 'utils/accountAll';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { WithdrawProps } from 'routes/transaction/transactionAction';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { useWatch } from 'react-hook-form';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import useYieldPositionDetail from '../../../hooks/earning/useYieldPositionDetail';
import { yieldSubmitStakingWithdrawal } from 'messaging/index';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import useGetConfirmationByScreen from 'hooks/static-content/useGetConfirmationByScreen';
import { GlobalModalContext } from 'providers/GlobalModalContext';

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allPositionInfos: YieldPositionInfo[],
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nomination = allPositionInfos.find(data => isSameAddress(data.address, account.address));

    return (
      (nomination
        ? nomination.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE).length > 0
        : false) && accountFilterFunc(chainInfoMap, poolType, poolChain)(account)
    );
  };
};

export const Withdraw = ({
  route: {
    params: { slug },
  },
}: WithdrawProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<StakingScreenNavigationProps>();

  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);

  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);

  const {
    title,
    onTransactionDone: onDone,
    onChangeFromValue: setFrom,
    onChangeChainValue: setChain,
    form: {
      control,
      formState: { errors },
    },
    transactionDoneInfo,
  } = useTransaction('withdraw', {
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const chainValue = useWatch<TransactionFormValues>({ name: 'chain', control });
  const fromValue = useWatch<TransactionFormValues>({ name: 'from', control });

  const { list: allPositionInfos } = useYieldPositionDetail(slug);
  const { list: yieldPositions } = useYieldPositionDetail(slug, fromValue);
  const yieldPosition = yieldPositions[0];
  const type = yieldPosition.type;

  const accountInfo = useGetAccountByAddress(fromValue);
  const poolInfo = useMemo(() => poolInfoMap[slug], [poolInfoMap, slug]);
  const stakingChain = useMemo(() => poolInfo?.chain || '', [poolInfo?.chain]);

  const inputAsset = useGetChainAssetInfo(poolInfo?.metadata.inputAsset);
  const decimals = inputAsset?.decimals || 0;
  const symbol = inputAsset?.symbol || '';
  const { getCurrentConfirmation, renderConfirmationButtons } = useGetConfirmationByScreen('earning');
  const globalAppModalContext = useContext(GlobalModalContext);

  const currentConfirmations = useMemo(() => {
    if (slug) {
      return getCurrentConfirmation([slug]);
    } else {
      return undefined;
    }
  }, [getCurrentConfirmation, slug]);
  const accountSelectorRef = useRef<ModalRef>();
  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        chainName: chainInfoMap[chainValue]?.name || '',
        symbol: estimateFee.symbol,
      };
    },
    [chainInfoMap, chainValue],
  );
  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    handleDataForInsufficientAlert,
  );

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allPositionInfos, poolInfo?.type));
  }, [accounts, allPositionInfos, chainInfoMap, poolInfo?.type]);

  const unstakingInfo = useMemo((): UnstakingInfo | undefined => {
    if (fromValue && !isAccountAll(fromValue) && !!yieldPosition) {
      if (_STAKING_CHAIN_GROUP.astar.includes(yieldPosition.chain)) {
        return getAstarWithdrawable(yieldPosition);
      }
      return yieldPosition.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE)[0];
    }

    return undefined;
  }, [fromValue, yieldPosition]);

  const onPreCheck = usePreCheckAction(fromValue);

  const onSubmit = useCallback(() => {
    setLoading(true);

    if (!unstakingInfo) {
      setLoading(false);

      return;
    }

    const params: RequestYieldWithdrawal = {
      address: fromValue,
      slug: slug,
      unstakingInfo: unstakingInfo,
    };

    setTimeout(() => {
      yieldSubmitStakingWithdrawal(params)
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [unstakingInfo, fromValue, slug, onSuccess, onError]);

  const onPressSubmit = useCallback(() => {
    if (currentConfirmations && currentConfirmations.length) {
      globalAppModalContext.setGlobalModal({
        visible: true,
        title: currentConfirmations[0].name,
        message: currentConfirmations[0].content,
        type: 'confirmation',
        externalButtons: renderConfirmationButtons(globalAppModalContext.hideGlobalModal, () => {
          onSubmit();
          globalAppModalContext.hideGlobalModal();
        }),
      });
    } else {
      onSubmit();
    }
  }, [currentConfirmations, globalAppModalContext, onSubmit, renderConfirmationButtons]);

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (fromValue || !errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [errors.from, fromValue]);

  useEffect(() => {
    setChain(stakingChain || '');
  }, [setChain, stakingChain]);

  useEffect(() => {
    if (!fromValue && accountList.length === 1) {
      setFrom(accountList[0].address);
    }
  }, [accountList, fromValue, setFrom]);

  const exType = useMemo(() => {
    if (type === YieldPoolType.LIQUID_STAKING) {
      if (chainValue === 'moonbeam') {
        return ExtrinsicType.EVM_EXECUTE;
      } else {
        return ExtrinsicType.UNKNOWN;
      }
    }

    if (type === YieldPoolType.LENDING) {
      return ExtrinsicType.UNKNOWN;
    }

    return ExtrinsicType.STAKING_WITHDRAW;
  }, [type, chainValue]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
              <AccountSelector
                items={accountList}
                selectedValueMap={{ [fromValue]: true }}
                renderSelected={() => (
                  <AccountSelectField accountName={accountInfo?.name || ''} value={fromValue} showIcon />
                )}
                onSelectItem={item => {
                  setFrom(item.address);
                  accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                }}
                accountSelectorRef={accountSelectorRef}
                disabled={loading || !isAllAccount}
              />

              <GeneralFreeBalance address={fromValue} chain={chainValue} onBalanceReady={setIsBalanceReady} />

              <MetaInfo hasBackgroundWrapper>
                <MetaInfo.Chain chain={chainValue} label={i18n.inputLabel.network} />

                {unstakingInfo && (
                  <MetaInfo.Number
                    decimals={decimals}
                    label={i18n.inputLabel.amount}
                    suffix={symbol}
                    value={unstakingInfo.claimable}
                  />
                )}
              </MetaInfo>
            </ScrollView>

            <View
              style={{ paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', ...MarginBottomForSubmitButton }}>
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
                disabled={!fromValue || isDisabled || loading || !isBalanceReady}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={ArrowCircleRight}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={
                      !fromValue || isDisabled || loading || !isBalanceReady ? theme.colorTextLight5 : theme.colorWhite
                    }
                  />
                }
                onPress={onPreCheck(onPressSubmit, exType)}>
                {i18n.buttonTitles.continue}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.STAKING_WITHDRAW} />
      )}
    </>
  );
};
