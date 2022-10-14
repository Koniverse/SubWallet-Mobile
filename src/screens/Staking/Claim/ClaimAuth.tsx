import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import PasswordModal from 'components/Modal/PasswordModal';
import { SubmitButton } from 'components/SubmitButton';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { ClaimAuthProps } from 'routes/staking/claimAction';
import { ColorMap } from 'styles/color';
import {
  centerStyle,
  ContainerHorizontalPadding,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
} from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { handleBasicTxResponse } from 'utils/transactionResponse';
import { getStakeClaimRewardTxInfo, submitStakeClaimReward } from '../../../messaging';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';

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

const ClaimAuth = ({ route: { params: claimParams } }: ClaimAuthProps) => {
  const { networkKey, selectedAccount } = claimParams;

  const navigation = useNavigation<RootNavigationProps>();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [feeString, setFeeString] = useState('');

  const [isTxReady, setIsTxReady] = useState(false);
  const [balanceError, setBalanceError] = useState(false);
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

  const goBack = useGoHome({ screen: 'Staking' });

  const handleResponse = useCallback(
    (data: BasicTxResponse) => {
      const stop = handleBasicTxResponse(data, balanceError, setError, setLoading);
      if (stop) {
        return;
      }

      if (data.status !== undefined) {
        setLoading(false);
        setVisible(false);

        if (data.status) {
          navigation.navigate('ClaimStakeAction', {
            screen: 'ClaimResult',
            params: {
              claimParams: claimParams,
              txParams: {
                txError: '',
                extrinsicHash: data.transactionHash as string,
                txSuccess: true,
              },
            },
          });
        } else {
          navigation.navigate('ClaimStakeAction', {
            screen: 'ClaimResult',
            params: {
              claimParams: claimParams,
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
    [balanceError, navigation, claimParams],
  );

  const onSubmit = useCallback(
    (password: string) => {
      setLoading(true);
      submitStakeClaimReward(
        {
          address: selectedAccount,
          networkKey,
          password,
        },
        handleResponse,
      ).catch(e => {
        console.log(e);
        setError((e as Error).message);
        setLoading(false);
      });
    },
    [handleResponse, networkKey, selectedAccount],
  );

  useEffect(() => {
    getStakeClaimRewardTxInfo({
      address: selectedAccount,
      networkKey,
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
  }, [networkKey, selectedAccount]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.claimStakeAction}
      rightButtonTitle={i18n.common.cancel}
      disabled={loading}
      disableRightButton={loading}
      onPressRightIcon={goBack}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }} contentContainerStyle={!isTxReady ? { ...centerStyle } : undefined}>
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
            </>
          ) : (
            <ActivityIndicator animating={true} size={'large'} />
          )}
        </ScrollView>
        <View style={ActionContainerStyle}>
          <SubmitButton
            title={i18n.common.cancel}
            style={ButtonStyle}
            backgroundColor={ColorMap.dark2}
            onPress={goBack}
          />
          <SubmitButton isBusy={!isTxReady} title={i18n.common.continue} style={ButtonStyle} onPress={handleOpen} />
        </View>
        <PasswordModal
          onConfirm={onSubmit}
          visible={visible}
          closeModal={handleClose}
          isBusy={loading}
          error={error}
          setError={setError}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ClaimAuth);
