import { formatBalance } from '@polkadot/util';
import { SiDef } from '@polkadot/util/types';
import { useNavigation } from '@react-navigation/native';
import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { CollatorField } from 'components/Field/Collator';
import FormatBalance from 'components/FormatBalance';
import { InputBalance } from 'components/Input/InputBalance';
import { SubmitButton } from 'components/SubmitButton';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { UnStakeConfirmProps } from 'routes/staking/unStakeAction';
import { getBalanceFormat } from 'screens/Sending/utils';
import CollatorSelectModal from 'screens/Staking/UnStake/CollatorSelectModal';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import {
  centerStyle,
  ContainerHorizontalPadding,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { BalanceFormatType } from 'types/ui-types';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { CHAIN_TYPE_MAP } from 'constants/stakingScreen';
import { getStakeDelegationInfo, getUnbondingTxInfo } from '../../../messaging';

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

const filterValidDelegations = (delegations: DelegationItem[]): DelegationItem[] => {
  return delegations.filter(item => parseFloat(item.amount) > 0);
};

const UnStakeConfirm = ({ route: { params: unStakeParams } }: UnStakeConfirmProps) => {
  const { networkKey, selectedAccount, bondedAmount } = unStakeParams;

  const toast = useToast();

  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const tokenPriceMap = useSelector((state: RootState) => state.price.tokenPriceMap);
  const chainRegistry = useSelector((state: RootState) => state.chainRegistry.details);
  const network = useGetNetworkJson(networkKey);

  const inputBalanceRef = createRef();

  const [isDataReady, setIsDataReady] = useState(false);
  const [isValidValidator, setIsValidValidator] = useState(true);
  const [delegations, setDelegations] = useState<DelegationItem[] | undefined>(undefined);
  const [selectedValidator, setSelectedValidator] = useState<string>('');
  const [nominatedAmount, setNominatedAmount] = useState<string>('0');
  const [minBond, setMinBond] = useState<string>('0');
  const [visible, setVisible] = useState(false);

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const maxUnBoned = useMemo((): string => {
    if (delegations) {
      return nominatedAmount;
    } else {
      return new BigN(bondedAmount).multipliedBy(BN_TEN.pow(network.decimals || 0)).toString();
    }
  }, [bondedAmount, delegations, network.decimals, nominatedAmount]);

  const [si, setSi] = useState<SiDef>(formatBalance.findSi('-'));
  const [rawAmount, setRawAmount] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const selectedCollator = useMemo((): DelegationItem | undefined => {
    return delegations?.find(i => i.owner === selectedValidator);
  }, [delegations, selectedValidator]);

  const balanceFormat = useMemo((): BalanceFormatType => {
    return getBalanceFormat(networkKey, selectedToken, chainRegistry);
  }, [chainRegistry, networkKey, selectedToken]);

  const tokenPrice = useMemo(
    (): number => tokenPriceMap[selectedToken.toLowerCase()] || 0,
    [selectedToken, tokenPriceMap],
  );

  const reformatAmount = useMemo(
    (): BigN => new BigN(rawAmount || '0').div(BN_TEN.pow(balanceFormat[0])),
    [balanceFormat, rawAmount],
  );

  const amountToUsd = useMemo(() => reformatAmount.multipliedBy(new BigN(tokenPrice)), [reformatAmount, tokenPrice]);

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
            toast.show('You can only unstake everything');
          } else {
            toast.hideAll();
            toast.show(
              `You can unstake everything or a maximum of ${(_nominatedAmount - _minBond).toFixed(2)} ${
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
          toast.show(`You can unstake a maximum of ${bondedAmount} ${network.nativeToken as string}`);
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
      setRawAmount(-1);
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

  const onSelectCollator = useCallback(
    (val: string) => {
      if (delegations) {
        for (const item of delegations) {
          if (item.owner === val) {
            setSelectedValidator(val);
            setNominatedAmount(item.amount);
            setMinBond(item.minBond);

            if (!item.hasScheduledRequest) {
              setIsValidValidator(true);
            } else {
              toast.show('Please withdraw the unstaking amount first');
              setIsValidValidator(false);
            }

            break;
          }
        }
      }
    },
    [delegations, toast],
  );

  const goBack = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const onContinue = useCallback(() => {
    setLoading(true);
    const bnAmount = new BigN(rawAmount.toString());
    const isAmountEqualAll = bnAmount.eq(new BigN(maxUnBoned));

    getUnbondingTxInfo({
      address: selectedAccount,
      amount: rawAmount,
      networkKey: networkKey,
      validatorAddress: selectedValidator,
      unstakeAll: isAmountEqualAll,
    })
      .then(resp => {
        rootNavigation.navigate('UnStakeAction', {
          screen: 'UnStakeAuth',
          params: {
            unStakeParams: unStakeParams,
            feeString: resp.fee,
            amount: rawAmount,
            balanceError: resp.balanceError,
            collator: selectedValidator,
            unstakeAll: isAmountEqualAll,
          },
        });
        setLoading(false);
      })
      .catch(console.error);
  }, [maxUnBoned, networkKey, rawAmount, rootNavigation, selectedAccount, selectedValidator, unStakeParams]);

  useEffect(() => {
    if (CHAIN_TYPE_MAP.astar.includes(networkKey) || CHAIN_TYPE_MAP.para.includes(networkKey)) {
      getStakeDelegationInfo({
        address: selectedAccount,
        networkKey: networkKey,
      })
        .then(result => {
          const filteredDelegations = filterValidDelegations(result);

          setSelectedValidator(filteredDelegations[0].owner);
          setNominatedAmount(filteredDelegations[0].amount);
          setMinBond(filteredDelegations[0].minBond);
          setDelegations(filteredDelegations);

          if (filteredDelegations[0].hasScheduledRequest) {
            setIsValidValidator(false);
          }
          setIsDataReady(true);
        })
        .catch(console.error);
    } else {
      setIsDataReady(true);
    }

    return () => {
      setDelegations(undefined);
      setIsDataReady(false);
    };
  }, [selectedAccount, networkKey]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.unStakeAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        <ScrollView
          style={{ ...ScrollViewStyle }}
          contentContainerStyle={!isDataReady ? { ...centerStyle } : undefined}>
          {isDataReady ? (
            <>
              {delegations && selectedCollator && (
                <TouchableOpacity onPress={openModal}>
                  <CollatorField collator={selectedCollator} label={i18n.unStakeAction.collator} />
                </TouchableOpacity>
              )}
              {delegations && (
                <CollatorSelectModal
                  delegations={delegations}
                  modalVisible={visible}
                  onChangeModalVisible={closeModal}
                  onChangeValue={onSelectCollator}
                  selectedItem={selectedValidator}
                />
              )}
              <InputBalance
                placeholder={'0'}
                si={si}
                onChangeSi={setSi}
                maxValue={maxUnBoned}
                onChange={onChangeAmount}
                decimals={balanceFormat[0]}
                ref={inputBalanceRef}
                siSymbol={selectedToken}
              />
              <View style={RowCenterStyle}>
                {reformatAmount && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={true} />}
              </View>
            </>
          ) : (
            <ActivityIndicator animating={true} size={'large'} />
          )}
        </ScrollView>
        <View>
          <View style={BalanceContainerStyle}>
            <View style={TransferableContainerStyle}>
              <Text style={TransferableTextStyle}>{i18n.common.maxUnBond}:&nbsp;</Text>
              <FormatBalance format={balanceFormat} value={maxUnBoned} />
            </View>

            <TouchableOpacity onPress={handlePressMax}>
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
