import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BondingSubmitParams } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import SigningRequest from 'components/Signing/SigningRequest';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { SigningContext } from 'providers/SigningContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { StakeAuthProps } from 'routes/staking/stakeAction';
import ValidatorBriefInfo from 'components/Staking/ValidatorBriefInfo';
import { ContainerHorizontalPadding, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getBalanceWithSi } from 'utils/index';
import { submitBonding, makeBondingQr } from 'messaging/index';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { WebRunnerContext } from 'providers/contexts';
import { Warning } from 'components/Warning';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  paddingTop: 16,
};

const StakeAuth = ({
  route: {
    params: { stakeParams, feeString, amount: rawAmount, amountSi },
  },
  navigation: { goBack },
}: StakeAuthProps) => {
  const { validator, networkKey, networkValidatorsInfo, selectedAccount } = stakeParams;
  const { isBondedBefore, bondedValidators } = networkValidatorsInfo;

  const {
    signingState: { isLoading },
  } = useContext(SigningContext);

  const navigation = useNavigation<RootNavigationProps>();

  const account = useGetAccountByAddress(selectedAccount);
  const network = useGetNetworkJson(networkKey);

  useHandlerHardwareBackPress(isLoading);

  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);
  const amount = useMemo(
    (): number => new BigN(rawAmount).div(BN_TEN.pow(network.decimals || 0)).toNumber(),
    [network.decimals, rawAmount],
  );

  const bondingParams = useMemo(
    (): BondingSubmitParams => ({
      networkKey: networkKey,
      nominatorAddress: selectedAccount,
      amount: amount,
      validatorInfo: validator,
      isBondedBefore: isBondedBefore,
      bondedValidators: bondedValidators,
    }),
    [amount, bondedValidators, isBondedBefore, networkKey, selectedAccount, validator],
  );

  const [amountValue, amountToken] = useMemo(
    (): [string, string] => getBalanceWithSi(rawAmount.toString(), network.decimals || 0, amountSi, selectedToken),
    [amountSi, network.decimals, rawAmount, selectedToken],
  );

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const totalString = useMemo((): string => {
    return `${amountValue} ${amountToken} + ${feeString}`;
  }, [amountValue, feeString, amountToken]);

  const onCancel = useGoHome({ screen: 'Staking' });

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('StakeAction', {
        screen: 'StakeResult',
        params: {
          stakeParams: stakeParams,
          txParams: {
            txError: errors[0],
            extrinsicHash: extrinsicHash,
            txSuccess: false,
          },
        },
      });
    },
    [navigation, stakeParams],
  );

  const onSuccess = useCallback(
    (hash: string) => {
      navigation.navigate('StakeAction', {
        screen: 'StakeResult',
        params: {
          stakeParams: stakeParams,
          txParams: {
            txError: '',
            extrinsicHash: hash,
            txSuccess: true,
          },
        },
      });
    },
    [navigation, stakeParams],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      disabled={isLoading}
      disableRightButton={isLoading}
      title={i18n.title.stakeAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={onCancel}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <ValidatorBriefInfo validator={validator} />
          <AddressField address={selectedAccount} label={i18n.common.account} showRightIcon={false} />
          <BalanceField
            value={rawAmount.toString()}
            decimal={network.decimals || 0}
            token={selectedToken}
            si={amountSi}
            label={i18n.stakeAction.stakingAmount}
          />
          <BalanceField
            value={fee}
            decimal={0}
            token={feeToken}
            si={formatBalance.findSi('-')}
            label={i18n.stakeAction.stakingFee}
          />
          <TextField text={totalString} label={i18n.stakeAction.total} disabled={true} />

          {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
        </ScrollView>
        <SigningRequest
          account={account}
          balanceError={false}
          baseProps={{
            onCancel: goBack,
            buttonText: i18n.common.continue,
          }}
          handleSignPassword={submitBonding}
          handleSignQr={makeBondingQr}
          message={'There is problem when bonding'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={bondingParams}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakeAuth);
