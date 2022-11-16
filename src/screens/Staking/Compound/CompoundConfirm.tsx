import { formatBalance } from '@polkadot/util';
import { SiDef } from '@polkadot/util/types';
import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import { InputBalance } from 'components/Input/InputBalance';
import DelegationBriefInfo from 'components/Staking/DelegationBriefInfo';
import { SubmitButton } from 'components/SubmitButton';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { Warning } from 'components/Warning';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import moment from 'moment';
import React, { createRef, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import {
  ConfirmCompoundActionName,
  confirmCompoundReducer,
  DEFAULT_CONFIRM_COMPOUND_STATE,
} from 'reducers/staking/confirmCompound';
import { CompoundConfirmProps } from 'routes/staking/compoundAction';
import DelegationSelectModal from 'components/Modal/DelegationSelectModal';
import {
  centerStyle,
  ContainerHorizontalPadding,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
} from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import {
  checkTuringStakeCompounding,
  getStakeDelegationInfo,
  getTuringCancelStakeCompoundTxInfo,
  getTuringStakeCompoundTxInfo,
} from '../../../messaging';
import useGetAmountInfo from 'hooks/screen/Staking/useGetAmountInfo';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { WebRunnerContext } from 'providers/contexts';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const RowCenterStyle: StyleProp<ViewStyle> = {
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'row',
};

const IconContainerStyle: StyleProp<ViewStyle> = {
  ...RowCenterStyle,
  marginBottom: 16,
};

const WarningStyle: StyleProp<ViewStyle> = {
  marginBottom: 8,
};

const filterValidDelegations = (delegations: DelegationItem[]): DelegationItem[] => {
  return delegations.filter(item => parseFloat(item.amount) > 0);
};

const CompoundConfirm = ({ route: { params: compoundParams }, navigation }: CompoundConfirmProps) => {
  const { networkKey, selectedAccount } = compoundParams;
  const { goBack } = navigation;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const network = useGetNetworkJson(networkKey);

  const inputBalanceRef = createRef();

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [confirmCompoundState, dispatchConfirmCompoundState] = useReducer(confirmCompoundReducer, {
    ...DEFAULT_CONFIRM_COMPOUND_STATE,
  });

  const {
    currentAccountMinimum,
    currentFrequency,
    currentTaskId,
    hasCompoundRequest,
    isCompoundReady,
    delegations,
    selectedDelegation,
    isDelegationReady,
    nominatedAmount,
    accountMinimum,
    isReadySubmit,
    warningMessage,
  } = confirmCompoundState;

  const [si, setSi] = useState<SiDef>(formatBalance.findSi('-'));
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  useHandlerHardwareBackPress(loading);
  const { reformatAmount, amountToUsd, balanceFormat } = useGetAmountInfo(nominatedAmount, networkKey);

  const selectedValidator = useMemo((): DelegationItem | undefined => {
    return delegations?.find(i => i.owner === selectedDelegation);
  }, [delegations, selectedDelegation]);

  const isNextButtonDisabled = useMemo((): boolean => {
    if (!hasCompoundRequest) {
      return !isReadySubmit;
    }

    return false;
  }, [hasCompoundRequest, isReadySubmit]);

  const openModal = useCallback(() => {
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const onSelectValidator = useCallback((val: string) => {
    dispatchConfirmCompoundState({
      type: ConfirmCompoundActionName.SELECT_DELEGATION,
      payload: {
        selectedDelegation: val,
      },
    });
  }, []);

  const onChangeAmount = useCallback(
    (value?: string) => {
      let val: number;
      if (value === undefined) {
        val = 0;
      } else {
        if (isNaN(parseFloat(value))) {
          val = -1;
        } else {
          val = parseFloat(value);
        }
      }

      dispatchConfirmCompoundState({
        type: ConfirmCompoundActionName.CHANGE_COMPOUND_VALUE,
        payload: {
          accountMinimum: val.toString(),
          decimals: balanceFormat[0],
        },
      });
    },
    [balanceFormat],
  );

  const handleCompound = useCallback(
    (selectedNetwork: string, address: string, minimum: string, validator: string, bondedAmount: string) => {
      const _minimum = new BigN(minimum).div(BN_TEN.pow(network.decimals || 0)).toString();
      getTuringStakeCompoundTxInfo({
        networkKey: selectedNetwork,
        address: address,
        accountMinimum: _minimum,
        collatorAddress: validator,
        bondedAmount,
      })
        .then(result => {
          setLoading(false);

          navigation.navigate('CompoundAuth', {
            compoundParams: compoundParams,
            validator: validator,
            bondedAmount: bondedAmount,
            feeString: result.txInfo.fee,
            balanceError: result.txInfo.balanceError,
            accountMinimum: minimum,
            compoundFee: result.compoundFee,
            initTime: result.initTime,
            optimalTime: result.optimalFrequency,
            si: si,
          });
        })
        .catch(console.error);
    },
    [compoundParams, navigation, network.decimals, si],
  );

  const handleCancelCompound = useCallback(
    (selectedNetwork: string, address: string, taskId: string, validator: string) => {
      getTuringCancelStakeCompoundTxInfo({
        taskId: taskId,
        networkKey: selectedNetwork,
        address: address,
      })
        .then(result => {
          setLoading(false);
          navigation.navigate('CancelCompoundAuth', {
            compoundParams: compoundParams,
            taskId: taskId,
            validator: validator,
            balanceError: result.balanceError,
            feeString: result.fee,
          });
        })
        .catch(console.error);
    },
    [compoundParams, navigation],
  );

  const onContinue = useCallback(() => {
    setLoading(true);

    if (!isNetConnected) {
      setLoading(false);
      return;
    }

    if (hasCompoundRequest) {
      handleCancelCompound(networkKey, selectedAccount, currentTaskId, selectedDelegation);
    } else {
      handleCompound(networkKey, selectedAccount, accountMinimum, selectedDelegation, nominatedAmount);
    }
  }, [
    accountMinimum,
    currentTaskId,
    handleCancelCompound,
    handleCompound,
    hasCompoundRequest,
    isNetConnected,
    networkKey,
    nominatedAmount,
    selectedAccount,
    selectedDelegation,
  ]);

  useEffect(() => {
    let amount = true;
    getStakeDelegationInfo({
      address: selectedAccount,
      networkKey: networkKey,
    })
      .then(result => {
        if (amount) {
          const filteredDelegations = filterValidDelegations(result);

          dispatchConfirmCompoundState({
            type: ConfirmCompoundActionName.CHANGE_DELEGATIONS,
            payload: {
              delegations: filteredDelegations,
              nominatedAmount: filteredDelegations[0].amount,
              selectedDelegation: filteredDelegations[0].owner,
              isDelegationReady: true,
            },
          });
        }
      })
      .catch(console.error);

    return () => {
      amount = false;
      dispatchConfirmCompoundState({
        type: ConfirmCompoundActionName.REFRESH_DELEGATIONS,
        payload: null,
      });
    };
  }, [selectedAccount, networkKey]);

  useEffect(() => {
    let amount = true;

    if (selectedDelegation !== '') {
      if (amount) {
        checkTuringStakeCompounding({
          address: selectedAccount,
          collatorAddress: selectedDelegation,
          networkKey: networkKey,
        })
          .then(result => {
            if (amount) {
              dispatchConfirmCompoundState({
                type: ConfirmCompoundActionName.CHANGE_EXISTING_REQUEST,
                payload: {
                  currentTaskId: result.taskId,
                  isCompoundReady: true,
                  hasCompoundRequest: result.exist,
                  currentAccountMinimum: result.accountMinimum,
                  currentFrequency: result.frequency,
                },
              });
            }
          })
          .catch(console.error);
      }
    }

    return () => {
      amount = false;
      dispatchConfirmCompoundState({
        type: ConfirmCompoundActionName.REFRESH_EXISTING_REQUEST,
        payload: null,
      });
    };
  }, [networkKey, selectedAccount, selectedValidator, selectedDelegation]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.compoundStakeAction}
      rightButtonTitle={i18n.common.cancel}
      disabled={loading}
      disableRightButton={loading}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        <ScrollView
          style={{ ...ScrollViewStyle }}
          contentContainerStyle={!isDelegationReady ? { ...centerStyle } : { flex: 1 }}>
          {isDelegationReady ? (
            <>
              <View style={IconContainerStyle}>
                <View>
                  <SubWalletAvatar size={40} address={selectedAccount} />
                </View>
              </View>
              {delegations && selectedValidator && (
                <DelegationBriefInfo validator={selectedValidator} onPress={openModal} disable={loading} />
              )}
              <View style={[ScrollViewStyle, !isCompoundReady ? { ...centerStyle } : undefined, { flex: 1 }]}>
                {isCompoundReady ? (
                  <>
                    {hasCompoundRequest ? (
                      <>
                        <TextField
                          text={toShort(currentTaskId)}
                          label={i18n.compoundStakeAction.taskId}
                          disabled={true}
                        />
                        <BalanceField
                          value={currentAccountMinimum.toString()}
                          si={formatBalance.findSi('-')}
                          decimal={0}
                          token={network.nativeToken || 'Token'}
                          label={i18n.compoundStakeAction.compoundingThreshold}
                        />
                        <TextField
                          text={moment.duration(currentFrequency, 'seconds').humanize()}
                          label={i18n.compoundStakeAction.optimalCompoundingTime}
                          disabled={true}
                        />
                      </>
                    ) : (
                      <>
                        <InputBalance
                          placeholder={'0'}
                          si={si}
                          onChangeSi={setSi}
                          onChange={onChangeAmount}
                          decimals={balanceFormat[0]}
                          ref={inputBalanceRef}
                          siSymbol={selectedToken}
                          disable={loading}
                        />
                        <View style={RowCenterStyle}>
                          {!!reformatAmount && (
                            <BalanceToUsd amountToUsd={new BigN(amountToUsd)} isShowBalance={true} />
                          )}
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <ActivityIndicator animating={true} size={'large'} />
                )}
              </View>
            </>
          ) : (
            <ActivityIndicator animating={true} size={'large'} />
          )}

          {isCompoundReady && isDelegationReady && !!warningMessage && (
            <Warning style={WarningStyle} message={warningMessage} isDanger />
          )}

          {isCompoundReady && isDelegationReady && !isNetConnected && (
            <Warning isDanger message={i18n.warningMessage.noInternetMessage} />
          )}
        </ScrollView>

        {delegations && (
          <DelegationSelectModal
            delegations={delegations}
            modalVisible={visible}
            onChangeModalVisible={closeModal}
            onChangeValue={onSelectValidator}
            selectedItem={selectedDelegation}
            networkKey={networkKey}
          />
        )}

        <View>
          <SubmitButton
            disabled={isNextButtonDisabled || !isCompoundReady || !isDelegationReady || !isNetConnected}
            isBusy={loading}
            title={hasCompoundRequest ? i18n.common.cancelTask : i18n.common.continue}
            style={{
              width: '100%',
              marginTop: 16,
              ...MarginBottomForSubmitButton,
            }}
            onPress={onContinue}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(CompoundConfirm);
