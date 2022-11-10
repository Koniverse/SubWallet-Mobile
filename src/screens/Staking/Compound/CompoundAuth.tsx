import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import PasswordModal from 'components/Modal/PasswordModal';
import { SubmitButton } from 'components/SubmitButton';
import useGetValidatorLabel from 'hooks/screen/Staking/useGetValidatorLabel';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import moment from 'moment';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { CompoundAuthProps } from 'routes/staking/compoundAction';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { handleBasicTxResponse } from 'utils/transactionResponse';
import { submitTuringStakeCompounding } from '../../../messaging';
import { WebRunnerContext } from 'providers/contexts';
import { Warning } from 'components/Warning';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  paddingTop: 16,
  flex: 1,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: -4,
  paddingTop: 16,
  ...MarginBottomForSubmitButton,
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 4,
  flex: 1,
};

const CompoundAuth = ({
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
}: CompoundAuthProps) => {
  const { networkKey, selectedAccount } = compoundParams;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);
  const validatorLabel = useGetValidatorLabel(networkKey);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);

  useHandlerHardwareBackPress(loading);

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const [compoundFee, compoundFeeToken] = useMemo((): [string, string] => {
    const res = compoundString.split(' ');
    return [res[0], res[1]];
  }, [compoundString]);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const onCancel = useGoHome({
    screen: 'Staking',
    params: { screen: 'StakingBalanceDetail', params: { networkKey: networkKey } },
  });

  const handleResponse = useCallback(
    (data: BasicTxResponse) => {
      const stop = handleBasicTxResponse(data, balanceError, setErrorArr, setLoading);
      if (stop) {
        return;
      }

      if (data.status) {
        setLoading(false);
        setVisible(false);

        if (data.status) {
          navigation.navigate('CompoundStakeAction', {
            screen: 'CompoundResult',
            params: {
              compoundParams: compoundParams,
              txParams: {
                txError: '',
                extrinsicHash: data.transactionHash as string,
                txSuccess: true,
              },
            },
          });
        } else {
          navigation.navigate('CompoundStakeAction', {
            screen: 'CompoundResult',
            params: {
              compoundParams: compoundParams,
              txParams: {
                txError: 'Error submitting transaction',
                extrinsicHash: data.transactionHash as string,
                txSuccess: false,
              },
            },
          });
        }
      }
    },
    [balanceError, compoundParams, navigation],
  );

  const onSubmit = useCallback(
    (password: string) => {
      setLoading(true);
      const _minimum = new BigN(accountMinimum).div(BN_TEN.pow(network.decimals || 0)).toString();
      submitTuringStakeCompounding(
        {
          address: selectedAccount,
          accountMinimum: _minimum,
          password: password,
          collatorAddress: validator,
          networkKey: networkKey,
          bondedAmount: bondedAmount,
        },
        handleResponse,
      )
        .then(handleResponse)
        .catch(e => {
          console.log(e);
          setErrorArr([(e as Error).message]);
          setLoading(false);
        });
    },
    [accountMinimum, bondedAmount, handleResponse, network.decimals, networkKey, selectedAccount, validator],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
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
        <View style={ActionContainerStyle}>
          <SubmitButton
            title={i18n.common.cancel}
            style={ButtonStyle}
            backgroundColor={ColorMap.dark2}
            onPress={goBack}
          />
          <SubmitButton
            // isBusy={loading}
            disabled={!isNetConnected}
            title={i18n.common.continue}
            style={ButtonStyle}
            onPress={handleOpen}
          />
        </View>
        <PasswordModal
          onConfirm={onSubmit}
          visible={visible}
          closeModal={handleClose}
          isBusy={loading}
          errorArr={errorArr}
          setErrorArr={setErrorArr}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(CompoundAuth);
