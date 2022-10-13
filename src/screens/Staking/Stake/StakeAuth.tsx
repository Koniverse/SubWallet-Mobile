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
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { StakeAuthProps } from 'routes/staking/stakeAction';
import ValidatorBriefInfo from 'components/Staking/ValidatorBriefInfo';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import { BN_TEN } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getBalanceWithSi } from 'utils/index';
import { handleBasicTxResponse } from 'utils/transactionResponse';
import { submitBonding } from '../../../messaging';
import useGoHome from 'hooks/screen/useGoHome';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  paddingTop: 16,
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

type TransactionResult = {
  hash: string;
  isSuccess: boolean;
};

const StakeAuth = ({
  route: {
    params: { stakeParams, feeString, amount: rawAmount, amountSi },
  },
  navigation: { goBack },
}: StakeAuthProps) => {
  const { validator, networkKey, networkValidatorsInfo, selectedAccount } = stakeParams;
  const { isBondedBefore, bondedValidators } = networkValidatorsInfo;

  const navigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);

  const [visible, setVisible] = useState(false);
  const [unmountModal, setUnmountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

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
  }, [amountValue, feeString, amountToken]);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const onCancel = useGoHome({ screen: 'Staking' });

  const handleBondingResponse = useCallback((data: BasicTxResponse) => {
    const stop = handleBasicTxResponse(data, false, setError, setLoading);
    if (stop) {
      return;
    }

    if (data.status !== undefined) {
      setLoading(false);
      setUnmountModal(true);

      setTransactionResult({
        hash: data.transactionHash as string,
        isSuccess: data.status,
      });
    }
  }, []);

  const onSubmit = useCallback(
    (password: string) => {
      setLoading(true);
      submitBonding(
        {
          networkKey: networkKey,
          nominatorAddress: selectedAccount,
          amount,
          validatorInfo: validator,
          password,
          isBondedBefore,
          bondedValidators,
        },
        handleBondingResponse,
      ).catch(e => {
        console.log(e);
        setLoading(false);
      });
    },
    [amount, bondedValidators, selectedAccount, handleBondingResponse, isBondedBefore, networkKey, validator],
  );

  useEffect(() => {
    if (transactionResult) {
      navigation.replace('StakeAction', {
        screen: 'StakeResult',
        params: {
          stakeParams: stakeParams,
          txParams: {
            txError: transactionResult.isSuccess ? '' : 'Error submitting transaction',
            extrinsicHash: transactionResult.hash,
            txSuccess: transactionResult.isSuccess,
          },
        },
      });
    }
  }, [transactionResult, navigation, stakeParams]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
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
        {!unmountModal && (
          <PasswordModal
            onConfirm={onSubmit}
            visible={visible}
            closeModal={handleClose}
            isBusy={loading}
            error={error}
            setError={setError}
          />
        )}
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(StakeAuth);
