import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import PasswordModal from 'components/Modal/PasswordModal';
import { SubmitButton } from 'components/SubmitButton';
import useGetValidatorLabel from 'hooks/screen/Staking/useGetValidatorLabel';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { CancelCompoundAuthProps } from 'routes/staking/compoundAction';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { handleBasicTxResponse } from 'utils/transactionResponse';
import { submitTuringCancelStakeCompounding } from '../../../messaging';
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
    params: { compoundParams, feeString, taskId, validator, balanceError },
  },
  navigation: { goBack },
}: CancelCompoundAuthProps) => {
  const { networkKey, selectedAccount } = compoundParams;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const navigation = useNavigation<RootNavigationProps>();

  const validatorLabel = useGetValidatorLabel(networkKey);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);

  useHandlerHardwareBackPress(loading);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

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
            screen: 'CancelCompoundResult',
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
            screen: 'CancelCompoundResult',
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
      submitTuringCancelStakeCompounding(
        {
          address: selectedAccount,
          password,
          taskId,
          networkKey,
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
    [handleResponse, networkKey, selectedAccount, taskId],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
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

          {!isNetConnected && <Warning isDanger message={'No Internet connection. Please try again later'} />}
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
