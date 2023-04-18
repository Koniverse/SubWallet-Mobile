import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { StakingType, UnbondingSubmitParams } from '@subwallet/extension-base/background/KoniTypes';
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
import { WebRunnerContext } from 'providers/contexts';
import { SigningContext } from 'providers/SigningContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { UnStakeAuthProps } from 'routes/staking/unStakeAction';
import { ContainerHorizontalPadding, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getBalanceWithSi, toShort } from 'utils/index';
import { makeUnBondingQr, submitUnbonding } from 'messaging/index';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const UnStakeAuth = ({
  route: {
    params: { unStakeParams, feeString, amount: rawAmount, validator, balanceError, unstakeAll, amountSi },
  },
  navigation: { goBack },
}: UnStakeAuthProps) => {
  const { networkKey, selectedAccount } = unStakeParams;

  const {
    signingState: { isLoading },
  } = useContext(SigningContext);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  const navigation = useNavigation<RootNavigationProps>();

  const account = useGetAccountByAddress(selectedAccount);
  const network = useGetNetworkJson(networkKey);
  const validatorLabel = useGetValidatorLabel(networkKey);

  useHandlerHardwareBackPress(isLoading);

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);
  const amount = useMemo(
    (): number => new BigN(rawAmount).div(BN_TEN.pow(network.decimals || 0)).toNumber(),
    [network.decimals, rawAmount],
  );

  const unBondingParams = useMemo(
    (): UnbondingSubmitParams => ({
      networkKey: networkKey,
      address: selectedAccount,
      amount: amount,
      unstakeAll: unstakeAll,
      validatorAddress: validator,
    }),
    [amount, networkKey, selectedAccount, unstakeAll, validator],
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
  }, [amountValue, amountToken, feeString]);

  const onCancel = useGoHome({
    screen: 'Staking',
    params: { screen: 'StakingBalanceDetail', params: { networkKey: networkKey, stakingType: StakingType.NOMINATED } },
  });

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('UnStakeAction', {
        screen: 'UnStakeResult',
        params: {
          unStakeParams: unStakeParams,
          txParams: {
            txError: errors[0],
            extrinsicHash: extrinsicHash,
            txSuccess: false,
          },
        },
      });
    },
    [navigation, unStakeParams],
  );

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      navigation.navigate('UnStakeAction', {
        screen: 'UnStakeResult',
        params: {
          unStakeParams: unStakeParams,
          txParams: {
            txError: '',
            extrinsicHash: extrinsicHash,
            txSuccess: true,
          },
        },
      });
    },
    [navigation, unStakeParams],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      disabled={isLoading}
      title={i18n.title.unStakeAction}
      rightButtonTitle={i18n.common.cancel}
      disableRightButton={isLoading}
      onPressRightIcon={onCancel}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          {!!validator && <TextField text={toShort(validator)} label={validatorLabel} disabled={true} />}
          <AddressField address={selectedAccount} label={i18n.common.account} showRightIcon={false} />
          <BalanceField
            value={rawAmount.toString()}
            decimal={network.decimals || 0}
            token={selectedToken}
            si={amountSi}
            label={i18n.unStakeAction.unStakingAmount}
          />
          <BalanceField
            value={fee}
            decimal={0}
            token={feeToken}
            si={formatBalance.findSi('-')}
            label={i18n.unStakeAction.unStakingFee}
          />
          <TextField text={totalString} label={i18n.unStakeAction.total} disabled={true} />
          {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
        </ScrollView>
        <SigningRequest
          account={account}
          balanceError={balanceError}
          baseProps={{
            onCancel: goBack,
            buttonText: i18n.common.continue,
          }}
          handleSignPassword={submitUnbonding}
          handleSignQr={makeUnBondingQr}
          message={'There is problem when bonding'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={unBondingParams}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(UnStakeAuth);
