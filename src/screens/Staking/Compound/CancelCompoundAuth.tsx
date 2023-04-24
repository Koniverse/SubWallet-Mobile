import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { StakingType, TuringCancelStakeCompoundParams } from '@subwallet/extension-base/background/KoniTypes';
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
import { CancelCompoundAuthProps } from 'routes/staking/compoundAction';
import { ContainerHorizontalPadding, ScrollViewStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { cancelCompoundQr, submitTuringCancelStakeCompounding } from 'messaging/index';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const CancelCompoundAuth = ({
  route: {
    params: { compoundParams, feeString, taskId, validator, balanceError },
  },
  navigation: { goBack },
}: CancelCompoundAuthProps) => {
  const { networkKey, selectedAccount } = compoundParams;

  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const {
    signingState: { isLoading },
  } = useContext(SigningContext);

  const navigation = useNavigation<RootNavigationProps>();

  const validatorLabel = useGetValidatorLabel(networkKey);
  const network = useGetNetworkJson(networkKey);
  const account = useGetAccountByAddress(selectedAccount);

  const submitParams = useMemo(
    (): TuringCancelStakeCompoundParams => ({
      address: selectedAccount,
      taskId: taskId,
      networkKey: networkKey,
    }),
    [networkKey, selectedAccount, taskId],
  );

  useHandlerHardwareBackPress(isLoading);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const onCancel = useGoHome({
    screen: 'Staking',
    params: { screen: 'StakingBalanceDetail', params: { networkKey: networkKey, stakingType: StakingType.NOMINATED } },
  });

  const onFail = useCallback(
    (errors: string[], extrinsicHash?: string) => {
      navigation.navigate('CompoundStakeAction', {
        screen: 'CancelCompoundResult',
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

  const onSuccess = useCallback(
    (extrinsicHash: string) => {
      navigation.navigate('CompoundStakeAction', {
        screen: 'CancelCompoundResult',
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

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      disabled={isLoading}
      disableRightButton={isLoading}
      title={i18n.title.cancelCompoundTask}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={onCancel}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          {!!validator && <TextField text={toShort(validator)} label={validatorLabel} disabled={true} />}
          <AddressField address={selectedAccount} label={i18n.common.account} showRightIcon={false} />
          <TextField text={toShort(taskId)} label={i18n.compoundStakeAction.taskId} disabled={true} />
          <BalanceField
            value={fee}
            decimal={0}
            token={feeToken}
            si={formatBalance.findSi('-')}
            label={i18n.compoundStakeAction.transactionFee}
          />
          <TextField text={feeString} label={i18n.unStakeAction.total} disabled={true} />

          {!isNetConnected && <Warning isDanger message={i18n.warningMessage.noInternetMessage} />}
        </ScrollView>
        <SigningRequest
          account={account}
          handleSignPassword={submitTuringCancelStakeCompounding}
          handleSignQr={cancelCompoundQr}
          balanceError={balanceError}
          message={'There is problem when cancelCompoundRequest'}
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

export default React.memo(CancelCompoundAuth);
