import { formatBalance } from '@polkadot/util';
import { SiDef } from '@polkadot/util/types';
import { useNavigation } from '@react-navigation/native';
import BigN from 'bignumber.js';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import FormatBalance from 'components/FormatBalance';
import { InputBalance } from 'components/Input/InputBalance';
import { SubmitButton } from 'components/SubmitButton';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { Warning } from 'components/Warning';
import useFreeBalance from 'hooks/screen/useFreeBalance';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { createRef, useCallback, useMemo, useState } from 'react';
import {
  Image,
  ImageStyle,
  ScrollView,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { StakeConfirmProps } from 'routes/staking/stakeAction';
import { getBalanceFormat } from 'screens/Sending/utils';
import ValidatorBriefInfo from 'screens/Staking/Stake/ValidatorBriefInfo';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { BalanceFormatType } from 'types/ui-types';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getBondingTxInfo } from '../../../messaging';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
};

const RowCenterStyle: StyleProp<ViewStyle> = {
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'row',
  marginBottom: 8,
};

const IconContainerStyle: StyleProp<ViewStyle> = {
  ...RowCenterStyle,
  marginTop: 46,
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

const StakeConfirm = ({ route: { params: stakeParams }, navigation: { goBack } }: StakeConfirmProps) => {
  const { validator, networkKey, networkValidatorsInfo, selectedAccount } = stakeParams;

  const navigation = useNavigation<RootNavigationProps>();

  const tokenPriceMap = useSelector((state: RootState) => state.price.tokenPriceMap);
  const chainRegistry = useSelector((state: RootState) => state.chainRegistry.details);
  const network = useGetNetworkJson(networkKey);

  const inputBalanceRef = createRef();

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const senderFreeBalance = useFreeBalance(networkKey, selectedAccount, network.nativeToken);

  const { icon, address, minBond } = validator;
  const { isBondedBefore, bondedValidators } = networkValidatorsInfo;

  const [si, setSi] = useState<SiDef>(formatBalance.findSi('-'));
  const [rawAmount, setRawAmount] = useState<number>(-1);
  const [balanceError, setBalanceError] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const warningMessage = useMemo((): string => {
    if (balanceError) {
      return i18n.warningMessage.balanceTooLow;
    }

    if (rawAmount <= 0) {
      if (!networkValidatorsInfo.bondedValidators.includes(validator.address)) {
        return `${i18n.warningMessage.stakeAtLeast} ${validator.minBond} ${selectedToken}`;
      } else {
        return i18n.warningMessage.amountGtZero;
      }
    }

    if (parseFloat(senderFreeBalance) <= rawAmount) {
      return i18n.warningMessage.notEnoughToStake;
    }

    if (reformatAmount.lt(minBond)) {
      if (networkValidatorsInfo.bondedValidators.includes(validator.address)) {
        return '';
      } else {
        return `${i18n.warningMessage.stakeAtLeast} ${validator.minBond} ${selectedToken}`;
      }
    }

    return '';
  }, [
    balanceError,
    minBond,
    networkValidatorsInfo.bondedValidators,
    rawAmount,
    reformatAmount,
    selectedToken,
    senderFreeBalance,
    validator.address,
    validator.minBond,
  ]);

  const canStake = useMemo((): boolean => {
    if (parseFloat(senderFreeBalance) > rawAmount && rawAmount > 0) {
      if (networkValidatorsInfo.bondedValidators.includes(validator.address)) {
        return true;
      } else {
        return reformatAmount.gte(minBond);
      }
    } else {
      return false;
    }
  }, [
    minBond,
    networkValidatorsInfo.bondedValidators,
    rawAmount,
    reformatAmount,
    senderFreeBalance,
    validator.address,
  ]);

  const amountToUsd = useMemo(() => reformatAmount.multipliedBy(new BigN(tokenPrice)), [reformatAmount, tokenPrice]);

  const handlePressMax = useCallback(() => {
    getBondingTxInfo({
      networkKey: networkKey,
      nominatorAddress: selectedAccount,
      amount: reformatAmount.toNumber(),
      validatorInfo: validator,
      isBondedBefore,
      bondedValidators,
      lockPeriod: 0,
    }).then(res => {
      if (inputBalanceRef && inputBalanceRef.current) {
        // @ts-ignore
        const fee = (res.rawFee as number) || 0;
        const balance = parseFloat(senderFreeBalance);
        // @ts-ignore
        inputBalanceRef.current.onChange((balance - fee).toString());
      }
    });
  }, [
    bondedValidators,
    selectedAccount,
    inputBalanceRef,
    isBondedBefore,
    networkKey,
    reformatAmount,
    senderFreeBalance,
    validator,
  ]);

  const onChangeAmount = useCallback((value?: string) => {
    setBalanceError(false);
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

  const onContinue = useCallback(() => {
    setLoading(true);
    getBondingTxInfo({
      networkKey: networkKey,
      nominatorAddress: selectedAccount,
      amount: reformatAmount.toNumber(),
      validatorInfo: validator,
      isBondedBefore,
      bondedValidators,
      lockPeriod: 0,
    })
      .then(res => {
        if (!res.balanceError) {
          navigation.navigate('StakeAction', {
            screen: 'StakeAuth',
            params: {
              stakeParams: stakeParams,
              amount: rawAmount,
              feeString: res.fee,
            },
          });
        } else {
          setBalanceError(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    bondedValidators,
    selectedAccount,
    isBondedBefore,
    networkKey,
    rawAmount,
    reformatAmount,
    navigation,
    stakeParams,
    validator,
  ]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.stakeAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }} contentContainerStyle={{ paddingTop: 16 }}>
          <ValidatorBriefInfo validator={validator} onPress={goBack} />
          <View style={IconContainerStyle}>
            <View>
              <SubWalletAvatar size={40} address={selectedAccount} />
            </View>
          </View>
          <InputBalance
            placeholder={'0'}
            si={si}
            onChangeSi={setSi}
            maxValue={senderFreeBalance}
            onChange={onChangeAmount}
            decimals={balanceFormat[0]}
            ref={inputBalanceRef}
            siSymbol={selectedToken}
          />
          <View style={RowCenterStyle}>
            {reformatAmount && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={true} />}
          </View>
          {!!warningMessage && <Warning title={i18n.warningTitle.warning} message={warningMessage} isDanger={false} />}
        </ScrollView>
        <View>
          <View style={BalanceContainerStyle}>
            <View style={TransferableContainerStyle}>
              <Text style={TransferableTextStyle}>{i18n.common.transferable}</Text>
              <FormatBalance format={balanceFormat} value={senderFreeBalance} />
            </View>

            <TouchableOpacity onPress={handlePressMax}>
              <Text style={MaxTextStyle}>{i18n.common.max}</Text>
            </TouchableOpacity>
          </View>
          <SubmitButton
            disabled={!canStake}
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

export default React.memo(StakeConfirm);
