import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import PasswordModal from 'components/Modal/PasswordModal';
import { SubmitButton } from 'components/SubmitButton';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { HomeNavigationProps } from 'routes/home';
import { StakeActionNavigationProps, StakeAuthProps } from 'routes/staking/stakeAction';
import ValidatorBriefInfo from 'screens/Staking/Stake/ValidatorBriefInfo';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { submitBonding } from '../../../messaging';

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
  ...MarginBottomForSubmitButton,
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 4,
  flex: 1,
};

const StakeAuth = ({
  route: {
    params: { stakeParams, feeString, amount },
  },
}: StakeAuthProps) => {
  const { validator, networkKey, networkValidatorsInfo } = stakeParams;
  const { isBondedBefore, bondedValidators } = networkValidatorsInfo;

  const homeNavigation = useNavigation<HomeNavigationProps>();
  const stakeActionNavigation = useNavigation<StakeActionNavigationProps>();

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const network = useGetNetworkJson(networkKey);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const totalString = useMemo((): string => {
    return `${amount} ${selectedToken} + ${feeString}`;
  }, [amount, feeString, selectedToken]);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const goBack = useCallback(() => {
    stakeActionNavigation.navigate('StakeConfirm', stakeParams);
  }, [stakeActionNavigation, stakeParams]);

  const onCancel = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleBondingResponse = useCallback(
    (data: BasicTxResponse) => {
      if (data.passwordError) {
        setError(data.passwordError);
        setLoading(false);
      }

      if (data.txError) {
        setError('Encountered an error, please try again.');
        setLoading(false);
        return;
      }

      if (data.status) {
        setLoading(false);

        if (data.status) {
          stakeActionNavigation.navigate('StakeResult', {
            stakeParams: stakeParams,
            txError: '',
            extrinsicHash: data.transactionHash as string,
            txSuccess: true,
          });
        } else {
          stakeActionNavigation.navigate('StakeResult', {
            stakeParams: stakeParams,
            txError: 'Error submitting transaction',
            extrinsicHash: data.transactionHash as string,
            txSuccess: false,
          });
        }
      }
    },
    [stakeActionNavigation, stakeParams],
  );

  const onSubmit = useCallback(
    (password: string) => {
      setLoading(true);
      submitBonding(
        {
          networkKey: networkKey,
          nominatorAddress: currentAccountAddress,
          amount,
          validatorInfo: validator,
          password,
          isBondedBefore,
          bondedValidators,
        },
        handleBondingResponse,
      )
        .then(handleBondingResponse)
        .catch(e => {
          console.log(e);
          setLoading(false);
        });
    },
    [amount, bondedValidators, currentAccountAddress, handleBondingResponse, isBondedBefore, networkKey, validator],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.stakingAction}
      rightButtonTitle={i18n.common.cancel}
      onPressRightIcon={onCancel}>
      <View style={ContainerStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <ValidatorBriefInfo validator={validator} rightIcon={true} />
          <AddressField address={currentAccountAddress} label={i18n.common.account} showRightIcon={false} />
          <BalanceField
            value={amount.toString()}
            decimal={0}
            token={selectedToken}
            si={formatBalance.findSi('-')}
            label={i18n.stakeAction.stakingAmount}
            color={ColorMap.light}
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

export default React.memo(StakeAuth);
