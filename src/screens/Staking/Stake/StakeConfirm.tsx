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
import { HomeNavigationProps } from 'routes/home';
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
  marginTop: 46,
};

const AvatarContainerStyle: StyleProp<ViewStyle> = {
  width: 40,
  height: 40,
  borderRadius: 40,
  borderColor: ColorMap.secondary,
  padding: 2,
  borderWidth: 2,
  backgroundColor: ColorMap.dark,
};

const AvatarImageStyle: StyleProp<ImageStyle> = {
  width: 32,
  height: 32,
  borderRadius: 32,
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

const StakeConfirm = ({ route: { params: stakeParams } }: StakeConfirmProps) => {
  const { validator, networkKey, networkValidatorsInfo } = stakeParams;

  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const tokenPriceMap = useSelector((state: RootState) => state.price.tokenPriceMap);
  const chainRegistry = useSelector((state: RootState) => state.chainRegistry.details);
  const network = useGetNetworkJson(networkKey);

  const inputBalanceRef = createRef();

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const senderFreeBalance = useFreeBalance(networkKey, currentAccountAddress, network.nativeToken);

  const { icon, address, minBond } = validator;
  const { isBondedBefore, bondedValidators } = networkValidatorsInfo;

  const [si, setSi] = useState<SiDef>(formatBalance.findSi('-'));
  const [rawAmount, setRawAmount] = useState<number>(-1);
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

  const canStake = parseFloat(senderFreeBalance) > rawAmount && rawAmount >= 0 && reformatAmount.gte(minBond);

  const amountToUsd = useMemo(() => reformatAmount.multipliedBy(new BigN(tokenPrice)), [reformatAmount, tokenPrice]);

  const handlePressMax = useCallback(() => {
    getBondingTxInfo({
      networkKey: networkKey,
      nominatorAddress: currentAccountAddress,
      amount: rawAmount,
      validatorInfo: validator,
      isBondedBefore,
      bondedValidators,
      lockPeriod: 0,
    }).then(() => {
      if (inputBalanceRef && inputBalanceRef.current) {
        // @ts-ignore
        inputBalanceRef.current.onChange(senderFreeBalance);
      }
    });
  }, [
    bondedValidators,
    currentAccountAddress,
    inputBalanceRef,
    isBondedBefore,
    networkKey,
    rawAmount,
    senderFreeBalance,
    validator,
  ]);

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

  const goBack = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const onCancel = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const onContinue = useCallback(() => {
    setLoading(true);
    getBondingTxInfo({
      networkKey: networkKey,
      nominatorAddress: currentAccountAddress,
      amount: reformatAmount.toNumber(),
      validatorInfo: validator,
      isBondedBefore,
      bondedValidators,
      lockPeriod: 0,
    })
      .then(res => {
        if (!res.balanceError) {
          rootNavigation.navigate('StakeAction', {
            screen: 'StakeAuth',
            params: {
              stakeParams: stakeParams,
              amount: rawAmount,
              feeString: res.fee,
            },
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    bondedValidators,
    currentAccountAddress,
    isBondedBefore,
    networkKey,
    rawAmount,
    reformatAmount,
    rootNavigation,
    stakeParams,
    validator,
  ]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.stakeAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={onCancel}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <ValidatorBriefInfo validator={validator} rightIcon={true} />
          <View style={IconContainerStyle}>
            {icon ? (
              <View style={AvatarContainerStyle}>
                <Image source={{ uri: icon }} style={AvatarImageStyle} />
              </View>
            ) : (
              <View>
                <SubWalletAvatar size={40} address={address} />
              </View>
            )}
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
