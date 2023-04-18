import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { StakingType, TuringStakeCompoundParams } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import SigningRequest from 'components/Signing/SigningRequest';
import { Warning } from 'components/Warning';
import useGetValidatorLabel from 'hooks/screen/Staking/useGetValidatorLabel';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import moment from 'moment';
import { WebRunnerContext } from 'providers/contexts';
import { SigningContext } from 'providers/SigningContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { CreateCompoundAuthProps } from 'routes/staking/compoundAction';
import { ContainerHorizontalPadding, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { createCompoundQr, submitTuringStakeCompounding } from 'messaging/index';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const CreateCompoundAuth = ({
  route: {
    params: {
      compoundParams,
      feeString,
      compoundFee: compoundString,
      validator,
      balanceError,
      si,
      initTime,
      optimalTime,
      bondedAmount,
      accountMinimum,
    },
  },
  navigation: { goBack },
}: CreateCompoundAuthProps) => {
  const { networkKey, selectedAccount } = compoundParams;

  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const {
    signingState: { isLoading },
  } = useContext(SigningContext);

  const navigation = useNavigation<RootNavigationProps>();

  const account = useGetAccountByAddress(selectedAccount);
  const network = useGetNetworkJson(networkKey);
  const validatorLabel = useGetValidatorLabel(networkKey);

  const _minimum = useMemo(
    (): string => new BigN(accountMinimum).div(BN_TEN.pow(network.decimals || 0)).toString(),
    [accountMinimum, network.decimals],
  );

  const submitParams = useMemo(
    (): TuringStakeCompoundParams => ({
      address: selectedAccount,
      accountMinimum: _minimum,
      collatorAddress: validator,
      networkKey: networkKey,
      bondedAmount: bondedAmount,
    }),
    [_minimum, bondedAmount, networkKey, selectedAccount, validator],
  );

  useHandlerHardwareBackPress(isLoading);

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const [compoundFee, compoundFeeToken] = useMemo((): [string, string] => {
    const res = compoundString.split(' ');
    return [res[0], res[1]];
  }, [compoundString]);

  const onCancel = useGoHome({
    screen: 'Staking',
    params: { screen: 'StakingBalanceDetail', params: { networkKey: networkKey, stakingType: StakingType.NOMINATED } },
  });

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      navigation.navigate('CompoundStakeAction', {
        screen: 'CreateCompoundResult',
        params: {
          compoundParams: compoundParams,
          txParams: {
            txError: '',
            extrinsicHash: extrinsicHash,
            txSuccess: true,
          },
        },
      });
    },
    [compoundParams, navigation],
  );

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('CompoundStakeAction', {
        screen: 'CreateCompoundResult',
        params: {
          compoundParams: compoundParams,
          txParams: {
            txError: errors[0],
            extrinsicHash: extrinsicHash,
            txSuccess: false,
          },
        },
      });
    },
    [compoundParams, navigation],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      disabled={isLoading}
      disableRightButton={isLoading}
      title={i18n.title.createCompoundTask}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={onCancel}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          {!!validator && <TextField text={toShort(validator)} label={validatorLabel} disabled={true} />}
          <AddressField address={selectedAccount} label={i18n.common.account} showRightIcon={false} />
          <BalanceField
            value={accountMinimum}
            decimal={network.decimals || 0}
            token={selectedToken}
            si={si}
            label={i18n.compoundStakeAction.compoundingThreshold}
          />
          <TextField
            text={`About ${moment.duration(initTime, 'days').humanize()}`}
            label={i18n.compoundStakeAction.compoundingStartIn}
            disabled={true}
          />
          <TextField
            text={moment.duration(optimalTime, 'days').humanize()}
            label={i18n.compoundStakeAction.optimalCompoundingTime}
            disabled={true}
          />
          <BalanceField
            value={fee}
            decimal={0}
            token={feeToken}
            si={formatBalance.findSi('-')}
            label={i18n.compoundStakeAction.transactionFee}
          />
          <BalanceField
            value={compoundFee}
            decimal={0}
            token={compoundFeeToken}
            si={formatBalance.findSi('-')}
            label={i18n.compoundStakeAction.compoundingFee}
          />
          <TextField text={`${compoundString} + ${feeString}`} label={i18n.unStakeAction.total} disabled={true} />

          {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
        </ScrollView>
        <SigningRequest
          account={account}
          handleSignPassword={submitTuringStakeCompounding}
          handleSignQr={createCompoundQr}
          balanceError={balanceError}
          message={'There is problem when createCompoundRequest'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={submitParams}
          baseProps={{
            buttonText: i18n.common.continue,
            onCancel: goBack,
          }}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(CreateCompoundAuth);
