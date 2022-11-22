import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { StakeClaimRewardParams } from '@subwallet/extension-base/background/KoniTypes';
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
import { ClaimAuthProps } from 'routes/staking/claimAction';
import { centerStyle, ContainerHorizontalPadding, ScrollViewStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { claimRewardQr, getStakeClaimRewardTxInfo, submitStakeClaimReward } from '../../../messaging';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { WebRunnerContext } from 'providers/contexts';
import { Warning } from 'components/Warning';
import { NoInternetScreen } from 'components/NoInternetScreen';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const ClaimAuth = ({ route: { params: claimParams } }: ClaimAuthProps) => {
  const { networkKey, selectedAccount, stakingType } = claimParams;

  const {
    signingState: { isLoading },
  } = useContext(SigningContext);
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);
  const account = useGetAccountByAddress(selectedAccount);

  const submitParams = useMemo(
    (): StakeClaimRewardParams => ({
      address: selectedAccount,
      networkKey: networkKey,
      stakingType: stakingType,
    }),
    [networkKey, selectedAccount, stakingType],
  );

  const [feeString, setFeeString] = useState('');

  const [isTxReady, setIsTxReady] = useState(false);
  const [balanceError, setBalanceError] = useState(false);

  useHandlerHardwareBackPress(isLoading);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const goBack = useGoHome({ screen: 'Staking' });

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('ClaimStakeAction', {
        screen: 'ClaimResult',
        params: {
          claimParams: claimParams,
          txParams: {
            txError: errors[0],
            extrinsicHash: extrinsicHash,
            txSuccess: false,
          },
        },
      });
    },
    [claimParams, navigation],
  );

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      navigation.navigate('ClaimStakeAction', {
        screen: 'ClaimResult',
        params: {
          claimParams: claimParams,
          txParams: {
            txError: '',
            extrinsicHash: extrinsicHash,
            txSuccess: true,
          },
        },
      });
    },
    [claimParams, navigation],
  );

  useEffect(() => {
    getStakeClaimRewardTxInfo({
      address: selectedAccount,
      networkKey: networkKey,
      stakingType: stakingType,
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
  }, [networkKey, selectedAccount, stakingType]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.claimStakeAction}
      rightButtonTitle={i18n.common.cancel}
      disabled={isLoading}
      disableRightButton={isLoading}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        {isNetConnected ? (
          <ScrollView
            style={{ ...ScrollViewStyle }}
            contentContainerStyle={!isTxReady ? { ...centerStyle } : undefined}>
            {isTxReady ? (
              <>
                <AddressField address={selectedAccount} label={i18n.common.account} showRightIcon={false} />
                <BalanceField
                  value={fee}
                  decimal={0}
                  token={feeToken}
                  si={formatBalance.findSi('-')}
                  label={i18n.claimStakeAction.claimFee}
                />
                <TextField text={feeString} label={i18n.withdrawStakeAction.total} disabled={true} />

                {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
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
          handleSignPassword={submitStakeClaimReward}
          handleSignQr={claimRewardQr}
          balanceError={balanceError}
          message={'There is problem when claimReward'}
          network={network}
          onFail={onFail}
          onSuccess={onSuccess}
          params={submitParams}
          detailError={true}
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

export default React.memo(ClaimAuth);
