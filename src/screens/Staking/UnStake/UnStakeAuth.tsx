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
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { UnStakeAuthProps } from 'routes/staking/unStakeAction';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getBalanceWithSi, toShort } from 'utils/index';
import { handleBasicTxResponse } from 'utils/transactionResponse';
import { submitUnbonding } from '../../../messaging';
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

const UnStakeAuth = ({
  route: {
    params: { unStakeParams, feeString, amount: rawAmount, validator, balanceError, unstakeAll, amountSi },
  },
  navigation: { goBack },
}: UnStakeAuthProps) => {
  const { networkKey, selectedAccount } = unStakeParams;

  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);
  const validatorLabel = useGetValidatorLabel(networkKey);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  useHandlerHardwareBackPress(loading);
  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);
  const amount = useMemo(
    (): number => new BigN(rawAmount).div(BN_TEN.pow(network.decimals || 0)).toNumber(),
    [network.decimals, rawAmount],
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
      const stop = handleBasicTxResponse(data, balanceError, setError, setLoading);
      if (stop) {
        return;
      }

      if (data.status) {
        setLoading(false);
        setVisible(false);

        if (data.status) {
          navigation.navigate('UnStakeAction', {
            screen: 'UnStakeResult',
            params: {
              unStakeParams: unStakeParams,
              txParams: {
                txError: '',
                extrinsicHash: data.transactionHash as string,
                txSuccess: true,
              },
            },
          });
        } else {
          navigation.navigate('UnStakeAction', {
            screen: 'UnStakeResult',
            params: {
              unStakeParams: unStakeParams,
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
    [balanceError, navigation, unStakeParams],
  );

  const onSubmit = useCallback(
    (password: string) => {
      setLoading(true);
      submitUnbonding(
        {
          networkKey: networkKey,
          address: selectedAccount,
          amount: amount / 10 ** (network.decimals || 0),
          password,
          unstakeAll: unstakeAll,
          validatorAddress: validator,
        },
        handleResponse,
      ).catch(e => {
        console.log(e);
        setLoading(false);
      });
    },
    [amount, validator, handleResponse, network.decimals, networkKey, selectedAccount, unstakeAll],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.unStakeAction}
      rightButtonTitle={i18n.common.cancel}
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
          error={error}
          setError={setError}
        />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(UnStakeAuth);
