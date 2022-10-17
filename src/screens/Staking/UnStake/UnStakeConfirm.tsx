import { formatBalance } from '@polkadot/util';
import { SiDef } from '@polkadot/util/types';
import { useNavigation } from '@react-navigation/native';
import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import FormatBalance from 'components/FormatBalance';
import { InputBalance } from 'components/Input/InputBalance';
import { SubmitButton } from 'components/SubmitButton';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import useGetAmountInfo from 'hooks/screen/Staking/useGetAmountInfo';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { createRef, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import {
  ConfirmUnStakeActionName,
  confirmUnStakeReducer,
  DEFAULT_CONFIRM_UN_STAKE_STATE,
} from 'reducers/staking/confirmUnStake';
import { RootNavigationProps } from 'routes/index';
import { UnStakeConfirmProps } from 'routes/staking/unStakeAction';
import DelegationSelectModal from 'components/Modal/DelegationSelectModal';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { CHAIN_TYPE_MAP } from 'constants/stakingScreen';
import { getStakeDelegationInfo, getUnbondingTxInfo } from '../../../messaging';
import DelegationBriefInfo from 'components/Staking/DelegationBriefInfo';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  paddingTop: 24,
};

const RowCenterStyle: StyleProp<ViewStyle> = {
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'row',
};

const IconContainerStyle: StyleProp<ViewStyle> = {
  ...RowCenterStyle,
  marginTop: 46,
  marginBottom: 16,
};

const BalanceContainerStyle: StyleProp<ViewStyle> = {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingBottom: 24,
};

const TransferableContainerStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
};

const TransferableTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const MaxTextStyle: StyleProp<TextStyle> = {
  color: ColorMap.primary,
  ...sharedStyles.mainText,
  ...FontMedium,
};

const DEFAULT_AMOUNT = -1;

const filterValidDelegations = (delegations: DelegationItem[]): DelegationItem[] => {
  return delegations.filter(item => parseFloat(item.amount) > 0);
};

