import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { StakeWithdrawalParams } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import SigningRequest from 'components/Signing/SigningRequest';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { SigningContext } from 'providers/SigningContext';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { WithdrawAuthProps } from 'routes/staking/withdrawAction';
import { centerStyle, ContainerHorizontalPadding, ScrollViewStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { getStakeWithdrawalTxInfo, stakeWithdrawQr, submitStakeWithdrawal } from 'messaging/index';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { WebRunnerContext } from 'providers/contexts';
import { NoInternetScreen } from 'components/NoInternetScreen';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const WithdrawAuth = ({ route: { params: withdrawParams }, navigation: { goBack } }: WithdrawAuthProps) => {
  const { withdrawAmount: amount, networkKey, selectedAccount, nextWithdrawalAction, targetValidator } = withdrawParams;

  const { isNetConnected } = useContext(WebRunnerContext);
  const {
    signingState: { isLoading },
  } = useContext(SigningContext);

  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);
  const account = useGetAccountByAddress(selectedAccount);

  const submitParams = useMemo(
    (): StakeWithdrawalParams => ({
      address: selectedAccount,
      networkKey: networkKey,
      action: nextWithdrawalAction,
      validatorAddress: targetValidator,
    }),
    [networkKey, nextWithdrawalAction, selectedAccount, targetValidator],
  );

  useHandlerHardwareBackPress(isLoading);

  const [feeString, setFeeString] = useState('');
  const [isTxReady, setIsTxReady] = useState(false);
  const [balanceError, setBalanceError] = useState(false);
  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const totalString = useMemo((): string => {
    return `${amount} ${selectedToken} + ${feeString}`;
  }, [amount, feeString, selectedToken]);

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      navigation.navigate('WithdrawStakeAction', {
        screen: 'WithdrawResult',
        params: {
          withdrawParams: withdrawParams,
          txParams: {
            txError: '',
            extrinsicHash: extrinsicHash as string,
            txSuccess: true,
          },
        },
      });
    },
    [withdrawParams, navigation],
  );

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('WithdrawStakeAction', {
        screen: 'WithdrawResult',
        params: {
          withdrawParams: withdrawParams,
          txParams: {
            txError: errors[0],
            extrinsicHash: extrinsicHash,
            txSuccess: false,
          },
        },
      });
    },
    [withdrawParams, navigation],
  );

  useEffect(() => {
    getStakeWithdrawalTxInfo({
      address: selectedAccount,
      networkKey,
      action: nextWithdrawalAction,
      validatorAddress: targetValidator,
    })
      .then(resp => {
        setIsTxReady(true);
        setBalanceError(resp.balanceError);
        setFeeString(resp.fee);
      })
      .catch(console.error);

    return () => {
      setIsTxReady(false);
      setBalanceError(false);
      setFeeString('');
    };
  }, [networkKey, nextWithdrawalAction, selectedAccount, targetValidator]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      disabled={isLoading}
      disableRightButton={isLoading}
      title={i18n.title.withdrawStakeAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        {isNetConnected ? (
          <ScrollView
            style={{ ...ScrollViewStyle }}
            contentContainerStyle={!isTxReady ? { ...centerStyle } : undefined}>
            {isTxReady ? (
              <>
                {!!targetValidator && (
                  <AddressField
                    address={targetValidator}
                    label={i18n.withdrawStakeAction.validator}
                    showRightIcon={false}
                  />
                )}
                <AddressField address={selectedAccount} label={i18n.common.account} showRightIcon={false} />
                <BalanceField
                  value={amount.toString()}
                  decimal={0}
                  token={selectedToken}
                  si={formatBalance.findSi('-')}
                  label={i18n.withdrawStakeAction.withdrawAmount}
                />
                <BalanceField
                  value={fee}
                  decimal={0}
                  token={feeToken}
                  si={formatBalance.findSi('-')}
                  label={i18n.withdrawStakeAction.withdrawFee}
                />
                <TextField text={totalString} label={i18n.withdrawStakeAction.total} disabled={true} />
              </>
            ) : (
              <ActivityIndicator animating={true} size={'large'} />
            )}
          </ScrollView>
        ) : (
          <NoInternetScreen />
        )}
        <SigningRequest
          account={account}
          handleSignPassword={submitStakeWithdrawal}
          handleSignQr={stakeWithdrawQr}
          balanceError={balanceError}
          message={'There is problem when withdrawStake'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={submitParams}
          baseProps={{
            buttonText: i18n.common.continue,
            onCancel: goBack,
            extraLoading: !isTxReady,
          }}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(WithdrawAuth);
