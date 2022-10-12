import { formatBalance } from '@polkadot/util';
import { useNavigation } from '@react-navigation/native';
import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { BalanceField } from 'components/Field/Balance';
import { TextField } from 'components/Field/Text';
import PasswordModal from 'components/Modal/PasswordModal';
import { SubmitButton } from 'components/SubmitButton';
import useGetValidatorType from 'hooks/screen/Home/Staking/useGetValidatorType';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { HomeNavigationProps } from 'routes/home';
import { RootNavigationProps } from 'routes/index';
import { UnStakeAuthProps } from 'routes/staking/unStakeAction';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, ScrollViewStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { submitUnbonding } from '../../../messaging';

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

const UnStakeAuth = ({
  route: {
    params: { unStakeParams, feeString, amount, validator, balanceError, unstakeAll },
  },
}: UnStakeAuthProps) => {
  const { networkKey, selectedAccount } = unStakeParams;

  const homeNavigation = useNavigation<HomeNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const network = useGetNetworkJson(networkKey);
  const validatorType = useGetValidatorType(networkKey);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const validatorLabel = useMemo((): string => {
    switch (validatorType) {
      case 'Collator':
        return i18n.common.collator;
      case 'DApp':
        return i18n.common.dApp;
      case 'Validator':
      case 'Unknown':
      default:
        return i18n.common.validator;
    }
  }, [validatorType]);

  const [fee, feeToken] = useMemo((): [string, string] => {
    const res = feeString.split(' ');
    return [res[0], res[1]];
  }, [feeString]);

  const totalString = useMemo((): string => {
    return `${amount / 10 ** (network.decimals || 0)} ${selectedToken} + ${feeString}`;
  }, [amount, feeString, network.decimals, selectedToken]);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const goBack = useCallback(() => {
    rootNavigation.navigate('UnStakeAction', { screen: 'UnStakeConfirm', params: unStakeParams });
  }, [rootNavigation, unStakeParams]);

  const onCancel = useCallback(() => {
    homeNavigation.navigate('Staking');
  }, [homeNavigation]);

  const handleResponse = useCallback(
    (data: BasicTxResponse) => {
      if (balanceError) {
        setError('Your balance is too low to cover fees');
        setLoading(false);
      }

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
        setVisible(false);

        if (data.status) {
          rootNavigation.navigate('UnStakeAction', {
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
          rootNavigation.navigate('UnStakeAction', {
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
    [balanceError, rootNavigation, unStakeParams],
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
            value={amount.toString()}
            decimal={network.decimals || 0}
            token={selectedToken}
            si={formatBalance.findSi('-')}
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