const UnStakeConfirm = ({ route: { params: unStakeParams }, navigation: { goBack } }: UnStakeConfirmProps) => {
  const { networkKey, selectedAccount, bondedAmount } = unStakeParams;

  const toast = useToast();

  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);

  const inputBalanceRef = createRef();

  const [visible, setVisible] = useState(false);

  const [confirmUnStakeState, dispatchConfirmUnStakeState] = useReducer(confirmUnStakeReducer, {
    ...DEFAULT_CONFIRM_UN_STAKE_STATE,
  });

  const { delegations, selectedDelegation, nominatedAmount, minBond, isDataReady, isValidValidator } =
    confirmUnStakeState;

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const maxUnBoned = useMemo((): string => {
    if (delegations) {
      return nominatedAmount;
    } else {
      return new BigN(bondedAmount).multipliedBy(BN_TEN.pow(network.decimals || 0)).toString();
    }
  }, [bondedAmount, delegations, network.decimals, nominatedAmount]);

  const [si, setSi] = useState<SiDef>(formatBalance.findSi('-'));
  const [rawAmount, setRawAmount] = useState<number>(DEFAULT_AMOUNT);
  const [loading, setLoading] = useState(false);

  const selectedValidator = useMemo((): DelegationItem | undefined => {
    return delegations?.find(i => i.owner === selectedDelegation);
  }, [delegations, selectedDelegation]);

  const { reformatAmount, amountToUsd, balanceFormat } = useGetAmountInfo(rawAmount, networkKey);

  const isReadySubmit = useMemo((): boolean => {
    const _rawAmount = rawAmount / 10 ** (network.decimals as number);

    if (delegations) {
      const _nominatedAmount = parseFloat(nominatedAmount) / 10 ** (network.decimals as number);
      const _minBond = parseFloat(minBond) / 10 ** (network.decimals as number);
      if (_rawAmount > 0 && (_rawAmount <= _nominatedAmount - _minBond || _rawAmount === _nominatedAmount)) {
        return true;
      } else {
        if (_rawAmount > 0) {
          if (_nominatedAmount - _minBond <= 0) {
            toast.hideAll();
            toast.show(i18n.warningMessage.unStakeEverything);
          } else {
            toast.hideAll();
            toast.show(
              `${i18n.warningMessage.unStakeEverythingOrMaxOf} ${(_nominatedAmount - _minBond).toFixed(2)} ${
                network.nativeToken as string
              }`,
            );
          }
        }
        return false;
      }
    } else {
      if (_rawAmount > 0 && _rawAmount <= bondedAmount) {
        return true;
      } else {
        if (_rawAmount > bondedAmount) {
          toast.hideAll();
          toast.show(`${i18n.warningMessage.unStakeMaxOf} ${bondedAmount} ${network.nativeToken as string}`);
        }
        return false;
      }
    }
  }, [bondedAmount, delegations, minBond, network.decimals, network.nativeToken, nominatedAmount, rawAmount, toast]);

  const handlePressMax = useCallback(() => {
    if (inputBalanceRef && inputBalanceRef.current) {
      // @ts-ignore
      inputBalanceRef.current.onChange(maxUnBoned);
    }
  }, [inputBalanceRef, maxUnBoned]);

  const onChangeAmount = useCallback((value?: string) => {
    if (value === undefined) {
      setRawAmount(0);
      return;
    }
    if (isNaN(parseFloat(value))) {
      setRawAmount(DEFAULT_AMOUNT - 1);
    } else {
      setRawAmount(parseFloat(value));
    }
  }, []);

  const openModal = useCallback(() => {
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const onSelectCollator = useCallback((val: string) => {
    dispatchConfirmUnStakeState({
      type: ConfirmUnStakeActionName.SELECT_DELEGATION,
      payload: {
        selectedDelegation: val,
      },
    });
  }, []);

  const onContinue = useCallback(() => {
    setLoading(true);
    const bnAmount = new BigN(rawAmount.toString());
    const isAmountEqualAll = bnAmount.eq(new BigN(maxUnBoned));

    getUnbondingTxInfo({
      address: selectedAccount,
      amount: reformatAmount,
      networkKey: networkKey,
      validatorAddress: selectedDelegation,
      unstakeAll: isAmountEqualAll,
    })
      .then(resp => {
        navigation.navigate('UnStakeAction', {
          screen: 'UnStakeAuth',
          params: {
            unStakeParams: unStakeParams,
            feeString: resp.fee,
            amount: rawAmount,
            balanceError: resp.balanceError,
            validator: selectedDelegation,
            unstakeAll: isAmountEqualAll,
            amountSi: si,
          },
        });
        setLoading(false);
      })
      .catch(console.error);
  }, [
    rawAmount,
    maxUnBoned,
    selectedAccount,
    reformatAmount,
    networkKey,
    selectedDelegation,
    navigation,
    unStakeParams,
    si,
  ]);

  useEffect(() => {
    let amount = true;
    if (amount) {
      if (CHAIN_TYPE_MAP.astar.includes(networkKey) || CHAIN_TYPE_MAP.para.includes(networkKey)) {
        getStakeDelegationInfo({
          address: selectedAccount,
          networkKey: networkKey,
        })
          .then(result => {
            if (amount) {
              const filteredDelegations = filterValidDelegations(result);
              dispatchConfirmUnStakeState({
                type: ConfirmUnStakeActionName.CHANGE_DELEGATIONS,
                payload: {
                  selectedDelegation: filteredDelegations[0].owner,
                  isDataReady: true,
                  minBond: filteredDelegations[0].minBond,
                  delegations: filteredDelegations,
                  nominatedAmount: filteredDelegations[0].amount,
                  isValidValidator: !filteredDelegations[0].hasScheduledRequest,
                },
              });
            }
          })
          .catch(console.error);
      } else {
        dispatchConfirmUnStakeState({
          type: ConfirmUnStakeActionName.CHANGE_DELEGATIONS,
          payload: {
            isDataReady: true,
          },
        });
      }
    }

    return () => {
      amount = false;
      dispatchConfirmUnStakeState({
        type: ConfirmUnStakeActionName.REFRESH_DELEGATIONS,
        payload: null,
      });
    };
  }, [selectedAccount, networkKey]);

  useEffect(() => {
    if (!isValidValidator) {
      toast.hideAll();
      toast.show(i18n.warningMessage.withdrawUnStakingFirst);
    }

    return () => {};
  }, [isValidValidator, toast]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.unStakeAction}
      rightButtonTitle={i18n.common.cancel}
      disabled={loading}
      disableRightButton={loading}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        <ScrollView
          style={{ ...ScrollViewStyle }}
          contentContainerStyle={{ flex: 1, justifyContent: !isDataReady ? 'center' : undefined }}>
          {isDataReady ? (
            <>
              {delegations && selectedValidator && (
                <DelegationBriefInfo validator={selectedValidator} onPress={openModal} disable={loading} />
              )}
              {delegations && (
                <DelegationSelectModal
                  delegations={delegations}
                  modalVisible={visible}
                  onChangeModalVisible={closeModal}
                  onChangeValue={onSelectCollator}
                  selectedItem={selectedDelegation}
                  networkKey={networkKey}
                />
              )}
              <View style={IconContainerStyle}>
                <View>
                  <SubWalletAvatar size={40} address={selectedAccount} />
                </View>
              </View>
              <InputBalance
                placeholder={'0'}
                si={si}
                onChangeSi={setSi}
                maxValue={maxUnBoned}
                onChange={onChangeAmount}
                decimals={balanceFormat[0]}
                ref={inputBalanceRef}
                siSymbol={selectedToken}
                disable={loading}
              />
              <View style={RowCenterStyle}>
                {!!reformatAmount && <BalanceToUsd amountToUsd={new BigN(amountToUsd)} isShowBalance={true} />}
              </View>
            </>
          ) : (
            <ActivityIndicator animating={true} size={'large'} />
          )}
        </ScrollView>
        <View>
          <View style={BalanceContainerStyle}>
            <View style={TransferableContainerStyle}>
              <Text style={TransferableTextStyle}>{i18n.common.activeStaking}:&nbsp;</Text>
              <FormatBalance format={balanceFormat} value={maxUnBoned} />
            </View>

            <TouchableOpacity onPress={handlePressMax} disabled={loading}>
              <Text style={MaxTextStyle}>{i18n.common.max}</Text>
            </TouchableOpacity>
          </View>
          <SubmitButton
            disabled={!isReadySubmit || (delegations && !isValidValidator)}
            isBusy={loading}
            title={i18n.common.continue}
            style={{
              width: '100%',
              ...MarginBottomForSubmitButton,
            }}
            onPress={onContinue}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(UnStakeConfirm);
